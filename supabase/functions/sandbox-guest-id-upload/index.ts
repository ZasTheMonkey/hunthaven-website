import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
const origins=/^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev$/;
const sha=async(t:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(x=>x.toString(16).padStart(2,'0')).join('');
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store',...(origins.test(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})};
 const respond=(x:unknown,n=200)=>new Response(JSON.stringify(x),{status:n,headers});
 if(req.method==='OPTIONS')return new Response('',{headers:{...headers,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'content-type'}});
 if(req.method!=='POST'||!origins.test(origin))return respond({error:'Forbidden'},403);
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(url!=='https://kbkdfpmlyggfijkyjxoi.supabase.co'||!key)return respond({error:'Unavailable'},503);
 const db=createClient(url,key,{auth:{persistSession:false}});
 const type=req.headers.get('content-type')||'';
 let token='',file:File|null=null;
 if(type.includes('multipart/form-data')){const f=await req.formData();token=String(f.get('token')||'');file=f.get('document') instanceof File?f.get('document') as File:null;}
 else {const b=await req.json().catch(()=>({}));token=String(b.token||'');}
 if(!/^[a-f0-9]{64}$/.test(token))return respond({error:'Invalid or expired invitation'},403);
 const hash=await sha(token);
 const {data:t}=await db.from('sandbox_guest_id_invitation_tokens').select('id,guest_id,expires_at,used_at').eq('token_hash',hash).maybeSingle();
 if(!t||t.used_at||Date.parse(t.expires_at)<Date.now())return respond({error:'Invalid or expired invitation'},403);
 const {data:g}=await db.from('sandbox_booking_guests').select('id,booking_id,is_minor,verification_status').eq('id',t.guest_id).maybeSingle();
 if(!g||g.is_minor||g.verification_status!=='pending')return respond({error:'Invitation is no longer active'},403);
 const {data:b}=await db.from('bookings').select('status,check_in').eq('id',g.booking_id).maybeSingle();
 if(!b||!['pending_approval','confirmed','approved'].includes(b.status)||new Date(b.check_in+'T23:59:59Z').getTime()<Date.now())return respond({error:'Reservation upload window closed'},403);
 if(!file)return respond({ready:true,max_bytes:10485760,accepted_types:['image/jpeg','image/png','image/webp','application/pdf']});
 if(file.size<1||file.size>10485760||!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type))return respond({error:'Upload a JPG, PNG, WebP or PDF up to 10 MB'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());
 const sig=(...x:number[])=>x.every((v,i)=>bytes[i]===v);
 const valid=file.type==='application/pdf'?sig(37,80,68,70,45):file.type==='image/png'?sig(137,80,78,71,13,10,26,10):file.type==='image/jpeg'?sig(255,216,255):file.type==='image/webp'?sig(82,73,70,70)&&String.fromCharCode(...bytes.slice(8,12))==='WEBP':false;
 if(!valid)return respond({error:'File contents do not match its type'},400);
 const ext={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type];
 const path='sandbox-guest-ids/'+g.booking_id+'/'+g.id+'/'+crypto.randomUUID()+'.'+ext;
 const {error:up}=await db.storage.from('identity-verification').upload(path,bytes,{contentType:file.type,upsert:false});
 if(up)return respond({error:'Secure upload failed'},503);
 const {data:claimed,error:ce}=await db.rpc('sandbox_finalize_guest_id_upload',{p_token_id:t.id,p_guest_id:g.id,p_path:path});
 if(ce||!claimed){await db.storage.from('identity-verification').remove([path]);return respond({error:ce?'Secure upload could not be finalized. Please retry.':'Invitation already used or no longer active'},ce?503:409);}
 return respond({uploaded:true,message:'Your ID has been securely received and is awaiting review. Upload does not mean your identity has been verified.'});
});
