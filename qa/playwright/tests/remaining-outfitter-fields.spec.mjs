import {test,expect} from '@playwright/test';
const api='https://kbkdfpmlyggfijkyjxoi.supabase.co';
test('outfitter booking clients cannot forge paid state or payment fields',async({request},info)=>{
 test.skip(process.env.QA_OUTFITTER_MESSAGE_FIXTURE_VERIFIED!=='true','BLOCKED: independently verified synthetic listing required');
 const key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY,login=async p=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[p+'_EMAIL'],password:process.env[p+'_PASSWORD']}});expect(r.ok()).toBeTruthy();return r.json();};const hunter=await login('QA_HUNTER'),outfitter=await login('QA_OUTFITTER');expect(outfitter.user.id).toBe('df65f8f7-eb9a-40c6-a157-0bd86d78c8fa');
 const h=s=>({apikey:key,Authorization:'Bearer '+s.access_token,Prefer:'return=representation'}),url=api+'/rest/v1/outfitter_booking_requests';
 const data={outfitter_id:outfitter.user.id,hunter_id:hunter.user.id,trip_date:new Date(Date.now()+221*86400000).toISOString().slice(0,10),guest_count:1,guest_name:'QA ONLY payment-field forgery probe',contact_email:hunter.user.email,notes:'QA ONLY forgery regression 20261118'};
 const before=process.env.QA_PROBE_BEFORE==='true',evidence={before,created:[]};
 const forged=await request.post(url,{headers:h(hunter),data:{...data,payment_status:'paid',amount_cents:1}});evidence.forgedInsert=forged.status();if(forged.ok())evidence.created.push(...(await forged.json()).map(x=>x.id));expect(forged.status()).toBe(before?201:403);
 const valid=await request.post(url,{headers:h(hunter),data});expect(valid.ok()).toBeTruthy();const [row]=await valid.json();evidence.created.push(row.id);
 const patched=await request.patch(url+'?id=eq.'+row.id,{headers:h(outfitter),data:{status:'accepted',payment_status:'paid',amount_cents:1}});evidence.forgedUpdate=patched.status();expect(patched.status()).toBe(403);
 if(!before){const accepted=await request.patch(url+'?id=eq.'+row.id,{headers:h(outfitter),data:{status:'accepted'}});expect(accepted.ok()).toBeTruthy();expect((await accepted.json())[0].payment_status).toBe('unpaid');const cancel=await request.patch(url+'?id=eq.'+row.id,{headers:h(hunter),data:{status:'cancelled'}});expect(cancel.ok()).toBeTruthy();}
 await info.attach('forgery-probe',{body:JSON.stringify(evidence),contentType:'application/json'});
});
