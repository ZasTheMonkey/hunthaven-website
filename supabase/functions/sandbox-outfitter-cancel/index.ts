import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
import Stripe from 'npm:stripe@14.25.0';
const origin='https://leasewild-sandbox.pages.dev';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
const out=(v:unknown,s=200)=>new Response(JSON.stringify(v),{status:s,headers});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='POST'||req.headers.get('origin')!==origin)return out({error:'Sandbox origin required'},403);
 const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
 if(!key.startsWith('sk_test_'))return out({error:'Stripe TEST mode unavailable'},503);
 const db=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');
 const {data:{user},error:ue}=await db.auth.getUser(token);
 if(ue||!user)return out({error:'Sign in to cancel'},401);
 let body:any;try{body=await req.json()}catch{return out({error:'Invalid JSON'},400)}
 const id=String(body.booking_id||'');
 if(!/^[0-9a-f-]{36}$/i.test(id))return out({error:'Invalid booking'},400);
 const {data:b,error:be}=await db.from('outfitter_booking_requests').select('id,hunter_id,outfitter_id,status,payment_status,trip_date,guest_count,amount_cents,stripe_payment_intent_id,stripe_checkout_session_id').eq('id',id).maybeSingle();
 if(be||!b||b.hunter_id!==user.id)return out({error:'Booking not found'},404);
 const {data:request}=await db.from('outfitter_cancellation_requests').select('id,status,refund_status,stripe_refund_id').eq('booking_id',id).maybeSingle();
 if(b.status==='cancelled')return out({status:'cancelled',refund_status:request?.refund_status||'not_applicable',already_cancelled:true});
 if(b.status!=='accepted'||b.payment_status!=='paid')return out({error:'Only accepted, paid outfitter trips use this flow'},409);
 const tripAt=Date.parse(String(b.trip_date)+'T00:00:00-05:00');
 const hours=(tripAt-Date.now())/3600000;
 const fullRefund=Number.isFinite(hours)&&hours>=48;
 const refundType=fullRefund?'full_refund':'no_refund';
 const preview={booking:{trip_date:b.trip_date,guest_count:b.guest_count,amount_cents:b.amount_cents},refund_type:refundType,policy:'48-hour flexible cancellation policy',existing_request:request?.status||null};
 if(body.action==='preview')return out(preview);
 if(body.action!=='cancel')return out({error:'Invalid action'},400);
 if(request&&request.status==='refunded')return out({status:'cancelled',result:'full_refund_issued',already_cancelled:true});
 if(request&&request.status==='closed')return out({status:'cancelled',result:'cancelled_no_refund',already_cancelled:true});
 if(request&&request.status!=='pending_review')return out({error:'Cancellation already processing or awaiting resolution',status:request.status},409);
 let rid=request?.id;
 if(!rid){
  const {data:created,error:ce}=await db.from('outfitter_cancellation_requests').insert({booking_id:id,hunter_id:user.id,outfitter_id:b.outfitter_id,reason:'Hunter confirmed cancellation under the displayed 48-hour policy'}).select('id').single();
  if(ce||!created)return out({error:'Cancellation request already exists; refresh to review'},409);
  rid=created.id;
 }
 const {data:locked,error:le}=await db.from('outfitter_cancellation_requests').update({status:'approved_pending_refund',refund_status:'pending',refund_policy:refundType,refund_amount_cents:fullRefund?b.amount_cents:0,processing_started_at:new Date().toISOString()}).eq('id',rid).eq('status','pending_review').select('id').maybeSingle();
 if(le||!locked)return out({error:'Cancellation already being processed. Refresh to check its status.'},409);
 let stripeActionApplied=false;
 let refundStatus='not_applicable';
 try{
  const stripe=new Stripe(key,{apiVersion:'2023-10-16'});
  let piId=b.stripe_payment_intent_id;
  if(!piId&&b.stripe_checkout_session_id){
   const session=await stripe.checkout.sessions.retrieve(b.stripe_checkout_session_id);
   if(session.livemode)throw Error('Live Stripe session prohibited');
   piId=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id;
  }
  if(!piId)throw Error('Payment intent not found; manual reconciliation required');
  const pi=await stripe.paymentIntents.retrieve(piId);
  if(pi.livemode||pi.currency!=='usd')throw Error('Invalid sandbox payment');
  if(fullRefund){
   if(pi.status!=='succeeded')throw Error('Payment not captured; manual reconciliation required');
   const refund=await stripe.refunds.create({payment_intent:pi.id,reason:'requested_by_customer',reverse_transfer:true,refund_application_fee:true},{idempotencyKey:'leasewild-sandbox-outfitter-refund-'+id});
   stripeActionApplied=true;
   const rs=refund.status==='succeeded'?'succeeded':'pending';
   refundStatus=rs;
   const {error:re}=await db.from('outfitter_cancellation_requests').update({refund_status:rs,stripe_refund_id:refund.id}).eq('id',rid);
   if(re)throw Error('Refund created but database sync failed; manual reconciliation required');
  }
  const {data:updated,error:be2}=await db.from('outfitter_booking_requests').update({status:'cancelled',payment_status:fullRefund?(refundStatus==='succeeded'?'refunded':'refund_pending'):b.payment_status}).eq('id',id).eq('status','accepted').select('id').maybeSingle();
  if(be2||!updated)throw Error('Stripe processed but booking update requires reconciliation');
  const finalStatus=fullRefund?'refunded':'closed';
  const {error:fe}=await db.from('outfitter_cancellation_requests').update({status:finalStatus,refund_status:refundStatus,resolved_at:new Date().toISOString()}).eq('id',rid);
  if(fe)throw Error('Booking cancelled but request status requires reconciliation');
  return out({status:'cancelled',result:fullRefund?'full_refund_issued':'cancelled_no_refund',refund_type:refundType});
 }catch(e){
  if(!stripeActionApplied)await db.from('outfitter_cancellation_requests').update({status:'pending_review',refund_status:'failed'}).eq('id',rid).eq('status','approved_pending_refund');
  return out({error:'Cancellation requires support reconciliation. Do not retry payment or refund.',detail:String(e).slice(0,150)},500);
 }
});