import {test,expect} from '@playwright/test';
import {requireSyntheticCredentials} from './helpers.mjs';
import {readFile} from 'node:fs/promises';
// Disposable QA listing ownership is independently checked before enabling this test.
test('owner pointer-drawn hunting entry and parking areas persist and clean up',async({page},info)=>{
 test.setTimeout(180000);
 test.skip(process.env.QA_POINTER_FIXTURE_VERIFIED!=='true','BLOCKED: independent sandbox fixture and cleanup verification required');
 const account=requireSyntheticCredentials('QA_LANDOWNER'),id=process.env.QA_LANDOWNER_LISTING_ID;
 if(process.env.QA_CANDIDATE_SOURCE==='true')await page.route('**/sandbox-zone-editor.html?*',async route=>route.fulfill({contentType:'text/html',body:await readFile(new URL('../../../sandbox-zone-editor.html',import.meta.url),'utf8')}));
 expect(id).toBe('f66958e7-f235-4f13-9920-d21523dddcae');
 await page.goto('/landowner-portal.html');
 await page.locator('#si-email').fill(account.email);await page.locator('#si-password').fill(account.password);await page.locator('#signin-btn').click();
 await expect(page.locator('#dashboard')).toBeVisible({timeout:20000});
 for(const type of ['hunting_area','entry_area','parking_area']){
  const label='QA desktop 20261118 '+type+' '+Date.now();
  await page.goto('/sandbox-zone-editor.html?listing='+id);
  await expect(page.locator('#status')).toContainText('Editing your',{timeout:20000});
  const row=page.locator('#saved li').filter({hasText:label});
  let persisted=false;
  try{
   await page.locator('#zone-type').selectOption(type);await page.locator('#zone-label').fill(label);
   await page.locator('#draw-boundary').click();await page.locator('#map').scrollIntoViewIfNeeded();
   const box=await page.locator('#map').boundingBox();
   await page.mouse.move(box.x+box.width*.35,box.y+box.height*.35);await page.mouse.down();
   await page.mouse.move(box.x+box.width*.65,box.y+box.height*.35,{steps:8});
   await page.mouse.move(box.x+box.width*.55,box.y+box.height*.6,{steps:8});
   await page.mouse.move(box.x+box.width*.35,box.y+box.height*.35,{steps:8});await page.mouse.up();
   await expect(page.locator('#save')).toBeEnabled();await page.locator('#save').click();
   await page.screenshot({path:info.outputPath(type+'-save-result.png'),fullPage:true});
   await expect(page.locator('#status')).toContainText('Zone saved',{timeout:20000});
   await expect(row).toHaveCount(1,{timeout:20000});
   persisted=true;
   await page.reload();await expect(row).toHaveCount(1,{timeout:20000});
   await page.screenshot({path:info.outputPath(type+'-reloaded.png'),fullPage:true});
  }finally{
   await page.reload();await expect(page.locator('#status')).toContainText('Editing your',{timeout:20000});
   if(persisted)await expect(row).toHaveCount(1,{timeout:20000});
   if(await row.count()){page.once('dialog',d=>d.accept());await row.getByRole('button',{name:'Delete '+label}).click();await expect(row).toHaveCount(0);}
   await page.reload();await expect(page.locator('#status')).toContainText('Editing your',{timeout:20000});await expect(row).toHaveCount(0);
  }
 }
});
