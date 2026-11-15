import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
import Stripe from 'npm:stripe@14.25.0';
const origin='https://leasewild-sandbox.pages.dev';
const allowedOrigin=(v:string)=>/^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev$/.test(v);
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
const out=(v:unknown,s=200)=>new Response(JSON.stringify(v),{status:s,headers});
function tripStart(date:string,time='00:00:00',zone='America/New_York'){
 const wall=Date.parse(date+'T'+time+'Z');
 if(!Number.isFinite(wall))return NaN;
 try{
   const format=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'});
   let instant=wall;
   for(let i=0;i<3;i++){
     const offset=format.formatToParts(instant).find(part=>part.type==='timeZoneName')?.value;
     if(offset==='GMT')return wall;
     const match=/^GMT([+-])(\d{2}):(\d{2})$/.exec(offset||'');
     if(!match)return NaN;
     const next=wall-(match[1]==='+'?1:-1)*(Number(match[2])*60+Number(match[3]))*60000;
     if(next===instant)return instant;
     instant=next;
   }
   return NaN;
 }catch{return NaN;}
}

Deno.serve(async req=>{
 const requestOrigin=req.headers.get('origin')||'';
 if(allowedOrigin(requestOrigin))headers['Access-Control-Allow-Origin']=requestOrigin;
 if(req.method==='OPTIONS')return new Response('',{headers,status:allowedOrigin(requestOrigin)?200:403});
 if(req.method!=='POST'||!allowedOrigin(req.headers.get('origin')||''))return out({error:'Forbidden'},403);
 const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
 if(!key.startsWith('sk_test_'))return out({error:'Test Stripe key unavailable'},503);
 const db=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');
 const {data:{user},error:ue}=await db.auth.getUser(token);
 if(ue||!user?.email)return out({error:'Please sign in'},401);
 let body:any;try{body=await req.json()}catch{return out({error:'Invalid request'},400)}
 const id=String(body.booking_id||'');
 if(!/^[0-9a-f-]{36}$/i.test(id))return out({error:'Invalid booking'},400);
 const {data:b,error:be}=await db.from('bookings').select('*').eq('id',id).maybeSingle();
 if(be||!b)return out({error:'Booking not found'},404);
 const isGuest=String(b.guest_email||'').toLowerCase()===user.email.toLowerCase();
 const {data:listing,error:listingError}=await db.from('listings').select('owner_id,checkin_time,time_zone').eq('id',b.listing_id).maybeSingle();
 if(listingError||!listing)return out({error:'Unable to verify the booking start'},503);
 const isOwner=!isGuest&&listing.owner_id===user.id;
 if(!isGuest&&!isOwner)return out({error:'Not your booking'},403);
 if(['cancelled','declined','expired'].includes(b.status))return out({status:b.status,already_cancelled:true});
 const cancellable=['authorization_pending','pending_approval','confirmed'];
 if(!cancellable.includes(b.status))return out({error:'Booking cannot be cancelled while payment is processing'},409);
 const checkin=String(b.check_in||'');
 const checkinAt=tripStart(checkin,listing.checkin_time||'00:00:00',listing.time_zone||'America/New_York');
 const hours=(checkinAt-Date.now())/3600000;
 if(!isOwner&&b.status==='confirmed'&&!Number.isFinite(hours))return out({error:'Unable to verify the booking start'},503);
 const fullRefund=isOwner||hours>=72;
 const stripe=new Stripe(key,{apiVersion:'2023-10-16'});
 if(body.action==='preview')return out({booking:{id:b.id,check_in:b.check_in,check_out:b.check_out,guest_name:b.guest_name,nights:b.nights,total:b.total,status:b.status},refund_type:['authorization_pending','pending_approval'].includes(b.status)?'release_hold':fullRefund?'full_refund':'no_refund',policy:'Guest: full eligible refund at least 72 hours before check-in; landowner cancellation: full refund'});
 if(body.action!=='cancel')return out({error:'Invalid action'},400);
 // Conditional transition prevents duplicate cancellation operations.
 const {data:locked,error:lockError}=await db.from('bookings').update({status:'cancellation_processing'}).eq('id',id).eq('status',b.status).select('id').maybeSingle();
 if(lockError||!locked)return out({error:'Booking is being updated; refresh and try again'},409);
 let stripeActionApplied=false;
 try{
   let result='cancelled_no_refund';
   if(b.stripe_payment_intent){
     const pi=await stripe.paymentIntents.retrieve(b.stripe_payment_intent);
     if(pi.livemode)throw new Error('Live payments are not allowed in sandbox');
     if(pi.status==='requires_capture'){await stripe.paymentIntents.cancel(pi.id,{}, {idempotencyKey:'leasewild-sandbox-cancel-'+id});result='authorization_released';stripeActionApplied=true;}
     else if(pi.status==='succeeded'&&fullRefund){await stripe.refunds.create({payment_intent:pi.id,reason:'requested_by_customer'},{idempotencyKey:'leasewild-sandbox-refund-'+id});result='full_refund_issued';stripeActionApplied=true;}
     else if(pi.status==='succeeded'){result='cancelled_no_refund';}
     else if(pi.status==='canceled'){result='authorization_released';}
     else throw new Error('Payment status not ready for cancellation');
   }else if(b.stripe_session_id){
     const session=await stripe.checkout.sessions.retrieve(b.stripe_session_id);
     if(session.status==='open'){await stripe.checkout.sessions.expire(session.id);result='authorization_released';stripeActionApplied=true;}
     else if(session.payment_intent)throw new Error('Payment authorization still syncing; try again');
   }
   const {error:updateError}=await db.from('bookings').update({status:'cancelled',cancelled_at:new Date().toISOString(),cancelled_by:isOwner?'landowner':'guest'}).eq('id',id).eq('status','cancellation_processing');
   if(updateError)throw updateError;
   return out({status:'cancelled',result,refund_type:result});
 }catch(e){
   if(!stripeActionApplied){await db.from('bookings').update({status:b.status}).eq('id',id).eq('status','cancellation_processing');}
   return out({error:'Cancellation requires review. Please contact support; do not retry payment.',detail:String(e).slice(0,160)},500);
 }
});