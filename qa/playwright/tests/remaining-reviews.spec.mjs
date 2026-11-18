import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const base='https://leasewild-sandbox.pages.dev',api='https://kbkdfpmlyggfijkyjxoi.supabase.co';
const booking=process.env.QA_COMPLETED_REVIEW_BOOKING_ID;
test('captured completed stay review: owner, duplicate, cross-owner and moderation',async({browser,request},info)=>{
 test.skip(!booking||process.env.QA_COMPLETED_REVIEW_FIXTURE_VERIFIED!=='true','BLOCKED: independently verified captured synthetic completed-stay fixture required');
 test.setTimeout(150000);
 const key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY;
 const login=async(prefix)=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[prefix+'_EMAIL'],password:process.env[prefix+'_PASSWORD']}});expect(r.ok()).toBeTruthy();return r.json();};
 const owner=await login('QA_LANDOWNER'),hunter=await login('QA_HUNTER'),other=await login('QA_SECOND_LANDOWNER'),admin=await login('QA_ADMIN');
 expect(owner.user.id).toBe('7546f675-03be-42a6-9294-aeaf27b9c558');expect(other.user.id).toBe('0b22d015-ff3c-4ca6-89e7-28f5fc2cd9b8');
 const headers=s=>({apikey:key,Authorization:'Bearer '+s.access_token});
 const rpc=async(s,name,data)=>request.post(api+'/rest/v1/rpc/'+name,{headers:headers(s),data});
 for(const s of [hunter,other]){const r=await rpc(s,'sandbox_hunter_review_eligibility',{p_booking_id:booking});expect(await r.json()).toEqual({eligible:false});}
 const eligibility=await rpc(owner,'sandbox_hunter_review_eligibility',{p_booking_id:booking});expect((await eligibility.json()).hunter_id).toBe(hunter.user.id);
 const context=await browser.newContext(),page=await context.newPage();
 const setSession=async(s)=>page.addInitScript(({s})=>!localStorage.getItem('sb-kbkdfpmlyggfijkyjxoi-auth-token') && localStorage.setItem('sb-kbkdfpmlyggfijkyjxoi-auth-token',JSON.stringify(s)),{s});
 await setSession(owner);
 for(const file of ['sandbox-hunter-review.html','admin-hunter-reviews.html'])await page.route('**/'+file+'*',async route=>route.fulfill({status:200,contentType:'text/html',body:await fs.readFile(new URL('../../../'+file,import.meta.url),'utf8')}));
 try{
 await page.goto(base+'/sandbox-hunter-review.html?booking='+booking);await expect(page.locator('#review-form')).toBeVisible();await page.locator('#overall').selectOption('5');await page.locator('#feedback').fill('QA ONLY synthetic completed-stay review 20261118');await page.locator('#submit').click();await expect(page.locator('#status')).toHaveText('Review submitted for moderation.');
 const read=await request.get(api+'/rest/v1/hunter_reviews?booking_id=eq.'+booking+'&select=id,moderation_status',{headers:headers(owner)});const rows=await read.json();expect(rows).toHaveLength(1);const id=rows[0].id;expect(rows[0].moderation_status).toBe('pending');
 await info.attach('review-id',{body:id,contentType:'text/plain'});
 await page.reload();await expect(page.locator('#status')).toHaveText('You already reviewed this booking.');
 const payload={booking_id:booking,reviewer_owner_id:owner.user.id,hunter_id:hunter.user.id,overall_rating:5};
 const duplicate=await request.post(api+'/rest/v1/hunter_reviews',{headers:headers(owner),data:payload});expect(duplicate.status()).toBe(409);
 for(const s of [hunter,other]){const denied=await request.post(api+'/rest/v1/hunter_reviews',{headers:headers(s),data:{...payload,reviewer_owner_id:s.user.id}});expect(denied.status()).toBe(403);}
 const visible=async()=>{const r=await request.get(api+'/rest/v1/hunter_reviews?id=eq.'+id+'&select=id',{headers:headers(hunter)});return r.json();};expect(await visible()).toEqual([]);
 const deniedModeration=await rpc(other,'sandbox_moderate_hunter_review',{p_review_id:id,p_status:'published'});expect(deniedModeration.status()).toBe(403);
 await page.evaluate(s=>localStorage.setItem('sb-kbkdfpmlyggfijkyjxoi-auth-token',JSON.stringify(s)),admin);await page.goto(base+'/admin-hunter-reviews.html?review='+id);await expect(page.locator('#controls')).toBeVisible();await page.getByRole('button',{name:'Publish',exact:true}).click();await expect(page.locator('#state')).toHaveText('Status: published');expect(await visible()).toEqual([{id}]);await page.screenshot({path:info.outputPath('moderated-synthetic-review.png')});
 await page.getByRole('button',{name:'Hide',exact:true}).click();await expect(page.locator('#state')).toHaveText('Status: hidden');expect(await visible()).toEqual([]);
 }finally{await context.close();}
});

