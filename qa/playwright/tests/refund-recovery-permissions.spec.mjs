import {test,expect} from '@playwright/test';
const api='https://kbkdfpmlyggfijkyjxoi.supabase.co',origin='https://leasewild-sandbox.pages.dev';
test('refund recovery is private, owner/admin scoped and retry safe',async({request},info)=>{
 const booking=process.env.QA_RECOVERY_BOOKING_ID;test.skip(!booking,'BLOCKED: independently reconciled synthetic refund recovery required');
 const key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY,login=async p=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[p+'_EMAIL'],password:process.env[p+'_PASSWORD']}});expect(r.ok()).toBeTruthy();return r.json();};
 const owner=await login('QA_LANDOWNER'),hunter=await login('QA_HUNTER'),other=await login('QA_SECOND_LANDOWNER'),admin=await login('QA_ADMIN');expect(owner.user.id).toBe('7546f675-03be-42a6-9294-aeaf27b9c558');
 const h=s=>({apikey:key,Origin:origin,Authorization:'Bearer '+s.access_token}),url=api+'/functions/v1/sandbox-booking-refund-recovery';
 const kind=process.env.QA_RECOVERY_BOOKING_TYPE||'landowner',actor=kind==='outfitter'?admin:owner,table=kind==='outfitter'?'sandbox_outfitter_refund_recoveries':'sandbox_booking_refund_recoveries',rpc=kind==='outfitter'?'sandbox_claim_outfitter_refund_recovery':'sandbox_claim_refund_recovery';
 const call=(s,action)=>request.post(url,{headers:h(s),data:{action,booking_id:booking,booking_type:kind}});
 for(const s of (kind==='outfitter'?[hunter,other,owner]:[hunter,other]))expect((await call(s,'status')).status()).toBe(404);
 expect((await request.post(url,{headers:{apikey:key,Origin:origin},data:{action:'status',booking_id:booking}})).status()).toBe(401);
 const status=await call(actor,'status');expect(status.ok()).toBeTruthy();const before=await status.json();expect(before.recovery.pending_cents).toBe(Number(process.env.QA_RECOVERY_PENDING_CENTS));expect(before.refund_status).toBe('succeeded');
 expect((await call(admin,'status')).ok()).toBeTruthy();
 expect((await request.get(api+'/rest/v1/'+table+'?booking_id=eq.'+booking,{headers:h(owner)})).status()).toBe(403);
 expect((await request.patch(api+'/rest/v1/'+table+'?booking_id=eq.'+booking,{headers:h(owner),data:{recovered_cents:8000}})).status()).toBe(403);
 expect((await request.post(api+'/rest/v1/rpc/'+rpc,{headers:h(owner),data:{p_booking_id:booking}})).status()).toBe(403);
 const retries=await Promise.all([call(actor,'retry'),call(actor,'retry')]);for(const r of retries){expect(r.ok()).toBeTruthy();const d=await r.json();expect(d.refund_id).toBe(before.refund_id);expect(d.recovery.recovered_cents).toBeLessThanOrEqual(d.recovery.target_cents);}
 const after=await (await call(actor,'status')).json();expect(after.refund_id).toBe(before.refund_id);expect(after.recovery.pending_cents).toBe(Number(process.env.QA_RECOVERY_PENDING_CENTS));
 await info.attach('refund-recovery-evidence',{body:JSON.stringify(after),contentType:'application/json'});
});
