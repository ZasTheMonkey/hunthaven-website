import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
const enabled=false,project='https://kbkdfpmlyggfijkyjxoi.supabase.co',origin='https://leasewild-sandbox.pages.dev';
const caller='7546f675-03be-42a6-9294-aeaf27b9c558',booking='ab02aaa5-affc-4959-afcb-527a51cbcfe4';
const outfitter='0c9ed01e-8c96-4a35-b0db-a8ed34322e11',connected='acct_1TOJMRAO408zPcFQ',bank='ba_1TOJMiAO408zPcFQkDH1IcOU';
Deno.serve(async req=>{
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
 const out=(v:unknown,s=200)=>Response.json(v,{status:s,headers});
 if(req.headers.get('origin')!==origin)return out({error:'Sandbox origin required'},403);
 if(req.method==='OPTIONS')return new Response('',{headers});if(req.method!=='POST')return out({error:'Method not allowed'},405);
 const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
 if(!enabled||Date.now()>=Date.parse('2026-11-19T01:00:00Z')||Deno.env.get('SUPABASE_URL')!==project||!key.startsWith('sk_test_'))return out({error:'TEST payout QA closed'},503);
 const db=createClient(project,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const {data:{user},error}=await db.auth.getUser((req.headers.get('authorization')||'').replace(/^Bearer /i,''));if(error||user?.id!==caller||user.app_metadata?.qa_fixture!=='leasewild-payment-browser')return out({error:'Verified QA operator required'},403);
 const body=await req.json().catch(()=>null);if(!['readiness','create','get','reverse','cancel'].includes(body?.action))return out({error:'Unknown action'},400);
 try{
  const stripe=async(path:string,method='GET',data?:Record<string,string>,onConnected=false,idempotency?:string)=>{const r=await fetch('https://api.stripe.com'+path,{method,headers:{Authorization:'Bearer '+key,'Stripe-Version':'2026-10-28.endive',...(onConnected?{'Stripe-Account':connected}:{}),...(data?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body:data?new URLSearchParams(data):undefined});const d=await r.json();if(!r.ok)throw Error('Stripe '+r.status+' '+String(d.error?.code||d.error?.type||'request_failed'));return d;};
  const p=await stripe('/v1/account'),a=await stripe('/v2/core/accounts/'+connected),dest=await stripe('/v1/accounts/'+connected+'/external_accounts/'+bank);
  if(p.id!=='acct_1TOJ2rAO40Rp32aF'||a.livemode!==false||dest.bank_name!=='STRIPE TEST BANK'||dest.routing_number!=='110000000'||dest.last4!=='6789')return out({error:'TEST account or bank mismatch'},409);
  const {data:b}=await db.from('outfitter_booking_requests').select('id,status,payment_status,stripe_payment_intent_id,stripe_checkout_session_id').eq('id',booking).eq('outfitter_id',outfitter).eq('hunter_id','bf7c510f-f2e1-45a6-923b-89fae1e7148d').eq('notes','AUTOMATED QA ONLY — disposable Stripe TEST Connect fixture').maybeSingle();
  const {data:l}=await db.from('outfitter_listings').select('user_id').eq('user_id',outfitter).like('title','SANDBOX TEST ONLY%').eq('price',200).maybeSingle();if(!b||!l)return out({error:'Known owned synthetic fixture required'},409);
  const balance=async()=>{const x=await stripe('/v1/balance','GET',undefined,true);return {available_usd:x.available?.find((x:any)=>x.currency==='usd')?.amount||0,pending_usd:x.pending?.find((x:any)=>x.currency==='usd')?.amount||0};};
  const summary=(x:any)=>({id:x.id,livemode:x.livemode,amount:x.amount,currency:x.currency,status:x.status,destination:x.destination,original_payout:x.original_payout,reversed_by:x.reversed_by,balance_transaction:x.balance_transaction});
  if(body.action==='readiness')return out({test:true,booking,account:connected,bank,balance:await balance()});
  if(body.action==='create'){
   const pi=await stripe('/v1/payment_intents/'+b.stripe_payment_intent_id+'?expand[]=latest_charge'),s=await stripe('/v1/checkout/sessions/'+b.stripe_checkout_session_id);
   if(b.status!=='accepted'||b.payment_status!=='paid'||pi.livemode||pi.status!=='succeeded'||pi.amount_received!==20000||pi.application_fee_amount!==4000||pi.transfer_data?.destination!==connected||pi.latest_charge?.amount_refunded!==0||s.livemode||s.metadata?.outfitter_booking_request_id!==booking||s.payment_intent!==pi.id)return out({error:'Actual TEST capture not verified'},409);
   const before=await balance();if(before.available_usd<100)return out({error:'Insufficient available TEST funds',balance:before},409);
   const payout=await stripe('/v1/payouts','POST',{amount:'100',currency:'usd',destination:bank,method:'standard',source_type:'card','metadata[qa_fixture]':'leasewild-outfitter-refund-qa-20261118','metadata[booking_id]':booking,description:'SYNTHETIC QA ONLY — outfitter one dollar payout'},true,'leasewild-outfitter-payout-qa-'+booking);
   return out({payout:summary(payout),balance_before:before,balance_after:await balance()});
  }
  const id=String(body.payout_id||'');if(!/^po_[A-Za-z0-9]+$/.test(id))return out({error:'Payout ID required'},400);
  let payout=await stripe('/v1/payouts/'+id,'GET',undefined,true);
  if(payout.livemode||payout.amount!==100||payout.destination!==bank||payout.metadata?.qa_fixture!=='leasewild-outfitter-refund-qa-20261118'||payout.metadata?.booking_id!==booking)return out({error:'Owned TEST payout required'},403);
  if(body.action==='cancel'&&payout.status==='pending')payout=await stripe('/v1/payouts/'+id+'/cancel','POST',{},true,'leasewild-outfitter-payout-cancel-'+id);
  if(body.action==='reverse'&&!payout.reversed_by&&['paid','in_transit'].includes(payout.status)){const reversed=await stripe('/v1/payouts/'+id+'/reverse','POST',{'metadata[qa_fixture]':'leasewild-outfitter-refund-qa-20261118'},true,'leasewild-outfitter-payout-reverse-'+id);return out({payout:summary(payout),reversal:summary(reversed),balance:await balance()});}
  return out({payout:summary(payout),balance:await balance()});
 }catch(e){return out({error:e instanceof Error?e.message:'TEST payout failed'},502);}
});
