import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
import Stripe from 'npm:stripe@14.25.0';

const project = 'https://kbkdfpmlyggfijkyjxoi.supabase.co';
const allowedOrigin = /^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev$/;

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? '';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Vary': 'Origin',
  };
  const reply = (body: unknown, status = 200) =>
    Response.json(body, { status, headers });

  if (!allowedOrigin.test(origin)) return new Response(null, { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);

  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  if (Deno.env.get('SUPABASE_URL') !== project || !key.startsWith('sk_test_')) {
    return reply({ error: 'Staging payments are unavailable.' }, 503);
  }

  try {
    const db = createClient(project, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { persistSession: false },
    });
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return reply({ error: 'Please sign in.' }, 401);
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return reply({ error: 'Please sign in.' }, 401);

    const body = await request.json().catch(() => null);
    if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(body?.booking_id ?? '') ||
        !['preview', 'refund'].includes(body?.action)) {
      return reply({ error: 'Invalid refund request.' }, 400);
    }
    const { data: booking, error: bookingError } = await db.from('bookings')
      .select('id,listing_id,status,stripe_payment_intent')
      .eq('id', body.booking_id).maybeSingle();
    if (bookingError) throw bookingError;
    if (!booking) return reply({ error: 'Reservation not found.' }, 404);
    const { data: listing, error: listingError } = await db.from('listings')
      .select('id').eq('id', booking.listing_id).eq('owner_id', user.id).maybeSingle();
    if (listingError) throw listingError;
    if (!listing) return reply({ error: 'Reservation not found.' }, 404);
    if (booking.status !== 'confirmed' || !booking.stripe_payment_intent) {
      return reply({ error: 'Only confirmed, paid reservations qualify.' }, 409);
    }

    const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
    const intent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent, {
      expand: ['latest_charge'],
    });
    const charge = intent.latest_charge as Stripe.Charge | null;
    if (intent.livemode || !charge || charge.livemode || !charge.captured ||
        intent.status !== 'succeeded' || charge.currency !== 'usd') {
      return reply({ error: 'No eligible captured Stripe test payment.' }, 409);
    }

    const refundKey = 'leasewild-landowner-partial-' + booking.id;
    const refunds = await stripe.refunds.list({ charge: charge.id, limit: 100 });
    if (refunds.has_more) return reply({ error: 'Refund history requires review.' }, 409);
    const previous = refunds.data.find((refund) => refund.metadata?.request_key === refundKey);
    const report = async (refund?: Stripe.Refund) => {
      const current = await stripe.charges.retrieve(charge.id);
      if (refund) {
        const { error: recordError } = await db.from('booking_partial_refunds').upsert({
          booking_id: booking.id,
          requested_by: user.id,
          stripe_payment_intent: intent.id,
          stripe_refund_id: refund.id,
          amount_cents: refund.amount,
          currency: refund.currency,
          status: refund.status ?? 'pending',
          captured_amount_cents: current.amount_captured,
          refunded_amount_cents: current.amount_refunded,
          remaining_paid_cents: current.amount_captured - current.amount_refunded,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'booking_id' });
        if (recordError) throw recordError;
      }
      return reply({
        refund_id: refund?.id ?? null,
        refund_status: refund?.status ?? null,
        refund_amount: refund?.amount ?? null,
        refunded_amount: current.amount_refunded,
        remaining_paid: current.amount_captured - current.amount_refunded,
      });
    };
    if (body.action === 'preview') return await report(previous);
    const amount = body.amount_cents;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return reply({ error: 'Enter a positive amount in cents.' }, 400);
    }
    if (previous) {
      return previous.amount === amount ? await report(previous) :
        reply({ error: 'This reservation already has a landowner partial refund.' }, 409);
    }
    if (charge.amount_refunded || refunds.data.length || amount >= charge.amount_captured) {
      return reply({ error: 'Enter an amount below the captured payment. Payments with existing refunds require review.' }, 409);
    }

    const refund = await stripe.refunds.create({
      charge: charge.id,
      amount,
      metadata: { booking_id: booking.id, request_key: refundKey },
      ...(intent.transfer_data?.destination ? { reverse_transfer: true, refund_application_fee: true } : {}),
    }, { idempotencyKey: refundKey });
    return await report(refund);
  } catch (error) {
    console.error('Partial refund request failed', error instanceof Error ? error.message : 'Unknown error');
    return reply({ error: 'Unable to confirm the refund. Refresh the reservation before trying again.' }, 502);
  }
});
