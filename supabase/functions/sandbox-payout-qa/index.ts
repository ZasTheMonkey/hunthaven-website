import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
// Closed after the owned TEST payout and cleanup evidence was captured.
const enabled=false;
const project='https://kbkdfpmlyggfijkyjxoi.supabase.co',origin='https://leasewild-sandbox.pages.dev';
const owner='7546f675-03be-42a6-9294-aeaf27b9c558',bookingId='4fc1278b-1a4e-453a-bd57-4d4e97a0fb6e';
const platform='acct_1TOJ2rAO40Rp32aF',connected='acct_1TOJMRAO408zPcFQ',bank='ba_1TOJMiAO408zPcFQkDH1IcOU';
Deno.serve(async req=>{
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
 const out=(v:unknown,status=200)=>Response.json(v,{status,headers});
 if(req.headers.get('origin')!==origin)return out({error:'Sandbox origin required'},403);
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='POST')return out({error:'Method not allowed'},405);
 const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
 if(!enabled||Date.now()>=Date.parse('2026-11-19T00:00:00Z')||Deno.env.get('SUPABASE_URL')!==project||!key.startsWith('sk_test_'))return out({error:'TEST payout QA closed'},503);
 const db=createClient(project,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const {data:{user},error}=await db.auth.getUser((req.headers.get('authorization')||'').replace(/^Bearer /i,''));
 if(error||user?.id!==owner||user.app_metadata?.qa_fixture!=='leasewild-payment-browser')return out({error:'Verified synthetic owner required'},403);
 const body=await req.json().catch(()=>null);
 if(!['readiness','create','get','cancel','reverse','refund_platform','recover_test_share'].includes(body?.action))return out({error:'Unknown action'},400);
 try{
  const stripe=async(path:string,method='GET',data?:Record<string,string>,onConnected=false,idempotency?:string)=>{
   const r=await fetch('https://api.stripe.com'+path,{method,headers:{Authorization:'Bearer '+key,'Stripe-Version':'2026-10-28.endive',...(onConnected?{'Stripe-Account':connected}:{}),...(data?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body:data?new URLSearchParams(data):undefined});
   const d=await r.json();if(!r.ok)throw Error('Stripe '+r.status+' '+String(d.error?.code||d.error?.type||'request_failed'));return d;
  };
  const p=await stripe('/v1/account'),a=await stripe('/v2/core/accounts/'+connected);
  if(p.id!==platform||a.id!==connected||a.livemode!==false)return out({error:'Wrong TEST account'},503);
  const destination=await stripe('/v1/accounts/'+connected+'/external_accounts/'+bank);
  if(destination.id!==bank||destination.bank_name!=='STRIPE TEST BANK'||destination.routing_number!=='110000000'||destination.last4!=='6789'||destination.currency!=='usd')return out({error:'Synthetic bank verification failed'},409);
  const {data:b}=await db.from('bookings').select('id,status,listing_id,stripe_payment_intent').eq('id',bookingId).eq('guest_email','leasewild-payment-hunter-151dbe1e0d@example.com').maybeSingle();
  const {data:l}=await db.from('listings').select('id').eq('id',b?.listing_id).eq('owner_id',owner).like('description','QA ONLY%').maybeSingle();
  if(!b||!l||!b.stripe_payment_intent)return out({error:'Owned actual TEST payment required'},409);
  const balance=async()=>{const x=await stripe('/v1/balance','GET',undefined,true);return {available_usd:x.available?.find((v:any)=>v.currency==='usd')?.amount||0,pending_usd:x.pending?.find((v:any)=>v.currency==='usd')?.amount||0};};
  if(body.action==='readiness')return out({test:true,account:connected,bank,booking:bookingId,balance:await balance()});
  const summarize=(x:any)=>({id:x.id,livemode:x.livemode,amount:x.amount,currency:x.currency,status:x.status,destination:x.destination,original_payout:x.original_payout,reversed_by:x.reversed_by,balance_transaction:x.balance_transaction,failure_code:x.failure_code});
  // Isolated QA fixture cleanup only; this is not an application refund policy.
  if(['refund_platform','recover_test_share'].includes(body.action)){
   const pi=await stripe('/v1/payment_intents/'+b.stripe_payment_intent+'?expand[]=latest_charge');
   if(pi.livemode!==false||pi.status!=='succeeded'||pi.amount_received!==10650||pi.metadata?.booking_id!==bookingId||pi.metadata?.host_cents!=='8000'||pi.transfer_data?.destination!==connected) return out({error:'Wrong captured TEST fixture'},409);
   if(body.action==='refund_platform'){
    const refund=await stripe('/v1/refunds','POST',{payment_intent:pi.id,reason:'requested_by_customer','metadata[qa_fixture]':'leasewild-payout-20261118','metadata[booking_id]':bookingId},false,'leasewild-payout-fixture-refund-'+bookingId);
    if(refund.status==='succeeded'&&refund.amount===10650){const {error:e}=await db.from('bookings').update({status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:'landowner'}).eq('id',bookingId).eq('stripe_payment_intent',pi.id);if(e)return out({error:'TEST refund succeeded; booking reconciliation required',refund_id:refund.id},500);}
    return out({refund:{id:refund.id,amount:refund.amount,status:refund.status,payment_intent:refund.payment_intent},mode:'QA platform-funded refund; host recovery separately tracked'});
   }
   if(pi.latest_charge?.amount_refunded!==10650||b.status!=='cancelled')return out({error:'Verify full TEST refund before host recovery'},409);
   const id=pi.latest_charge.transfer,t=await stripe('/v1/transfers/'+id),f=await stripe('/v1/application_fees/'+pi.latest_charge.application_fee);
   if(t.livemode!==false||t.destination!==connected||t.source_transaction!==pi.latest_charge.id||t.amount!==10650||f.amount!==2650||f.amount_refunded!==0||t.amount_reversed>8000)return out({error:'Unexpected TEST ledger state'},409);
   const before=await balance(),remaining=8000-t.amount_reversed,amount=Math.min(remaining,Math.max(0,before.available_usd));let reversal=null;
   if(amount>0)reversal=await stripe('/v1/transfers/'+id+'/reversals','POST',{amount:String(amount),'metadata[qa_fixture]':'leasewild-payout-20261118'},false,'leasewild-qa-host-recovery-'+bookingId+'-'+t.amount_reversed+'-'+amount);
   const after=await stripe('/v1/transfers/'+id);
   return out({transfer:id,host_target_cents:8000,recovered_cents:after.amount_reversed,pending_recovery_cents:8000-after.amount_reversed,reversal_id:reversal?.id||null,balance:await balance(),fee_refunded_cents:0,mode:'QA net host-share recovery; original retained fee offsets platform-funded guest refund'});
  }
  if(body.action==='create'){
   const pi=await stripe('/v1/payment_intents/'+b.stripe_payment_intent+'?expand[]=latest_charge');
   if(b.status!=='confirmed'||pi.livemode!==false||pi.status!=='succeeded'||pi.amount_received!==10650||pi.metadata?.booking_id!==bookingId||pi.metadata?.host_cents!=='8000'||pi.transfer_data?.destination!==connected||pi.latest_charge?.amount_refunded!==0)return out({error:'Captured owned TEST host-share verification failed'},409);
   const before=await balance();if(before.available_usd<100)return out({error:'Insufficient available TEST balance',balance:before},409);
   const payout=await stripe('/v1/payouts','POST',{amount:'100',currency:'usd',destination:bank,method:'standard',source_type:'card','metadata[qa_fixture]':'leasewild-payout-20261118','metadata[booking_id]':bookingId,description:'SYNTHETIC QA ONLY — one dollar payout'},true,'leasewild-payout-qa-'+bookingId);
   if(payout.livemode!==false)throw Error('Wrong payout mode');
   return out({payout:summarize(payout),balance_before:before,balance_after:await balance()});
  }
  const id=String(body.payout_id||'');if(!/^po_[A-Za-z0-9]+$/.test(id))return out({error:'Payout ID required'},400);
  let payout=await stripe('/v1/payouts/'+id,'GET',undefined,true);
  if(payout.livemode!==false||payout.metadata?.qa_fixture!=='leasewild-payout-20261118'||payout.metadata?.booking_id!==bookingId||payout.amount!==100||payout.destination!==bank)return out({error:'Owned one-dollar TEST payout required'},403);
  if(body.action==='cancel'&&payout.status==='pending')payout=await stripe('/v1/payouts/'+id+'/cancel','POST',{},true,'leasewild-payout-cancel-'+id);
  if(body.action==='reverse'&&!payout.reversed_by&&['paid','in_transit'].includes(payout.status)){
   const reversed=await stripe('/v1/payouts/'+id+'/reverse','POST',{'metadata[qa_fixture]':'leasewild-payout-20261118'},true,'leasewild-payout-reverse-'+id);
   return out({payout:summarize(payout),reversal:summarize(reversed),balance:await balance()});
  }
  return out({payout:summarize(payout),balance:await balance()});
 }catch(e){return out({error:e instanceof Error?e.message:'TEST payout request failed'},502);}
});
