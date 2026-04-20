import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STRIPE_CLIENT_ID = "ca_UN46aJEruC3JhhWoXX0YmfFgux6wrEoK";
const REDIRECT_URI = "https://teohfzegpoxzimfsmviy.supabase.co/functions/v1/stripe-connect-callback";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { user_id, email } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400, headers: corsHeaders });

    // State encodes user_id so we can save it on callback
    const state = btoa(JSON.stringify({ user_id, email }));

    const url = new URL("https://connect.stripe.com/oauth/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", STRIPE_CLIENT_ID);
    url.searchParams.set("scope", "read_write");
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("state", state);
    url.searchParams.set("stripe_user[email]", email || "");
    url.searchParams.set("stripe_user[business_type]", "individual");
    url.searchParams.set("stripe_user[country]", "US");
    url.searchParams.set("stripe_user[currency]", "usd");

    return new Response(JSON.stringify({ url: url.toString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
