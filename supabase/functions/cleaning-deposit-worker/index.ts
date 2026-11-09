import {sb,json,check,locked,save} from '../_shared/payments.ts';
import {processPayment} from '../_shared/deposit-lifecycle.ts';
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST') return json({error:'Method not allowed'},405);
 const expected=Deno.env.get('CLEANING_WORKER_SECRET');
 if(!expected || req.headers.get('x-worker-secret')!==expected) return json({error:'Not authorized'},401);
 try {
  const rows=check(await sb.from('lease_payments').select('id').lte('next_attempt_at',new Date().toISOString()).order('next_attempt_at').limit(30));
  let processed=0,failed=0;
  for(const row of rows) {
   try {await locked(row.id,async(p)=>{await processPayment(p);});processed++;}
   catch(e){failed++;console.error('deposit-worker',row.id,e);await save(row.id,{next_attempt_at:new Date(Date.now()+60000).toISOString()});}
  }
  return json({processed,failed});
 }catch(e){console.error(e);return json({error:'Worker failed'},500);}
});
