import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const canonicalOrigin = 'https://leasewild-sandbox.pages.dev';
const originPattern = /^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const allowed = originPattern.test(origin);
  const headers = { ...baseHeaders, ...(allowed ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}) };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

  if (req.method === 'OPTIONS') return new Response('', { headers });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  if (!allowed) return reply({ error: 'Sandbox origin only' }, 403);

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  if (!stripeKey.startsWith('sk_test_')) {
    return reply({ error: 'Sandbox Stripe test secret is not configured. Checkout disabled.' }, 503);
  }
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const url = Deno.env.get('SUPABASE_URL') || '';
  if (!serviceKey || !url) return reply({ error: 'Sandbox database credentials missing' }, 503);

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  if (!token) return reply({ error: 'Sign in to sandbox hunter account before booking' }, 401);
  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user?.email) return reply({ error: 'Please sign in again' }, 401);

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return reply({ error: 'Invalid request' }, 400);
  }

  const { listing_id, check_in, check_out, guests = 1, trip_protection = false } = input;
  const requestKey = String(input.request_key || '').toLowerCase();
  if (input.action !== 'request') {
    return reply({ error: 'Landowner approval is required. Submit a booking request first.' }, 409);
  }
  if (!uuidPattern.test(requestKey)) return reply({ error: 'Invalid checkout request key' }, 400);
  if (!uuidPattern.test(String(listing_id))) return reply({ error: 'Invalid property' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(check_in)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(check_out))) {
    return reply({ error: 'Invalid dates' }, 400);
  }

  const start = Date.parse(check_in + 'T00:00:00Z');
  const end = Date.parse(check_out + 'T00:00:00Z');
  const nights = (end - start) / 86_400_000;
  const guestCount = Number(guests);
  if (!Number.isInteger(nights) || nights < 1 || nights > 90 || start < Date.now() - 86_400_000) {
    return reply({ error: 'Choose valid future dates (1–90 days)' }, 400);
  }
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    return reply({ error: 'Invalid guest count' }, 400);
  }

  const existingQuery = () => db.from('bookings')
    .select('id,listing_id,guest_email,check_in,check_out,guests,trip_protection,status,stripe_session_id')
    .eq('checkout_request_key', requestKey).maybeSingle();

  const replayExisting = async (booking: any) => {
    const matches = booking &&
      String(booking.guest_email || '').toLowerCase() === user.email!.toLowerCase() &&
      booking.listing_id === listing_id &&
      booking.check_in === check_in &&
      booking.check_out === check_out &&
      Number(booking.guests) === guestCount &&
      Number(booking.trip_protection || 0) === (trip_protection ? 18 : 0);
    if (!matches) return reply({ error: 'Checkout request key is already in use' }, 409);
    if (booking.status !== 'authorization_pending') {
      return reply({ error: 'This checkout request has already been finalized' }, 409);
    }
    if (!booking.stripe_session_id) {
      return reply({ error: 'Checkout setup is already in progress. Retry with the same request key.' }, 409);
    }
    const sessionResponse = await fetch(
      'https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(booking.stripe_session_id),
      { headers: { Authorization: 'Bearer ' + stripeKey } },
    );
    const session = await sessionResponse.json();
    if (!sessionResponse.ok || session.livemode !== false || session.status !== 'open' ||
        session.metadata?.booking_id !== booking.id || !/^https:\/\/checkout\.stripe\.com\//.test(session.url || '')) {
      return reply({ error: 'This checkout request is no longer available' }, 409);
    }
    return reply({
      booking_id: booking.id,
      url: session.url,
      status: 'authorization_pending',
      idempotent_replay: true,
      message: 'Returning the existing secure authorization. No duplicate booking was created.',
    });
  };

  const { data: existing, error: existingError } = await existingQuery();
  if (existingError) return reply({ error: 'Could not verify checkout request' }, 503);
  if (existing) return await replayExisting(existing);

  const { data: listing, error: listingError } = await db.from('listings')
    .select('id,status,owner_id,county,price_per_day,cleaning_fee,min_stay,max_guests')
    .eq('id', listing_id).single();
  if (listingError || !listing || listing.status !== 'active') return reply({ error: 'Property unavailable' }, 404);
  if (listing.owner_id === user.id) return reply({ error: 'Owners cannot book their own property' }, 403);
  if (Number(listing.min_stay || 0) > nights) return reply({ error: 'Minimum stay not met' }, 400);
  if (listing.max_guests && guestCount > Number(listing.max_guests)) return reply({ error: 'Too many guests' }, 400);

  const roster = Array.isArray(input.additional_guests) ? input.additional_guests : [];
  if (roster.length !== guestCount - 1) return reply({ error: 'Every additional guest must be listed' }, 400);
  const adultEmails = new Set<string>();
  for (const guest of roster as any[]) {
    if (!guest || typeof guest.full_name !== 'string' || guest.full_name.trim().length < 3 || guest.full_name.length > 120) {
      return reply({ error: 'Additional guest full name required' }, 400);
    }
    if (typeof guest.is_minor !== 'boolean') return reply({ error: 'Guest age category required' }, 400);
    if (guest.is_minor) {
      if (guest.email || guest.adult_supervision_confirmed !== true) {
        return reply({ error: 'Minors require adult supervision and must not provide an email' }, 400);
      }
    } else {
      const email = String(guest.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || adultEmails.has(email) || email === user.email.toLowerCase()) {
        return reply({ error: 'Each additional adult needs a unique valid email' }, 400);
      }
      adultEmails.add(email);
    }
  }

  const { data: conflicts, error: conflictError } = await db.from('bookings').select('id')
    .eq('listing_id', listing.id)
    .in('status', ['confirmed', 'pre_reserved', 'pending_payment', 'authorization_pending', 'pending_approval', 'approved', 'capturing'])
    .lt('check_in', check_out).gt('check_out', check_in).limit(1);
  if (conflictError) return reply({ error: 'Availability check failed' }, 503);
  if (conflicts?.length) return reply({ error: 'Dates are unavailable' }, 409);

  const rate = Math.round(Number(listing.price_per_day) * 100);
  const cleaning = Math.round(Number(listing.cleaning_fee || 0) * 100);
  if (!Number.isSafeInteger(rate) || rate < 100 || !Number.isSafeInteger(cleaning) || cleaning < 0) {
    return reply({ error: 'Property pricing invalid' }, 400);
  }
  const lease = rate * nights;
  const protection = trip_protection ? 1800 : 0;
  const tax = Math.round(lease * .065);
  const total = lease + cleaning + protection + tax;
  if (total > 100_000_000) return reply({ error: 'Amount exceeds sandbox limit' }, 400);

  const booking = {
    listing_id: listing.id,
    guest_name: user.user_metadata?.full_name || 'Sandbox guest',
    guest_email: user.email,
    check_in,
    check_out,
    nights,
    guests: guestCount,
    rate_per_night: rate / 100,
    cleaning_fee: cleaning / 100,
    service_fee: 0,
    trip_protection: protection / 100,
    total: total / 100,
    status: 'authorization_pending',
    approval_deadline: new Date(Date.now() + 86_400_000).toISOString(),
    checkout_request_key: requestKey,
  };
  const { data: created, error: bookingError } = await db.from('bookings').insert(booking).select('id').single();
  if (bookingError) {
    if (bookingError.code === '23505') {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
        const { data: concurrent } = await existingQuery();
        if (concurrent?.stripe_session_id) return await replayExisting(concurrent);
      }
      return reply({ error: 'Checkout setup is already in progress. Retry with the same request key.' }, 409);
    }
    return reply({ error: 'Could not create test booking' }, 500);
  }

  if (roster.length) {
    const { error: guestError } = await db.from('sandbox_booking_guests').insert((roster as any[]).map(guest => ({
      booking_id: created.id,
      full_name: guest.full_name.trim(),
      is_minor: guest.is_minor,
      email: guest.is_minor ? null : guest.email.trim().toLowerCase(),
      adult_supervision_confirmed: guest.is_minor ? true : false,
      verification_status: guest.is_minor ? 'exempt_minor' : 'pending',
    })));
    if (guestError) {
      await db.from('bookings').delete().eq('id', created.id);
      return reply({ error: 'Could not securely save additional guests' }, 503);
    }
  }

  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('payment_intent_data[capture_method]', 'manual');
  form.set('success_url', canonicalOrigin + '/guest-portal.html?authorization=success&session_id={CHECKOUT_SESSION_ID}');
  form.set('cancel_url', canonicalOrigin + '/?authorization=cancelled');
  form.set('customer_email', user.email);
  form.set('client_reference_id', created.id);
  form.set('line_items[0][price_data][currency]', 'usd');
  form.set('line_items[0][price_data][product_data][name]', 'LeaseWild SANDBOX booking authorization');
  form.set('line_items[0][price_data][unit_amount]', String(total));
  form.set('line_items[0][quantity]', '1');
  form.set('metadata[booking_id]', created.id);
  form.set('metadata[sandbox]', 'true');

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + stripeKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': 'leasewild-sandbox-booking-' + requestKey,
    },
    body: form,
  });
  const session = await stripeResponse.json();
  if (!stripeResponse.ok || !session.url) {
    await db.from('bookings').update({ status: 'cancelled' }).eq('id', created.id);
    return reply({ error: 'Unable to authorize test card: ' + (session.error?.message || 'Stripe error') }, 502);
  }
  const { error: saveError } = await db.from('bookings')
    .update({ stripe_session_id: session.id }).eq('id', created.id).is('stripe_session_id', null);
  if (saveError) return reply({ error: 'Checkout was created but could not be reconciled. Retry with the same request key.' }, 503);

  return reply({
    booking_id: created.id,
    url: session.url,
    status: 'authorization_pending',
    idempotent_replay: false,
    message: 'Authorize your card to request this booking. No charge until landowner acceptance.',
  });
});
