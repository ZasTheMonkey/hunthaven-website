import {locked,check} from '../_shared/payments.ts';
import {processPayment} from '../_shared/deposit-lifecycle.ts';
import Stripe from 'npm:stripe@14.25.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.8';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SB_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SERVICE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return new Response(
      JSON.stringify({ error: 'Invalid signature' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const meta = (event.data.object as any).metadata || {};
  const paymentId = meta.lease_payment_id || meta.cleaning_payment_id;
  if (paymentId) {
    try {
      await locked(paymentId, async (row) => {
        // Match the object to the stored session; never trust metadata alone.
        if (event.type.startsWith('checkout.session.') &&
            ![row.checkout_session_id,row.recovery_session_id].includes((event.data.object as any).id)) throw new Error('Session mismatch');
        await processPayment(row);
      });
      return new Response(JSON.stringify({received:true}),{headers:{'Content-Type':'application/json'}});
    } catch(error) {
      console.error('Payment webhook retry required',error);
      return new Response('Retry required',{status:500});
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId && session.payment_status === 'paid') {
      // Mark booking as confirmed and store payment details
      await sb
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_payment_intent: session.payment_intent as string,
          guest_email: session.customer_details?.email ?? null,
          guest_name: session.customer_details?.name ?? null,
        })
        .eq('id', bookingId);

      console.log('Booking confirmed:', bookingId);
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      await sb
        .from('bookings')
        .update({ status: 'expired' })
        .eq('id', bookingId);
    }
  }

  return new Response(
    JSON.stringify({ received: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
