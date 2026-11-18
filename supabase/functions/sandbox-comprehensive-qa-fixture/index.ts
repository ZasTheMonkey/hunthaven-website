import {createClient} from 'npm:@supabase/supabase-js@2.49.8';

// Temporary, caller-bound fixture provisioning. No arbitrary users, keys, or roles.
const project='https://kbkdfpmlyggfijkyjxoi.supabase.co';
const origin='https://leasewild-sandbox.pages.dev';
const caller='7546f675-03be-42a6-9294-aeaf27b9c558';
const expires=Date.parse('2026-11-19T00:00:00Z');
// Closed after evidence collection. Reopening requires a new bounded QA run.
const enabled=false;
Deno.serve(async req=>{
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
 const out=(value:unknown,status=200)=>Response.json(value,{status,headers});
 if(req.headers.get('origin')!==origin)return out({error:'Sandbox origin required'},403);
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='POST')return out({error:'Method not allowed'},405);
 if(!enabled||Deno.env.get('SUPABASE_URL')!==project||Date.now()>=expires)return out({error:'Fixture provisioning closed'},503);
 const db=createClient(project,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const token=req.headers.get('authorization')?.replace(/^Bearer /i,'')||'';
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||user?.id!==caller||user.app_metadata?.qa_fixture!=='leasewild-payment-browser')return out({error:'Verified QA owner required'},403);
 const body=await req.json().catch(()=>null);
 if(['create_guest_invitation','cleanup_guest_document'].includes(body?.action)){
  const booking='213e7ba2-0b2e-4005-9cf9-a1be0a7eb295';
  const {data:b}=await db.from('bookings').select('id,status,listing_id').eq('id',booking).eq('guest_email','leasewild-payment-hunter-151dbe1e0d@example.com').maybeSingle();
  const {data:l}=await db.from('listings').select('id').eq('id',b?.listing_id).eq('owner_id',caller).like('description','QA ONLY%').maybeSingle();
  const {data:g}=await db.from('sandbox_booking_guests').select('id,document_path,verification_status,is_minor').eq('booking_id',booking).eq('email','leasewild-qa-guest-id-20261118@example.com').single();
  if(!b||!l||!g||g.is_minor)return out({error:'Owned synthetic adult guest required'},404);
  if(body.action==='create_guest_invitation'){
   if(b.status!=='pending_approval'||g.verification_status!=='pending')return out({error:'Actual TEST authorization required'},409);
   const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),x=>x.toString(16).padStart(2,'0')).join('');
   const {error:e}=await db.from('sandbox_guest_id_invitation_tokens').upsert({guest_id:g.id,token_hash:hash,expires_at:new Date(Date.now()+3600000).toISOString(),used_at:null},{onConflict:'guest_id'});
   return e?out({error:'Invitation fixture failed'},500):out({booking,guest:g.id,token});
  }
  if(g.document_path){
   if(!g.document_path.startsWith('sandbox-guest-ids/'+booking+'/'+g.id+'/')||!g.document_path.endsWith('.png'))return out({error:'Synthetic PNG required'},403);
   const {data:file}=await db.storage.from('identity-verification').download(g.document_path);
   if(!file||!new TextDecoder().decode(await file.arrayBuffer()).includes('LEASEWILD_SYNTHETIC_QA_20261118'))return out({error:'Synthetic marker missing'},403);
   const {error:remove}=await db.storage.from('identity-verification').remove([g.document_path]);if(remove)return out({error:'Cleanup failed'},500);
  }
  const prefix='sandbox-guest-ids/'+booking+'/'+g.id;
  const {data:orphans}=await db.storage.from('identity-verification').list(prefix,{limit:20});
  for(const item of orphans||[]){
   if(!item.name.endsWith('.png'))continue;
   const path=prefix+'/'+item.name,{data:file}=await db.storage.from('identity-verification').download(path);
   if(file&&new TextDecoder().decode(await file.arrayBuffer()).includes('LEASEWILD_SYNTHETIC_QA_20261118')){
    const {error:remove}=await db.storage.from('identity-verification').remove([path]);if(remove)return out({error:'Orphan cleanup failed'},500);
   }
  }
  await db.from('sandbox_booking_guests').update({document_path:null,verification_status:'pending'}).eq('id',g.id);
  await db.from('sandbox_guest_id_invitation_tokens').delete().eq('guest_id',g.id);
  return out({cleaned:true,booking,guest:g.id});
 }
 if(body?.action==='email_readiness')return out({provider_configured:!!Deno.env.get('RESEND_API_KEY'),worker_secret_configured:!!Deno.env.get('SANDBOX_EMAIL_WORKER_SECRET'),qa_recipient_allowlisted:(Deno.env.get('SANDBOX_EMAIL_ALLOWLIST')||'').split(',').map(x=>x.trim().toLowerCase()).includes('zach.schmitt@leasewild.com')});
 if(body?.action==='replay_owned_test_event'){
  const key=Deno.env.get('STRIPE_SECRET_KEY')||'',secret=Deno.env.get('SANDBOX_BOOKING_WEBHOOK_SECRET')||'';
  if(!key.startsWith('sk_test_')||!secret.startsWith('whsec_'))return out({error:'Sandbox TEST webhook configuration required'},503);
  const er=await fetch('https://api.stripe.com/v1/events/evt_1Ud9n4AO40Rp32aFQqF0Nnyi',{headers:{Authorization:'Bearer '+key}});
  if(!er.ok)return out({error:'Cannot retrieve owned TEST event'},502);
  const event=await er.json(),s=event.data?.object;
  if(event.livemode!==false||event.type!=='checkout.session.completed'||!s?.id?.startsWith('cs_test_'))return out({error:'Wrong event environment'},409);
  const {data:b}=await db.from('bookings').select('id,status,listing_id,guest_email,stripe_session_id').eq('id',s.metadata?.booking_id).eq('stripe_session_id',s.id).eq('guest_email','leasewild-payment-hunter-151dbe1e0d@example.com').maybeSingle();
  const {data:l}=await db.from('listings').select('id').eq('id',b?.listing_id).eq('owner_id',caller).like('description','QA ONLY%').maybeSingle();
  if(!b||!l||b.status!=='cancelled')return out({error:'Owned terminal synthetic fixture required'},409);
  const count=async()=>{const {count}=await db.from('sandbox_booking_email_outbox').select('id',{count:'exact',head:true}).eq('booking_id',b.id);return count;};
  const before=await count(),raw=JSON.stringify(event),t=Math.floor(Date.now()/1000);
  const hmac=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',hmac,new TextEncoder().encode(t+'.'+raw))),x=>x.toString(16).padStart(2,'0')).join('');
  const endpoint=project+'/functions/v1/sandbox-booking-webhook';
  const send=async(sig:string)=>{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':sig},body:raw});return {status:r.status,body:(await r.text()).slice(0,120)};};
  const invalid=await send('t='+t+',v1='+'0'.repeat(64));
  const replays=await Promise.all([send('t='+t+',v1='+signature),send('t='+t+',v1='+signature)]);
  const {data:after}=await db.from('bookings').select('status').eq('id',b.id).single();
  return out({event:event.id,booking:b.id,test:true,mode:'controlled HMAC replay of actual Stripe TEST event; not Stripe delivery resend',invalid,replays,status_before:b.status,status_after:after?.status,outbox_before:before,outbox_after:await count()});
 }
 if(body?.action==='payout_readiness'){
  const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
  if(!key.startsWith('sk_test_'))return out({error:'TEST key required'},503);
  const get=async(path:string,connected=false)=>{const r=await fetch('https://api.stripe.com'+path,{headers:{Authorization:'Bearer '+key,'Stripe-Version':'2026-10-28.endive',...(connected?{'Stripe-Account':'acct_1TOJMRAO408zPcFQ'}:{})}});if(!r.ok)throw Error('Stripe read failed '+r.status+' '+path.split('?')[0]);return r.json();};
  try{
   const platform=await get('/v1/account');if(platform.id!=='acct_1TOJ2rAO40Rp32aF')return out({error:'Wrong TEST platform'},503);
   const account=await get('/v2/core/accounts/acct_1TOJMRAO408zPcFQ');if(account.livemode!==false)return out({error:'TEST account required'},503);
   const balance=await get('/v1/balance',true);
   const banks=await get('/v1/accounts/acct_1TOJMRAO408zPcFQ/external_accounts?object=bank_account&limit=10');
   return out({test:true,connected_account:account.id,available:balance.available?.map((x:any)=>({currency:x.currency,amount:x.amount})),pending:balance.pending?.map((x:any)=>({currency:x.currency,amount:x.amount})),external_bank_count:banks.data?.length,qa_marked_bank_count:banks.data?.filter((b:any)=>b.metadata?.qa_fixture==='leasewild-comprehensive-20261118').length});
  }catch(e){return out({error:e instanceof Error?e.message:'Read failed'},502);}
 }
 if(body?.action==='cleanup_identity'){
  const {data:doc}=await db.from('identity_verification_submissions').select('id,user_id,document_path').eq('id',body.id).eq('user_id',caller).maybeSingle();
  if(!doc||!doc.document_path.startsWith(caller+'/')||!doc.document_path.endsWith('.png'))return out({error:'Owned synthetic PNG required'},404);
  const {data:download,error:de}=await db.storage.from('identity-verification').download(doc.document_path);
  if(de||!download)return out({error:'Cannot verify synthetic document'},409);
  // Only a PNG produced by this QA run, carrying the explicit synthetic marker.
  const bytes=new Uint8Array(await download.arrayBuffer());
  if(!new TextDecoder().decode(bytes).includes('LEASEWILD_SYNTHETIC_QA_20261118'))return out({error:'Synthetic marker missing'},403);
  const {error:remove}=await db.storage.from('identity-verification').remove([doc.document_path]);
  if(remove)return out({error:'Storage cleanup failed'},500);
  const {error:deleted}=await db.from('identity_verification_submissions').delete().eq('id',doc.id).eq('user_id',caller);
  return out({cleaned:!deleted},deleted?500:200);
 }
 if(body?.action!=='create_second_owner')return out({error:'Unknown fixture action'},400);
 const tag=crypto.randomUUID();
 const email='leasewild-qa-owner-b-'+tag.slice(0,8)+'@example.com';
 const password=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
 const {data:created,error:ce}=await db.auth.admin.createUser({email,password,email_confirm:true,
  app_metadata:{qa_fixture:'leasewild-comprehensive-20261118',qa_run:tag},user_metadata:{role:'landowner',full_name:'QA ONLY Comprehensive Owner B'}});
 if(ce||!created.user)return out({error:'Could not create isolated QA identity'},500);
 const {data:listing,error:le}=await db.from('listings').insert({owner_id:created.user.id,email,first_name:'QA ONLY',last_name:'Owner B',status:'draft',state:'Florida',county:'Volusia',description:'QA ONLY — Comprehensive Owner B '+tag,price_per_day:100,cleaning_fee:0,min_stay:'1',max_guests:4,activities:['Whitetail deer']}).select('id,status').single();
 if(le){await db.auth.admin.deleteUser(created.user.id);return out({error:'Could not create isolated QA listing'},500);}
 return out({id:created.user.id,email,password,qa_run:tag,listing});
});
