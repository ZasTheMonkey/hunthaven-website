import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
import {recoverPendingForHost} from '../_shared/sandbox-refund-recovery.ts';
const allowedOrigin=(value:string)=>/^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev$/.test(value);
const cors=(origin:string)=>({'Access-Control-Allow-Origin':allowedOrigin(origin)?origin:'https://leasewild-sandbox.pages.dev','Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'});
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers=cors(origin);
 const reply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers});
 if(req.method==='OPTIONS')return new Response('',{headers,status:allowedOrigin(origin)?200:403});
 if(req.method!=='POST'||!allowedOrigin(origin))return reply({error:'Forbidden'},403);
 const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
 if(!key.startsWith('sk_test_')||Deno.env.get('SUPABASE_URL')!=='https://kbkdfpmlyggfijkyjxoi.supabase.co')return reply({error:'Sandbox payment configuration unavailable'},503);
 const db=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');
 const {data:{user},error:ue}=await db.auth.getUser(token);
 if(ue||!user?.email)return reply({error:'Sign in required'},401);
 let input;try{input=await req.json()}catch{return reply({error:'Invalid request'},400)}
 const {action,booking_id}=input;
 if(action==='owner_list'){
   const {data:listings,error:le}=await db.from('listings').select('id').eq('owner_id',user.id);
   if(le)return reply({error:'Unable to load properties'},500);
   const ids=(listings||[]).map(x=>x.id);
   if(!ids.length)return reply({bookings:[]});
   const {data,error}=await db.from('bookings').select('id,listing_id,guest_name,guest_email,check_in,check_out,guests,total,status,created_at,approval_deadline,rate_per_night,nights,cleaning_fee').in('listing_id',ids).order('created_at',{ascending:false}).limit(100);
   return error?reply({error:'Unable to load requests'},500):reply({bookings:data||[]});
 }
 if(action==='hunter_list'){
   const {data,error}=await db.from('bookings').select('id,listing_id,check_in,check_out,total,status,created_at,approval_deadline,nights').ilike('guest_email',user.email).order('created_at',{ascending:false}).limit(100);
   return error?reply({error:'Unable to load bookings'},500):reply({bookings:data||[]});
 }
 if(!/^[0-9a-f-]{36}$/i.test(String(booking_id)))return reply({error:'Invalid booking'},400);
 const {data:b,error:be}=await db.from('bookings').select('*').eq('id',booking_id).maybeSingle();
 if(be||!b)return reply({error:'Booking not found'},404);
 const {data:l,error:le}=await db.from('listings').select('id,owner_id,county').eq('id',b.listing_id).maybeSingle();
 if(le||!l)return reply({error:'Property not found'},404);
 if(action==='approve'||action==='decline'){
   if(l.owner_id!==user.id)return reply({error:'Only the property owner may decide'},403);
   if(b.status!=='pending_approval')return reply({error:'Request not ready for approval'},409);
   if(!b.approval_deadline||Date.now()>=Date.parse(b.approval_deadline))return reply({error:'24-hour approval deadline has passed'},409);
   if(!b.stripe_payment_intent)return reply({error:'Card authorization is not ready'},409);
   if(action==='approve'){
     const {data:conflicts,error:ce}=await db.from('bookings').select('id').eq('listing_id',b.listing_id).in('status',['confirmed','pending_payment','approved']).lt('check_in',b.check_out).gt('check_out',b.check_in).neq('id',b.id).limit(1);
     if(ce||conflicts?.length)return reply({error:'Dates are no longer available'},409);
   }
   const stripe=await import('npm:stripe@14.25.0').then(m=>new m.default(key,{apiVersion:'2023-10-16'}));
   const pi=await stripe.paymentIntents.retrieve(b.stripe_payment_intent);
   if(pi.livemode||pi.status!=='requires_capture'||pi.amount_capturable!==Math.round(Number(b.total)*100))return reply({error:'Card authorization is no longer valid'},409);
   if(action==='approve'){
     const {data:lock,error:lockError}=await db.from('bookings').update({status:'capturing'}).eq('id',b.id).eq('status','pending_approval').gt('approval_deadline',new Date().toISOString()).select('id').maybeSingle();
     if(lockError||!lock)return reply({error:'Request already processed'},409);
     try{
       const captured=await stripe.paymentIntents.capture(pi.id,{},{idempotencyKey:'leasewild-sandbox-capture-'+b.id});
       if(captured.status!=='succeeded')throw new Error('Capture not completed');
       const {error}=await db.from('bookings').update({status:'confirmed',stripe_payment_intent:pi.id}).eq('id',b.id).eq('status','capturing');
       if(error)throw error;
       // Future host receipts can repay a previously platform-funded guest refund.
       // Recovery errors must never undo or misreport this successful capture.
       try{await recoverPendingForHost(db,stripe,key,l.owner_id);}catch{console.error('Host refund recovery requires reconciliation');}
       return reply({booking:{id:b.id,status:'confirmed'}});
     }catch(e){return reply({error:'Payment capture needs review: '+e.message},502)}
   }
   const {data:lock,error:lockError}=await db.from('bookings').update({status:'declining'}).eq('id',b.id).eq('status','pending_approval').select('id').maybeSingle();
   if(lockError||!lock)return reply({error:'Request already processed'},409);
   try{
     await stripe.paymentIntents.cancel(pi.id,{},{idempotencyKey:'leasewild-sandbox-decline-'+b.id});
     const {data:updated,error}=await db.from('bookings').update({status:'declined'}).eq('id',b.id).eq('status','declining').select('id,status').maybeSingle();
     return error?reply({error:'Card hold released but booking update requires review'},500):updated?reply({booking:updated}):reply({error:'Booking state needs review'},409);
   }catch(e){
     const latest=await stripe.paymentIntents.retrieve(pi.id).catch(()=>null);
     if(latest?.status==='requires_capture')await db.from('bookings').update({status:'pending_approval'}).eq('id',b.id).eq('status','declining');
     return reply({error:'Card release needs review: '+e.message},502);
   }
 }
 return reply({error:'Unknown action'},400);
});
