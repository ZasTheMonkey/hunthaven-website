import {test,expect} from '@playwright/test';
const base='https://leasewild-sandbox.pages.dev',api='https://kbkdfpmlyggfijkyjxoi.supabase.co',listing='f66958e7-f235-4f13-9920-d21523dddcae';
test('second landowner cannot view or mutate another owner map zones',async({page,request},info)=>{
 const key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY;
 const login=async p=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[p+'_EMAIL'],password:process.env[p+'_PASSWORD']}});return r.json();};
 const owner=await login('QA_LANDOWNER'),other=await login('QA_SECOND_LANDOWNER');expect(owner.user.id).toBe('7546f675-03be-42a6-9294-aeaf27b9c558');expect(other.user.app_metadata.qa_fixture).toBe('leasewild-comprehensive-20261118');
 const h=s=>({apikey:key,Authorization:'Bearer '+s.access_token,Prefer:'return=representation'});
 const ownListing=await request.get(api+'/rest/v1/listings?id=eq.'+listing+'&owner_id=eq.'+owner.user.id+'&select=id,description',{headers:h(owner)});expect((await ownListing.json())[0].description).toContain('QA ONLY');
 const zone={listing_id:listing,zone_type:'hunting_area',label:'QA ONLY cross-owner isolation 20261118',geometry:{type:'Polygon',coordinates:[[[-81.1,29.1],[-81.099,29.1],[-81.099,29.101],[-81.1,29.1]]]}};
 const inserted=await request.post(api+'/rest/v1/listing_access_zones',{headers:h(owner),data:zone});expect(inserted.ok()).toBeTruthy();const [saved]=await inserted.json();
 try{
 const url=api+'/rest/v1/listing_access_zones?id=eq.'+saved.id;
 expect(await (await request.get(url,{headers:h(other)})).json()).toEqual([]);
 expect(await (await request.patch(url,{headers:h(other),data:{label:'QA ONLY unauthorized'}})).json()).toEqual([]);
 expect(await (await request.delete(url,{headers:h(other)})).json()).toEqual([]);
 expect((await request.post(api+'/rest/v1/listing_access_zones',{headers:h(other),data:zone})).status()).toBe(403);
 const retained=await request.get(url,{headers:h(owner)});expect((await retained.json())[0].label).toBe(zone.label);
 await page.addInitScript(s=>localStorage.setItem('sb-kbkdfpmlyggfijkyjxoi-auth-token',JSON.stringify(s)),other);await page.goto(base+'/sandbox-zone-editor.html?listing='+listing);await expect(page.locator('#status')).toContainText('do not have access');await expect(page.locator('#save')).toBeDisabled();await page.screenshot({path:info.outputPath('second-owner-access-denied.png')});
 }finally{const cleaned=await request.delete(api+'/rest/v1/listing_access_zones?id=eq.'+saved.id,{headers:h(owner)});expect((await cleaned.json())[0].id).toBe(saved.id);}
});
