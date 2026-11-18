import {test,expect} from '@playwright/test';
const base='https://leasewild-sandbox.pages.dev',api='https://kbkdfpmlyggfijkyjxoi.supabase.co',id='e2735636-3e7e-491b-89dd-baa96bdefc9a';
test('synthetic owner submits for review and only admin activates listing',async({page,request},info)=>{
 test.skip(!process.env.QA_SECOND_LANDOWNER_PASSWORD,'BLOCKED: verified second synthetic owner required');
 const key=process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY;
 const login=async p=>{const r=await request.post(api+'/auth/v1/token?grant_type=password',{headers:{apikey:key},data:{email:process.env[p+'_EMAIL'],password:process.env[p+'_PASSWORD']}});expect(r.ok()).toBeTruthy();return r.json();};
 const owner=await login('QA_SECOND_LANDOWNER'),admin=await login('QA_ADMIN');expect(owner.user.id).toBe('0b22d015-ff3c-4ca6-89e7-28f5fc2cd9b8');expect(owner.user.app_metadata.qa_fixture).toBe('leasewild-comprehensive-20261118');
 const h=s=>({apikey:key,Authorization:'Bearer '+s.access_token,Prefer:'return=representation'}),url=api+'/rest/v1/listings?id=eq.'+id;
 const update=async status=>request.patch(url,{headers:h(owner),data:{status}});
 const before=await request.get(url+'&select=id,description,status',{headers:h(owner)});expect((await before.json())[0].description).toContain('QA ONLY — Comprehensive Owner B');
 try{
 expect((await update('active')).status()).toBe(403);
 await page.addInitScript(s=>localStorage.setItem('sb-kbkdfpmlyggfijkyjxoi-auth-token',JSON.stringify(s)),owner);await page.goto(base+'/landowner-portal.html');await expect(page.locator('#dashboard')).toBeVisible();const card=page.locator('#lcard-'+id);await card.getByRole('button',{name:'Submit for review',exact:true}).click();await expect(card).toContainText('Awaiting admin review');await page.screenshot({path:info.outputPath('owner-submits-admin-review.png')});
 const rpc=await request.post(api+'/rest/v1/rpc/admin_set_listing_status',{headers:h(admin),data:{p_kind:'landowner',p_id:id,p_status:'active'}});expect(rpc.ok()).toBeTruthy();expect(await rpc.json()).toBe(true);
 const publicRead=()=>request.get(url+'&select=id,status',{headers:{apikey:key}});expect(await (await publicRead()).json()).toEqual([{id,status:'active'}]);
 expect((await update('inactive')).ok()).toBeTruthy();expect(await (await publicRead()).json()).toEqual([]);expect((await update('active')).status()).toBe(403);
 }finally{expect((await update('draft')).ok()).toBeTruthy();}
});
