import {createClient} from 'npm:@supabase/supabase-js@2.49.8';

// Temporary, caller-bound fixture provisioning. No arbitrary users, keys, or roles.
const project='https://kbkdfpmlyggfijkyjxoi.supabase.co';
const origin='https://leasewild-sandbox.pages.dev';
const caller='7546f675-03be-42a6-9294-aeaf27b9c558';
const expires=Date.parse('2026-11-19T00:00:00Z');
Deno.serve(async req=>{
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
 const out=(value:unknown,status=200)=>Response.json(value,{status,headers});
 if(req.headers.get('origin')!==origin)return out({error:'Sandbox origin required'},403);
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='POST')return out({error:'Method not allowed'},405);
 if(Deno.env.get('SUPABASE_URL')!==project||Date.now()>=expires)return out({error:'Fixture provisioning closed'},503);
 const db=createClient(project,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const token=req.headers.get('authorization')?.replace(/^Bearer /i,'')||'';
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||user?.id!==caller||user.app_metadata?.qa_fixture!=='leasewild-payment-browser')return out({error:'Verified QA owner required'},403);
 const body=await req.json().catch(()=>null);
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
