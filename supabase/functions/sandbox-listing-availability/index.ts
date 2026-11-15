import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
const originPattern=/^https:\/\/(?:[a-z0-9-]+\.)?leasewild-sandbox\.pages\.dev$/;
const baseHeaders={'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const allowed=originPattern.test(origin);
 const headers={...baseHeaders,...(allowed?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})};
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='GET'||!allowed)return new Response(JSON.stringify({error:'Forbidden'}),{status:403,headers});
 const id=new URL(req.url).searchParams.get('listing_id')||'';
 if(!/^[0-9a-f-]{36}$/i.test(id))return new Response(JSON.stringify({error:'Invalid property'}),{status:400,headers});
 const db=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
 const {data,error}=await db.from('bookings').select('check_in,check_out,status').eq('listing_id',id).in('status',['confirmed','pre_reserved','pending_payment','authorization_pending','pending_approval','approved','capturing','cancellation_processing']).gte('check_out',new Date().toISOString().slice(0,10)).order('check_in',{ascending:true}).limit(500);
 return new Response(JSON.stringify(error?{error:'Availability unavailable'}:{ranges:(data||[]).map(x=>({start:x.check_in,end:x.check_out,type:['confirmed','pre_reserved','approved','pending_payment'].includes(x.status)?'booked':'pending'}))}),{status:error?503:200,headers});
});