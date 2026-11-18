import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
import Stripe from 'npm:stripe@14.25.0';
import {recoverPendingForHost} from '../_shared/sandbox-refund-recovery.ts';
const stripeKey=Deno.env.get('STRIPE_SECRET_KEY')||'';
const secret=Deno.env.get('SANDBOX_BOOKING_WEBHOOK_SECRET')||'';
const url=Deno.env.get('SUPABASE_URL')||'';
const role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
Deno.serve(async(req)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!stripeKey.startsWith('sk_test_')||!secret.startsWith('whsec_')||url!=='https://kbkdfpmlyggfijkyjxoi.supabase.co'||!role)return new Response('Sandbox webhook not configured',{status:503});
 const stripe=new Stripe(stripeKey,{apiVersion:'2023-10-16'});
 let event;
 try{event=await stripe.webhooks.constructEventAsync(await req.text(),req.headers.get('stripe-signature')||'',secret);}
 catch{return new Response('Invalid signature',{status:400});}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired','payment_intent.amount_capturable_updated'].includes(event.type))return new Response('ok');
 const s=event.data.object;
 if(event.type==='payment_intent.amount_capturable_updated')return new Response('ok');
 if(s.livemode||!s.id?.startsWith('cs_test_'))return new Response('Wrong environment',{status:400});
 const db=createClient(url,role,{auth:{persistSession:false}});
 const {data:b,error:be}=await db.from('bookings').select('id,status,total,stripe_session_id,stripe_payment_intent,authorization_created_at').eq('stripe_session_id',s.id).maybeSingle();
 if(be)return new Response('Database read failed',{status:500});
 if(!b){
   const {data:ob,error:oe}=await db.from('outfitter_booking_requests').select('id,outfitter_id,status,payment_status,amount_cents,stripe_checkout_session_id').eq('stripe_checkout_session_id',s.id).maybeSingle();
   if(oe)return new Response('Outfitter booking lookup failed',{status:500});
   if(!ob)return new Response('ok');
   if(s.metadata?.outfitter_booking_request_id!==ob.id)return new Response('Outfitter booking mismatch',{status:400});
   if(event.type==='checkout.session.expired'){
     if(ob.payment_status==='checkout_pending'){
       const {error}=await db.from('outfitter_booking_requests').update({payment_status:'unpaid',stripe_checkout_session_id:null}).eq('id',ob.id).eq('payment_status','checkout_pending');
       if(error)return new Response('Outfitter expiration update failed',{status:500});
     }
     return new Response('ok');
   }
   const checked=await stripe.checkout.sessions.retrieve(s.id);
   if(checked.livemode||checked.payment_status!=='paid'||checked.amount_total!==ob.amount_cents||!checked.payment_intent)return new Response('Outfitter payment not verified',{status:400});
   if(ob.payment_status==='paid')return new Response('ok');
   if(ob.status!=='accepted'||ob.payment_status!=='checkout_pending')return new Response('Outfitter booking state mismatch',{status:409});
   const {error}=await db.from('outfitter_booking_requests').update({payment_status:'paid',stripe_payment_intent_id:String(checked.payment_intent)}).eq('id',ob.id).eq('status','accepted').eq('payment_status','checkout_pending');
   if(error)return new Response('Outfitter payment update failed',{status:500});
   try{await recoverPendingForHost(db,stripe,stripeKey,ob.outfitter_id);}catch{console.error('Outfitter refund recovery needs reconciliation');}
   return new Response('ok');
 }
 if(s.metadata?.booking_id!==b.id)return new Response('Booking mismatch',{status:400});
 if(event.type==='checkout.session.expired'){
   if(['pending_payment','authorization_pending'].includes(b.status)){
     const {error}=await db.from('bookings').update({status:'expired'}).eq('id',b.id).eq('status',b.status);
     if(error)return new Response('Update failed',{status:500});
   }
   return new Response('ok');
 }
 const verified=await stripe.checkout.sessions.retrieve(s.id);
 // Stripe can retry the original completion after the authorization is captured or released.
 // A matching recorded authorization acknowledges the replay without repeating side effects.
 if(event.type==='checkout.session.completed'&&b.authorization_created_at&&
    !verified.livemode&&verified.status==='complete'&&verified.metadata?.booking_id===b.id&&
    verified.amount_total===Math.round(Number(b.total)*100)&&
    typeof s.payment_intent==='string'&&s.payment_intent===b.stripe_payment_intent&&
    verified.payment_intent===b.stripe_payment_intent){
   return new Response('ok');
 }
 if(verified.payment_status==='unpaid'&&verified.payment_intent&&b.status==='authorization_pending'){
   const pi=await stripe.paymentIntents.retrieve(String(verified.payment_intent));
   // Stripe cancellation can succeed before a database write is retried.
   if(pi.status==='canceled'&&!verified.livemode&&verified.status==='complete'&&
      verified.amount_total===Math.round(Number(b.total)*100)&&s.payment_intent===pi.id){
     const {error}=await db.from('bookings').update({
       status:'declined',stripe_payment_intent:pi.id,authorization_created_at:new Date().toISOString()
     }).eq('id',b.id).eq('status','authorization_pending');
     return error?new Response('Conflict update failed',{status:500}):new Response('ok');
   }
   if(pi.status==='requires_capture'&&pi.amount_capturable===Math.round(Number(b.total)*100)){
     const {error}=await db.from('bookings').update({status:'pending_approval',stripe_payment_intent:pi.id,authorization_created_at:new Date().toISOString()}).eq('id',b.id).eq('status','authorization_pending');
     if(error?.code==='23P01'){
       // Another authorized booking won the dates. Release this TEST hold before acknowledging.
       try {
         await stripe.paymentIntents.cancel(pi.id,{}, {idempotencyKey:'leasewild-sandbox-overlap-release-'+b.id});
       } catch {
         const current=await stripe.paymentIntents.retrieve(pi.id);
         if(current.status!=='canceled')return new Response('Conflicting authorization release failed',{status:500});
       }
       const {error:releaseError}=await db.from('bookings').update({
         status:'declined',stripe_payment_intent:pi.id,authorization_created_at:new Date().toISOString()
       }).eq('id',b.id).eq('status','authorization_pending');
       return releaseError?new Response('Conflict update failed',{status:500}):new Response('ok');
     }
     if(error)return new Response('Update failed',{status:500});
     // Durable, deduplicated notification intent. Do not email before verified Stripe authorization.
     const {data:detail}=await db.from('bookings').select('listing_id').eq('id',b.id).single();
     if(detail?.listing_id){
       const {data:owner}=await db.from('listings').select('email').eq('id',detail.listing_id).maybeSingle();
       if(owner?.email){
         const {error:queueError}=await db.from('sandbox_booking_email_outbox').upsert({
           booking_id:b.id,event_type:'owner_booking_request',recipient_email:String(owner.email).trim().toLowerCase()
         },{onConflict:'booking_id,event_type,recipient_email',ignoreDuplicates:true});
         if(queueError)console.error('Owner booking notification enqueue failed',queueError.code);
       }
     }
     // Queue additional adult ID invitations only after Stripe TEST authorization is verified.
     const {data:adultGuests,error:guestLookupError}=await db.from('sandbox_booking_guests').select('id,email').eq('booking_id',b.id).eq('is_minor',false);
     if(guestLookupError)console.error('Guest invitation lookup failed',guestLookupError.code);
     for(const guest of adultGuests||[]){
       if(!guest.email)continue;
       const {error:inviteError}=await db.from('sandbox_booking_email_outbox').upsert({
         booking_id:b.id,guest_id:guest.id,event_type:'adult_guest_id_invite',recipient_email:String(guest.email).trim().toLowerCase()
       },{onConflict:'booking_id,event_type,recipient_email',ignoreDuplicates:true});
       if(inviteError)console.error('Guest invitation enqueue failed',inviteError.code);
     }
     return new Response('ok');
   }
 }

 if(verified.payment_status!=='paid'||verified.livemode||verified.amount_total!==Math.round(Number(b.total)*100)||!verified.payment_intent)return new Response('Payment not verified',{status:400});
 if(b.status==='confirmed')return new Response('ok');
 if(b.status!=='pending_payment')return new Response('Booking state mismatch',{status:409});
 const {error}=await db.from('bookings').update({status:'confirmed',stripe_payment_intent:String(verified.payment_intent)}).eq('id',b.id).eq('status','pending_payment');
 if(error)return new Response('Update failed',{status:500});
 return new Response('ok');
});
