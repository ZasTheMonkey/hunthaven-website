import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Keys loaded from Supabase Edge Function secrets (set via: supabase secrets set)
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://teohfzegpoxzimfsmviy.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    if (!booking_id || !amount_cents || amount_cents < 50) {
      return new Response(JSON.stringify({ error: "Invalid booking data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe Checkout Session
    const stripePayload = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(amount_cents),
      "line_items[0][price_data][product_data][name]": listing_title || "LeaseWild Booking",
      "line_items[0][price_data][product_data][description]": description || `${checkin} → ${checkout}`,
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": success_url,
      "cancel_url": cancel_url,
      "metadata[booking_id]": booking_id,
      "metadata[checkin]": checkin,
      "metadata[checkout]": checkout,
      "metadata[nights]": String(nights),
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripePayload.toString(),
    });

    const session = await stripeRes.json();

    if (!session.url) {
      console.error("Stripe error:", session);
      return new Response(JSON.stringify({ error: session.error?.message || "Stripe error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store the stripe session ID on the booking
    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${booking_id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ stripe_session_id: session.id }),
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
