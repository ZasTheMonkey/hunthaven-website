import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
import Stripe from 'npm:stripe@14.25.0';

const sandboxOrigin = 'https://leasewild-sandbox.pages.dev';
const headers = {
  'Access-Control-Allow-Origin': sandboxOrigin,
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { headers });
  if (request.method !== 'POST' || request.headers.get('origin') !== sandboxOrigin) {
    return respond({ error: 'Sandbox origin required' }, 403);
  }
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const url = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!stripeKey.startsWith('sk_test_') || !url || !serviceKey) {
    return respond({ error: 'Sandbox reconciliation unavailable' }, 503);
  }
  const database = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = (request.headers.get('authorization') || '').replace(/^Bearer /i, '');
  const { data: { user }, error: authError } = await database.auth.getUser(token);
  if (authError || !user?.email) return respond({ error: 'Sign in required' }, 401);

  let input: { booking_id?: string; session_id?: string };
  try {
    input = await request.json();
  } catch {
    return respond({ error: 'Invalid request' }, 400);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(input.booking_id || '')) ||
      !/^cs_test_[A-Za-z0-9]+$/.test(String(input.session_id || ''))) {
    return respond({ error: 'Invalid booking or session' }, 400);
  }

  const { data: booking, error: bookingError } = await database.from('bookings')
    .select('id,listing_id,guest_email,total,status,stripe_session_id,stripe_payment_intent')
    .eq('id', input.booking_id).eq('stripe_session_id', input.session_id).maybeSingle();
  if (bookingError || !booking || booking.guest_email.toLowerCase() !== user.email.toLowerCase()) {
    return respond({ error: 'Booking not found' }, 404);
  }
  if (booking.status === 'pending_approval') {
    return respond({ booking: { id: booking.id, status: booking.status }, already_reconciled: true });
  }
  if (booking.status !== 'authorization_pending') {
    return respond({ error: 'Booking is not awaiting authorization reconciliation' }, 409);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const session = await stripe.checkout.sessions.retrieve(input.session_id);
  if (session.livemode || session.id !== booking.stripe_session_id ||
      session.metadata?.booking_id !== booking.id || session.client_reference_id !== booking.id ||
      session.payment_status !== 'unpaid' || session.amount_total !== Math.round(Number(booking.total) * 100)) {
    return respond({ error: 'Stripe authorization could not be verified' }, 409);
  }
  if (session.status === 'open' && !session.payment_intent) {
    return respond({ booking: { id: booking.id, status: booking.status }, stripe_status: 'checkout_open' }, 202);
  }
  if (!session.payment_intent) {
    return respond({ error: 'Stripe authorization is no longer active' }, 409);
  }
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.livemode || intent.capture_method !== 'manual' ||
      intent.amount !== Math.round(Number(booking.total) * 100)) {
    return respond({ error: 'Card authorization is not ready for approval' }, 409);
  }
  if (['requires_action', 'processing', 'requires_confirmation'].includes(intent.status)) {
    return respond({ booking: { id: booking.id, status: booking.status }, stripe_status: intent.status }, 202);
  }
  if (intent.status !== 'requires_capture') {
    return respond({ error: 'Card authorization is not ready for approval' }, 409);
  }
  if (session.status === 'open') {
    return respond({ booking: { id: booking.id, status: booking.status }, stripe_status: 'checkout_open' }, 202);
  }
  if (session.status !== 'complete') {
    return respond({ error: 'Stripe authorization is no longer active' }, 409);
  }
  if (intent.amount_capturable !== Math.round(Number(booking.total) * 100)) {
    return respond({ error: 'Card authorization is not ready for approval' }, 409);
  }

  const { data: updated, error: updateError } = await database.from('bookings').update({
    status: 'pending_approval', stripe_payment_intent: intent.id, authorization_created_at: new Date().toISOString(),
  }).eq('id', booking.id).eq('status', 'authorization_pending').select('id,status').maybeSingle();
  if (updateError || !updated) return respond({ error: 'Booking reconciliation raced another update' }, 409);

  const { data: owner } = await database.from('listings').select('email').eq('id', booking.listing_id).maybeSingle();
  if (owner?.email) {
    const { error: queueError } = await database.from('sandbox_booking_email_outbox').upsert({
      booking_id: booking.id,
      event_type: 'owner_booking_request',
      recipient_email: String(owner.email).trim().toLowerCase(),
    }, { onConflict: 'booking_id,event_type,recipient_email', ignoreDuplicates: true });
    if (queueError) console.error('Owner booking notification enqueue failed', queueError.code);
  }
  const { data: adultGuests } = await database.from('sandbox_booking_guests')
    .select('id,email').eq('booking_id', booking.id).eq('is_minor', false);
  for (const guest of adultGuests || []) {
    if (!guest.email) continue;
    const { error: inviteError } = await database.from('sandbox_booking_email_outbox').upsert({
      booking_id: booking.id,
      guest_id: guest.id,
      event_type: 'adult_guest_id_invite',
      recipient_email: String(guest.email).trim().toLowerCase(),
    }, { onConflict: 'booking_id,event_type,recipient_email', ignoreDuplicates: true });
    if (inviteError) console.error('Guest invitation enqueue failed', inviteError.code);
  }
  return respond({ booking: updated, reconciled_from: 'verified_stripe_test_session' });
});
