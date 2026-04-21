import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Use the supabase-js client with service role to call our SQL via a trick:
  // Insert a record into a table with a trigger that runs our DDL
  // OR: Use the Postgres.js client which CAN do DDL
  
  // Postgres.js works in Deno edge functions and can run raw SQL including DDL
  const { Pool } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
  
  const dbUrl = Deno.env.get("SUPABASE_DB_URL") ?? "";
  
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "No SUPABASE_DB_URL env var", vars: Object.keys(Deno.env.toObject()).filter(k => k.includes('SUPA')) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  const pool = new Pool(dbUrl, 1);
  const conn = await pool.connect();
  
  try {
    await conn.queryObject(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude double precision`);
    await conn.queryObject(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude double precision`);
    await conn.queryObject(`UPDATE listings SET latitude = 29.0276032, longitude = -81.0251990 WHERE id = '17fe378c-f939-4176-b1b6-4e6360f2964a'`);
    const { rows } = await conn.queryObject(`SELECT id, latitude, longitude FROM listings`);
    
    return new Response(JSON.stringify({ success: true, rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    conn.release();
    await pool.end();
  }
});
