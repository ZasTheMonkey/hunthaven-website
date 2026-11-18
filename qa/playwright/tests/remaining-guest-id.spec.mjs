import {test,expect} from '@playwright/test';
const base='https://leasewild-sandbox.pages.dev',api='https://kbkdfpmlyggfijkyjxoi.supabase.co';
test('valid synthetic guest invitation uploads privately once and rejects replay',async({page,request},info)=>{
 test.skip(!process.env.QA_GUEST_INVITATION_TOKEN,'BLOCKED: isolated verified guest invitation required');test.setTimeout(120000);
 const token=process.env.QA_GUEST_INVITATION_TOKEN,key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY,guest='207128aa-0126-40d2-a4c0-6472fbc30154';
 const login=async p=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[p+'_EMAIL'],password:process.env[p+'_PASSWORD']}});expect(r.ok()).toBeTruthy();return r.json();};const owner=await login('QA_LANDOWNER'),other=await login('QA_SECOND_LANDOWNER'),admin=await login('QA_ADMIN');const h=s=>({apikey:key,Authorization:'Bearer '+s.access_token});
 const endpoint=api+'/functions/v1/sandbox-guest-id-upload',headers={Origin:base};
 expect((await request.post(endpoint,{headers,data:{token:'0'.repeat(64)}})).status()).toBe(403);
 expect((await request.post(endpoint,{headers:{Origin:'https://example.com'},data:{token}})).status()).toBe(403);
 const ready=await request.post(endpoint,{headers,data:{token}});expect((await ready.json()).ready).toBe(true);
 const mismatch=await request.post(endpoint,{headers,multipart:{token,document:{name:'not-a-png.png',mimeType:'image/png',buffer:Buffer.from('SYNTHETIC NOT PNG')}}});expect(mismatch.status()).toBe(400);
 try{
 await page.goto(base+'/sandbox-guest-id-upload.html?token='+token);expect(new URL(page.url()).search).toBe('');await expect(page.locator('#f')).toBeVisible();
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=180;const g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,600,180);g.fillStyle='black';g.font='24px sans-serif';g.fillText('SYNTHETIC QA — NOT A VALID ID',20,70);return c.toDataURL().split(',')[1];});
 await page.locator('#doc').setInputFiles({name:'synthetic-not-valid-id.png',mimeType:'image/png',buffer:Buffer.concat([Buffer.from(png,'base64'),Buffer.from('LEASEWILD_SYNTHETIC_QA_20261118')])});await page.locator('#send').click();await expect(page.locator('#msg')).toContainText('securely received');await page.screenshot({path:info.outputPath('synthetic-guest-id-uploaded-once.png')});
 expect((await request.post(endpoint,{headers,data:{token}})).status()).toBe(403);
 const r=await request.post(api+'/rest/v1/rpc/sandbox_admin_reservation_ids',{headers:h(admin),data:{p_booking:'213e7ba2-0b2e-4005-9cf9-a1be0a7eb295'}});expect(r.ok()).toBeTruthy();const doc=(await r.json()).additional_adults.find(x=>x.guest_id===guest);expect(doc.status).toBe('submitted');expect(doc.document_path).toContain('sandbox-guest-ids/213e7ba2-0b2e-4005-9cf9-a1be0a7eb295/');
 const path='/storage/v1/object/authenticated/identity-verification/'+doc.document_path;expect((await request.get(api+path,{headers:h(admin)})).ok()).toBeTruthy();for(const s of [owner,other])expect((await request.get(api+path,{headers:h(s)})).ok()).toBeFalsy();expect((await request.get(api+'/storage/v1/object/public/identity-verification/'+doc.document_path)).ok()).toBeFalsy();
 await info.attach('synthetic-guest-id',{body:JSON.stringify({booking:'213e7ba2-0b2e-4005-9cf9-a1be0a7eb295',guest,upload:'submitted',replay:403,unrelatedAndOwnerStorage:'denied',adminStorage:'allowed'}),contentType:'application/json'});
 }finally{const clean=await request.post(api+'/functions/v1/sandbox-comprehensive-qa-fixture',{headers:{...h(owner),Origin:base},data:{action:'cleanup_guest_document'}});expect((await clean.json()).cleaned).toBe(true);}
});
