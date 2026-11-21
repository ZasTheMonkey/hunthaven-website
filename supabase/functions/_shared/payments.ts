import Stripe from 'npm:stripe@14.25.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {apiVersion:'2023-10-16'});
export const sb = createClient(Deno.env.get('SB_URL') ?? Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SB_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
export const cors = {'Access-Control-Allow-Origin':'https://leasewild.com','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
export function json(value: unknown, status=200) {return new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json'}});}
export function check<T>(result: {data:T;error:any}):T {if(result.error) throw new Error(result.error.message);return result.data;}
export async function user(req:Request) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer /i,'');
  const {data,error} = await sb.auth.getUser(token);
  if(error || !data.user?.email_confirmed_at) throw new Error('Sign in with a verified email to continue.');
  return data.user;
}
export async function save(id:string, values:Record<string,unknown>) {
  check(await sb.from('lease_payments').update({...values,updated_at:new Date().toISOString()}).eq('id',id));
}
export async function locked(id:string, fn:(row:any)=>Promise<any>) {
  const token=crypto.randomUUID();
  const rows=check(await sb.rpc('lock_lease_payment',{p_id:id,p_token:token}));
  if(!rows?.length) throw new Error('Payment is being updated. Please try again shortly.');
  try {return await fn(rows[0]);} finally {check(await sb.from('lease_payments').update({lock_token:null,locked_until:null}).eq('id',id).eq('lock_token',token));}
}
export async function reconcileHold(row:any) {
  if(!row.deposit_intent_id) return null;
  const pi=await stripe.paymentIntents.retrieve(row.deposit_intent_id,{expand:['latest_charge']});
  if(pi.status==='succeeded') {
    await save(row.id,{state:'captured',captured_cents:pi.amount_received,next_attempt_at:null});
  } else if(pi.status==='canceled') {
    await save(row.id,{state:'released',next_attempt_at:null});
  }
  return pi;
}
export async function release(row:any) {
  const pi=await reconcileHold(row);
  if(pi?.status==='succeeded') return;
  if(pi && pi.status!=='canceled') await stripe.paymentIntents.cancel(pi.id,{}, {idempotencyKey:'release-'+row.id+'-'+pi.id});
  if(row.recovery_session_id) {
    const session=await stripe.checkout.sessions.retrieve(row.recovery_session_id);
    if(session.status==='open') await stripe.checkout.sessions.expire(session.id);
    // A recovery checkout may complete concurrently with expiry: reconcile before closing.
    if(session.status==='complete' && session.payment_intent) {
      const id=String(session.payment_intent);
      const recovered=await stripe.paymentIntents.retrieve(id);
      if(recovered.status==='requires_capture') await stripe.paymentIntents.cancel(id,{}, {idempotencyKey:'release-recovery-'+id});
    }
  }
  await save(row.id,{state:'released',next_attempt_at:null});
}
