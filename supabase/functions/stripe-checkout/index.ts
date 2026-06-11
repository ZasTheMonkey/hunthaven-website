import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const SUPABASE_URL = Deno.env.get('SB_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SB_SERVICE_KEY') ?? '';
const PLATFORM_FEE_PCT = 0.20; // LeaseWild takes 20% from landowner payout

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      booking_id,
      amount_cents,
      description,
      checkin,
      checkout,
      nights,
      listing_title,
      success_url,
      cancel_url,
    } = body;

    if (!booking_id || !amount_cents || !success_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up the booking to get listing_id and landowner stripe account
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: booking, error: bookingErr } = await sb
      .from('bookings')
      .select('id, listing_id, rate_per_night, nights, cleaning_fee, trip_protection, total')
      .eq('id', booking_id)
      .single();

    if (bookingErr || !booking) {
      throw new Error('Booking not found: ' + (bookingErr?.message ?? ''));
    }

    // Get listing to find landowner's stripe account
    const { data: listing, error: listingErr } = await sb
      .from('listings')
      .select('id, stripe_account_id, email')
      .eq('id', booking.listing_id)
      .single();

    if (listingErr || !listing) {
      throw new Error('Listing not found: ' + (listingErr?.message ?? ''));
    }

    // Calculate platform fee (20% of booking subtotal, not including trip protection)
    const bookingSubtotal = (booking.rate_per_night * booking.nights) + (booking.cleaning_fee || 0);
    const platformFeeCents = Math.round(bookingSubtotal * PLATFORM_FEE_PCT * 100);

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing_title || 'LeaseWild Booking',
            description: description || `${nights} night${nights !== 1 ? 's' : ''} (${checkin} – ${checkout})`,
          },
          unit_amount: amount_cents,
        },
        quantity: 1,
      },
    ];

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      success_url: success_url + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancel_url,
      metadata: {
        booking_id: String(booking_id),
        listing_id: String(booking.listing_id),
        checkin: checkin ?? '',
        checkout: checkout ?? '',
        nights: String(nights ?? ''),
      },
    };

    // If landowner has a connected Stripe account, use destination charge
    if (listing.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: listing.stripe_account_id,
        },
      };
    }
    // If no connected account yet, funds go to LeaseWild platform account
    // and will be manually transferred later

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update booking with Stripe session ID
    await sb
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking_id);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('stripe-checkout error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
