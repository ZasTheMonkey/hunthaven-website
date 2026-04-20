import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SITE_URL = "https://leasewild.com/landowner-portal.html";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.redirect(`${SITE_URL}?stripe_error=${error}`);
  }

  if (!code || !state) {
    return Response.redirect(`${SITE_URL}?stripe_error=missing_params`);
  }

  try {
    // Decode state to get user_id
    const { user_id, email } = JSON.parse(atob(state));

    // Exchange code for Stripe account ID
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: STRIPE_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return Response.redirect(`${SITE_URL}?stripe_error=${tokenData.error_description}`);
    }

    const stripe_account_id = tokenData.stripe_user_id;
    const charges_enabled = tokenData.stripe_publishable_key ? true : false;

    // Save to Supabase
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await sb.from("landowner_profiles").upsert({
      user_id,
      email,
      stripe_account_id,
      stripe_connected_at: new Date().toISOString(),
      stripe_charges_enabled: charges_enabled,
    }, { onConflict: "user_id" });

    return Response.redirect(`${SITE_URL}?stripe_connected=1`);
  } catch (e) {
    return Response.redirect(`${SITE_URL}?stripe_error=${encodeURIComponent(e.message)}`);
  }
});
