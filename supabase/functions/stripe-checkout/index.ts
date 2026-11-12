import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

// Sandbox checkout. Never trust browser-supplied prices, account IDs or customer identities.
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' });
const sbUrl = Deno.env.get('SB_URL') ?? '';
const serviceKey = Deno.env.get('SB_SERVICE_KEY') ?? '';
const publishableKey = Deno.env.get('SB_ANON_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const PLATFORM_FEE_PCT = 0.20;
const SITE_ORIGIN = 'https://leasewild-sandbox.pages.dev';
const headers = { 'Access-Control-Allow-Origin': SITE_ORIGIN, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' };
const respond = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers });
const cents = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && Math.round(n * 100) === n * 100 ? Math.round(n * 100) : null;
};
const safeReturn = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  try {
    const url = new URL(value);
    return url.origin === SITE_ORIGIN && url.protocol === 'https:' ? url.toString() : fallback;
  } catch { return fallback; }
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return respond(405, { error: 'Method not allowed' });
  try {
    if (!sbUrl || !serviceKey || !publishableKey || !Deno.env.get('STRIPE_SECRET_KEY')) return respond(503, { error: 'Checkout configuration incomplete' });
    const token = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return respond(401, { error: 'Sign in to check out' });
    const userClient = createClient(sbUrl, publishableKey);
    const { data: auth, error: authError } = await userClient.auth.getUser(token);
    if (authError || !auth.user?.email) return respond(401, { error: 'Invalid session' });
    const body = await req.json();
    const bookingId = body?.booking_id;
    if (typeof bookingId !== 'string' || !/^[0-9a-f-]{36}$/i.test(bookingId)) return respond(400, { error: 'Invalid booking ID' });
    const db = createClient(sbUrl, serviceKey);
    const { data: booking, error: bookingError } = await db.from('bookings')
      .select('id,listing_id,guest_email,rate_per_night,nights,cleaning_fee,service_fee,trip_protection,total,discount_amt,discount_pct,status,stripe_session_id,check_in,check_out')
      .eq('id', bookingId).single();
    if (bookingError || !booking) return respond(404, { error: 'Booking not found' });
    if (!booking.guest_email || booking.guest_email.toLowerCase() !== auth.user.email.toLowerCase()) return respond(403, { error: 'Not authorized for this booking' });
    if (!['pending', 'requested', 'approved', 'accepted', 'awaiting_payment'].includes(String(booking.status).toLowerCase())) return respond(409, { error: 'Booking cannot be paid in its current status' });
    if (booking.stripe_session_id) return respond(409, { error: 'Checkout already initiated; refresh booking status' });
    const { data: listing, error: listingError } = await db.from('listings')
      .select('id,owner_id,email,price_per_day,cleaning_fee,stripe_account_id,status')
      .eq('id', booking.listing_id).single();
    if (listingError || !listing || listing.status !== 'active') return respond(409, { error: 'Listing unavailable' });
    // Fail closed for price models not yet independently verified server-side.
    const nightly = cents(listing.price_per_day);
    const nights = Number(booking.nights);
    const cleaning = cents(listing.cleaning_fee || 0);
    const bookingRate = cents(booking.rate_per_night);
    const bookingCleaning = cents(booking.cleaning_fee || 0);
    const serviceFee = cents(booking.service_fee || 0);
    const protection = cents(booking.trip_protection || 0);
    const discount = cents(booking.discount_amt || 0);
    if (!Number.isSafeInteger(nights) || nights < 1 || nights > 365 || nightly === null || nightly < 50 || cleaning === null || bookingRate !== nightly || bookingCleaning !== cleaning || serviceFee !== 0 || protection !== 0 || discount !== 0 || Number(booking.discount_pct || 0) !== 0) {
      return respond(409, { error: 'Booking pricing requires server-side review before payment' });
    }
    const subtotal = nightly * nights + cleaning;
    if (!Number.isSafeInteger(subtotal) || subtotal < 50 || cents(booking.total) !== subtotal) return respond(409, { error: 'Booking total does not match listing pricing' });
    const { data: profile } = await db.from('landowner_profiles')
      .select('stripe_account_id,stripe_charges_enabled').eq('user_id', listing.owner_id).maybeSingle();
    const destination = profile?.stripe_account_id || listing.stripe_account_id;
    if (!destination || !/^acct_[A-Za-z0-9]+$/.test(destination)) return respond(409, { error: 'Host payout account must be connected before checkout' });
    const account = await stripe.accounts.retrieve(destination);
    if (!account.charges_enabled || !account.payouts_enabled) return respond(409, { error: 'Host Stripe account is not ready for charges and payouts' });
    const fee = Math.round(subtotal * PLATFORM_FEE_PCT);
    const success = safeReturn(body.success_url, SITE_ORIGIN + '/guest-portal.html?checkout=success');
    const cancel = safeReturn(body.cancel_url, SITE_ORIGIN + '/guest-portal.html?checkout=cancelled');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: 'LeaseWild Booking' }, unit_amount: subtotal }, quantity: 1 }],
      success_url: success + (success.includes('?') ? '&' : '?') + 'session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancel,
      client_reference_id: booking.id,
      metadata: { booking_id: booking.id, listing_id: booking.listing_id, hunter_user_id: auth.user.id },
      payment_intent_data: { application_fee_amount: fee, transfer_data: { destination } },
    }, { idempotencyKey: 'sandbox-checkout-' + booking.id });
    const { error: updateError } = await db.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id).is('stripe_session_id', null);
    if (updateError) return respond(500, { error: 'Could not save checkout session' });
    return respond(200, { url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Sandbox checkout failed:', err);
    return respond(500, { error: 'Unable to start secure checkout' });
  }
});
