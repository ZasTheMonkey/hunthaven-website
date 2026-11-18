import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
import Stripe from 'npm:stripe@14.25.0';
import {recoverHostShare,refundWithHostRecovery} from '../_shared/sandbox-refund-recovery.ts';
const project='https://kbkdfpmlyggfijkyjxoi.supabase.co',origin='https://leasewild-sandbox.pages.dev';
Deno.serve(async req=>{
 const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
 const out=(v:unknown,s=200)=>Response.json(v,{status:s,headers});
 if(req.headers.get('origin')!==origin)return out({error:'Forbidden'},403);
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='POST')return out({error:'Method not allowed'},405);
 const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
 if(Deno.env.get('SUPABASE_URL')!==project||!key.startsWith('sk_test_'))return out({error:'Sandbox unavailable'},503);
 const db=createClient(project,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const {data:{user},error}=await db.auth.getUser((req.headers.get('authorization')||'').replace(/^Bearer /i,''));if(error||!user)return out({error:'Sign in required'},401);
 const body=await req.json().catch(()=>null),id=String(body?.booking_id||'');
 const kind=body?.booking_type||'landowner';
 if(!/^[0-9a-f-]{36}$/i.test(id)||!['status','retry'].includes(body?.action)||!['landowner','outfitter'].includes(kind))return out({error:'Invalid request'},400);
 const {data:r}=await db.from(kind==='outfitter'?'sandbox_outfitter_refund_recoveries':'sandbox_booking_refund_recoveries').select('*').eq('booking_id',id).maybeSingle();
 if(!r)return out({error:'Recovery not found'},404);
 const {data:admin}=await db.from('listing_review_admins').select('user_id').eq('user_id',user.id).maybeSingle();
 if(r.owner_id!==user.id&&!admin)return out({error:'Recovery not found'},404);
 try{
  let result=r;
  if(body.action==='retry'){
   const stripe=new Stripe(key,{apiVersion:'2023-10-16'});
   const {data:b}=await db.from(kind==='outfitter'?'outfitter_booking_requests':'bookings').select('*').eq('id',id).single();if(!b)return out({error:'Booking not found'},404);
   if(kind==='outfitter'&&b.status==='accepted'){
    const {data:c}=await db.from('outfitter_cancellation_requests').select('status,processing_started_at').eq('booking_id',id).maybeSingle();
    if(c?.status!=='approved_pending_refund'||Date.now()-Date.parse(c.processing_started_at)<120000)return out({error:'Cancellation reconciliation is already in progress'},409);
    const pi=await stripe.paymentIntents.retrieve(r.payment_intent);if(pi.livemode)return out({error:'Wrong payment mode'},409);
    const resumed=await refundWithHostRecovery(db,stripe,key,{id:b.id},pi,r.owner_id,'outfitter');result=resumed.recovery||r;
    const {error:update}=await db.from('outfitter_booking_requests').update({status:'cancelled',payment_status:resumed.refund.status==='succeeded'?'refunded':'refund_pending'}).eq('id',id).eq('status','accepted');if(update)throw update;
   }else
   if(b.status==='cancellation_processing'){
    if(Date.now()-Date.parse(r.updated_at)<120000)return out({error:'Refund reconciliation is already in progress'},409);
    const pi=await stripe.paymentIntents.retrieve(r.payment_intent);if(pi.livemode)return out({error:'Wrong payment mode'},409);
    const resumed=await refundWithHostRecovery(db,stripe,key,b,pi,r.owner_id);
    const {error:update}=await db.from('bookings').update({status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:'landowner'}).eq('id',id).eq('status','cancellation_processing');if(update)throw update;
    result=resumed.recovery||r;
   }else result=await recoverHostShare(db,stripe,key,id,kind);
   if(kind==='outfitter'&&result.status!=='refund_pending'){
    await db.from('outfitter_booking_requests').update({payment_status:'refunded'}).eq('id',id).eq('status','cancelled');
    await db.from('outfitter_cancellation_requests').update({status:'refunded',refund_status:'succeeded',stripe_refund_id:result.refund_id,resolved_at:new Date().toISOString()}).eq('booking_id',id);
   }
  }
  return out({booking_id:id,booking_type:kind,refund_id:result.refund_id,refund_status:result.refund_status,recovery:{status:result.status,target_cents:result.target_cents,recovered_cents:result.recovered_cents,pending_cents:result.target_cents-result.recovered_cents}});
 }catch{return out({error:'Refund recovery needs reconciliation; no new guest charge was created'},503);}
});
