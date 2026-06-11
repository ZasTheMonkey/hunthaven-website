import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
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
