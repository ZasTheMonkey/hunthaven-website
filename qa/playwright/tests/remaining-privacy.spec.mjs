import {test,expect} from '@playwright/test';
const base='https://leasewild-sandbox.pages.dev',api='https://kbkdfpmlyggfijkyjxoi.supabase.co';
test('synthetic ID upload remains private and admin rejection persists',async({page,request},info)=>{
 test.setTimeout(120000);const key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY;
 const login=async p=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[p+'_EMAIL'],password:process.env[p+'_PASSWORD']}});expect(r.ok()).toBeTruthy();return r.json();};
 const owner=await login('QA_LANDOWNER'),other=await login('QA_SECOND_LANDOWNER'),admin=await login('QA_ADMIN');expect(owner.user.id).toBe('7546f675-03be-42a6-9294-aeaf27b9c558');
 const h=s=>({apikey:key,Authorization:'Bearer '+s.access_token});let doc;
 await page.addInitScript(s=>localStorage.setItem('sb-kbkdfpmlyggfijkyjxoi-auth-token',JSON.stringify(s)),owner);
 await page.goto(base+'/landowner-portal.html');await expect(page.locator('#dashboard')).toBeVisible();
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=180;const g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,600,180);g.fillStyle='black';g.font='24px sans-serif';g.fillText('SYNTHETIC QA — NOT A VALID ID',20,65);g.font='18px sans-serif';g.fillText('LeaseWild privacy test · no personal data',20,115);return c.toDataURL().split(',')[1];});
 // Trailing marker identifies this disposable synthetic PNG for bounded cleanup.
 const buffer=Buffer.concat([Buffer.from(png,'base64'),Buffer.from('LEASEWILD_SYNTHETIC_QA_20261118')]);
 try{
 await page.locator('#lo-id-file').setInputFiles({name:'synthetic-qa-not-valid-id.png',mimeType:'image/png',buffer});await page.locator('#lo-id-upload').click();await expect(page.locator('#lo-id-status')).toContainText('ID submitted securely');
 const r=await request.get(api+'/rest/v1/identity_verification_submissions?user_id=eq.'+owner.user.id+'&select=id,document_path,status&order=created_at.desc&limit=1',{headers:h(owner)});[doc]=await r.json();expect(doc.status).toBe('pending');await info.attach('synthetic-document-id',{body:doc.id,contentType:'text/plain'});
 const object='/storage/v1/object/authenticated/identity-verification/'+doc.document_path;
 expect((await request.get(api+object,{headers:h(owner)})).ok()).toBeTruthy();expect((await request.get(api+object,{headers:h(admin)})).ok()).toBeTruthy();
 for(const headers of [h(other),{apikey:key}]){expect((await request.get(api+object,{headers})).ok()).toBeFalsy();const rows=await request.get(api+'/rest/v1/identity_verification_submissions?id=eq.'+doc.id+'&select=id',{headers});expect(await rows.json()).toEqual([]);}
 expect((await request.get(api+'/storage/v1/object/public/identity-verification/'+doc.document_path)).ok()).toBeFalsy();
 const denied=await request.post(api+'/rest/v1/rpc/admin_review_identity_verification',{headers:h(other),data:{p_id:doc.id,p_status:'approved',p_notes:'QA ONLY denied attempt'}});expect(denied.ok()).toBeFalsy();
 const rejected=await request.post(api+'/rest/v1/rpc/admin_review_identity_verification',{headers:h(admin),data:{p_id:doc.id,p_status:'rejected',p_notes:'QA ONLY — intentionally synthetic document, not a valid ID'}});expect(rejected.ok()).toBeTruthy();expect(await rejected.json()).toBe(true);
 await page.reload();await expect(page.locator('#lo-id-status')).toContainText('not approved');await page.screenshot({path:info.outputPath('synthetic-id-rejected-private.png')});
 }finally{if(doc){const clean=await request.post(api+'/functions/v1/sandbox-comprehensive-qa-fixture',{headers:{...h(owner),Origin:base},data:{action:'cleanup_identity',id:doc.id}});expect(await clean.json()).toEqual({cleaned:true});}}
});
