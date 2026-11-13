import { createClient } from 'npm:@supabase/supabase-js@2.49.8';

const sandboxOrigin = 'https://leasewild-sandbox.pages.dev';
const qaOutfitterId = '0c9ed01e-8c96-4a35-b0db-a8ed34322e11';
const qaFixtureNote = 'AUTOMATED QA ONLY — disposable Stripe TEST Connect fixture';
const headers = {
  'Access-Control-Allow-Origin': sandboxOrigin,
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { headers });
  if (request.method !== 'POST' || request.headers.get('origin') !== sandboxOrigin) {
    return respond({ error: 'Sandbox origin required' }, 403);
  }

  const url = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!url || !serviceKey) return respond({ error: 'Sandbox database unavailable' }, 503);

  const database = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = (request.headers.get('authorization') || '').replace(/^Bearer /i, '');
  const { data: { user }, error: authError } = await database.auth.getUser(token);
  if (authError || !user || user.app_metadata?.qa_fixture !== 'leasewild-payment-browser') {
    return respond({ error: 'Dedicated payment QA identity required' }, 403);
  }

  let input: { action?: string; trip_date?: string };
  try {
    input = await request.json();
  } catch {
    return respond({ error: 'Invalid request' }, 400);
  }
  if (!['create', 'cleanup'].includes(String(input.action || ''))) {
    return respond({ error: 'Invalid action' }, 400);
  }

  const { data: listing } = await database.from('outfitter_listings')
    .select('user_id,title,price,price_label,max_group_size,status')
    .eq('user_id', qaOutfitterId).maybeSingle();
  if (!listing || !['active', 'inactive'].includes(listing.status) ||
      !/^SANDBOX TEST ONLY\b/.test(listing.title || '') ||
      Number(listing.price) !== 200 || !/per\s*(person|guest|hunter)/i.test(listing.price_label || '') ||
      Number(listing.max_group_size) < 1) {
    return respond({ error: 'Dedicated QA outfitter listing is not ready' }, 503);
  }

  if (input.action === 'cleanup') {
    const { data: inactive, error: inactiveError } = await database.from('outfitter_listings')
      .update({ status: 'inactive' })
      .eq('user_id', qaOutfitterId)
      .select('status').single();
    if (inactiveError || inactive?.status !== 'inactive') {
      return respond({ error: 'Could not deactivate dedicated QA listing' }, 500);
    }
    const { count, error: countError } = await database.from('outfitter_booking_requests')
      .select('id', { count: 'exact', head: true })
      .eq('hunter_id', user.id)
      .eq('notes', qaFixtureNote)
      .eq('status', 'accepted')
      .eq('payment_status', 'paid');
    if (countError) return respond({ error: 'Could not verify disposable QA fixtures' }, 500);
    return respond({ listing_status: inactive.status, unsettled_paid_fixtures: count || 0 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.trip_date || ''))) {
    return respond({ error: 'Invalid trip date' }, 400);
  }
  const tripAt = Date.parse(input.trip_date + 'T00:00:00Z');
  const earliest = Date.now() + 7 * 86_400_000;
  const latest = Date.now() + 180 * 86_400_000;
  if (!Number.isFinite(tripAt) || tripAt < earliest || tripAt > latest) {
    return respond({ error: 'QA trip date must be 7–180 days away' }, 400);
  }

  const [{ data: account }, { data: config }] = await Promise.all([
    database.from('outfitter_stripe_accounts')
      .select('stripe_account_id,charges_enabled,payouts_enabled')
      .eq('outfitter_id', qaOutfitterId).maybeSingle(),
    database.from('outfitter_payment_config')
      .select('platform_fee_bps,currency').limit(1).maybeSingle(),
  ]);
  if (!account?.stripe_account_id?.startsWith('acct_') || !account.charges_enabled || !account.payouts_enabled) {
    return respond({ error: 'Dedicated QA Connect account is not ready' }, 503);
  }
  if (config?.platform_fee_bps !== 2000 || config?.currency !== 'usd') {
    return respond({ error: 'Expected 20% USD commission configuration' }, 503);
  }

  let activated = false;
  if (listing.status !== 'active') {
    const { data: active, error: activeError } = await database.from('outfitter_listings')
      .update({ status: 'active' })
      .eq('user_id', qaOutfitterId)
      .eq('status', 'inactive')
      .select('status').single();
    if (activeError || active?.status !== 'active') {
      return respond({ error: 'Could not activate dedicated QA listing' }, 500);
    }
    activated = true;
  }

  const { data: fixture, error } = await database.from('outfitter_booking_requests').insert({
    outfitter_id: qaOutfitterId,
    hunter_id: user.id,
    trip_date: input.trip_date,
    guest_count: 1,
    guest_name: 'LeaseWild Synthetic Payment QA',
    contact_email: user.email,
    notes: qaFixtureNote,
    status: 'accepted',
    payment_status: 'unpaid',
    currency: 'usd',
  }).select('id,trip_date,status,payment_status').single();
  if (error || !fixture) {
    if (activated) {
      await database.from('outfitter_listings').update({ status: 'inactive' }).eq('user_id', qaOutfitterId);
    }
    return respond({ error: 'Could not create disposable QA fixture' }, 500);
  }
  return respond({ fixture, listing_status: 'active' });
});
