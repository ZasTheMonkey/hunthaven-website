import { test, expect } from '@playwright/test';
import { visit,screenshotStep,checkNoRawScript,checkOverflow,requireSyntheticCredentials } from './helpers.mjs';
test.describe('Bot B: real landowner, outfitter and admin browser',()=>{
 for(const route of ['/landowner-portal.html','/outfitter-portal.html','/admin.html','/list-your-land.html','/outfitter-experience.html','/outfitter-pay.html','/sandbox-zone-editor.html','/admin-listing-reviews.html']){
  test('open, render and screenshot '+route,async({page},info)=>{
   await visit(page,route);await checkNoRawScript(page);await checkOverflow(page);
   await screenshotStep(page,info,'page-'+route.replace(/[^a-z0-9]/gi,'-'));
  });
 }
 // Browser-executed responsive map workspace smoke checks. These are not evidence until a runner executes them.
 for (const width of [320,375,390,430,768,1024,1280,1440,1920,2560]) {
  test('zone editor controls and overflow at '+width+'px',async({page},info)=>{
   await page.setViewportSize({width,height:900});
   await visit(page,'/sandbox-zone-editor.html');
   await expect(page.locator('#zone-type')).toBeVisible();
   await expect(page.locator('#draw-boundary')).toBeVisible();
   await expect(page.locator('#save')).toBeAttached();
   await expect(page.locator('#map')).toBeVisible();
   await checkNoRawScript(page);
   await checkOverflow(page);
   await screenshotStep(page,info,'zone-editor-'+width+'px');
  });
 }
 test('unauthenticated visitor cannot save a drafted hunting boundary',async({page},info)=>{
  await visit(page,'/sandbox-zone-editor.html');
  await expect(page.locator('#save')).toBeDisabled();
  // Coordinates are inside a collapsed <details>; expand it before human-like input.
  await page.locator('summary').filter({hasText:'Optional: enter exact coordinates'}).click();
  await expect(page.locator('#latitude')).toBeVisible();
  for(const [lat,lng] of [[29.02,-80.93],[29.021,-80.93],[29.021,-80.929]]){
   await page.locator('#latitude').fill(String(lat));
   await page.locator('#longitude').fill(String(lng));
   await page.locator('#add-point').click();
  }
  await expect(page.locator('#draft-count')).toContainText('3 draft point');
  await expect(page.locator('#save')).toBeDisabled();
  await expect(page.locator('#save-all')).toBeDisabled();
  await screenshotStep(page,info,'unauthenticated-boundary-save-denied');
 });
 // Explicit negative-case coverage for the owner-only entry and parking map tools.
 // These tests deliberately use no credentials and must never write a zone.
 for (const [zoneType,pointCount] of [['entry',1],['parking',1],['entry_area',3],['parking_area',3]]) {
  test('anonymous '+zoneType+' draft cannot be saved',async({page},info)=>{
   await visit(page,'/sandbox-zone-editor.html');
   await page.locator('#zone-type').selectOption(zoneType);
   await page.locator('summary').filter({hasText:'Optional: enter exact coordinates'}).click();
   for (const [lat,lng] of [[29.02,-80.93],[29.021,-80.93],[29.021,-80.929]].slice(0,pointCount)) {
    await page.locator('#latitude').fill(String(lat));
    await page.locator('#longitude').fill(String(lng));
    await page.locator('#add-point').click();
   }
   await expect(page.locator('#draft-count')).toContainText(pointCount+' draft point');
   await expect(page.locator('#save')).toBeDisabled();
   await expect(page.locator('#saved li')).toHaveCount(0);
   await screenshotStep(page,info,'anonymous-'+zoneType+'-save-denied');
  });
 }
 test('anonymous access-zone drafts do not persist after page reload',async({page},info)=>{
  await visit(page,'/sandbox-zone-editor.html');
  await page.locator('#zone-type').selectOption('parking_area');
  await page.locator('summary').filter({hasText:'Optional: enter exact coordinates'}).click();
  for(const [lat,lng] of [[29.02,-80.93],[29.021,-80.93],[29.021,-80.929]]){
   await page.locator('#latitude').fill(String(lat));
   await page.locator('#longitude').fill(String(lng));
   await page.locator('#add-point').click();
  }
  await expect(page.locator('#draft-count')).toContainText('3 draft point');
  await expect(page.locator('#save')).toBeDisabled();
  await page.reload();
  await expect(page.locator('#saved li')).toHaveCount(0);
  await expect(page.locator('#save')).toBeDisabled();
  await screenshotStep(page,info,'anonymous-zone-draft-reload-no-persistence');
 });
 test('switching zone type protects an unsaved hunting boundary',async({page},info)=>{
  await visit(page,'/sandbox-zone-editor.html');
  await page.locator('summary').filter({hasText:'Optional: enter exact coordinates'}).click();
  for(const [lat,lng] of [[29.02,-80.93],[29.021,-80.93],[29.021,-80.929]]){
   await page.locator('#latitude').fill(String(lat));
   await page.locator('#longitude').fill(String(lng));
   await page.locator('#add-point').click();
  }
  await expect(page.locator('#draft-count')).toContainText('3 draft point');
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('#zone-type').selectOption('parking_area');
  await expect(page.locator('#zone-type')).toHaveValue('hunting_area');
  await expect(page.locator('#draft-count')).toContainText('3 draft point');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#zone-type').selectOption('parking_area');
  await expect(page.locator('#zone-type')).toHaveValue('parking_area');
  await expect(page.locator('#draft-count')).toContainText('0 draft point');
  await expect(page.locator('#save')).toBeDisabled();
  await screenshotStep(page,info,'zone-type-change-discards-only-after-confirmation');
 });
 test('keyboard-only coordinate entry keeps anonymous boundary unsaved',async({page},info)=>{
  await visit(page,'/sandbox-zone-editor.html');
  const details=page.locator('summary').filter({hasText:'Optional: enter exact coordinates'});
  await details.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#latitude')).toBeVisible();
  for(const [lat,lng] of [[29.02,-80.93],[29.021,-80.93],[29.021,-80.929]]){
   await page.locator('#latitude').focus();
   await page.keyboard.press('ControlOrMeta+A');
   await page.keyboard.type(String(lat));
   await page.locator('#longitude').focus();
   await page.keyboard.press('ControlOrMeta+A');
   await page.keyboard.type(String(lng));
   await page.locator('#add-point').focus();
   await page.keyboard.press('Enter');
  }
  await expect(page.locator('#draft-count')).toContainText('3 draft point');
  await expect(page.locator('#save')).toBeDisabled();
  await expect(page.locator('#save-all')).toBeDisabled();
  await screenshotStep(page,info,'keyboard-coordinate-entry-anonymous-save-denied');
 });
 test('human fills landowner login',async({page},info)=>{
  await visit(page,'/landowner-portal.html');
  const creds=requireSyntheticCredentials('QA_LANDOWNER');
  test.skip(!creds,'BLOCKED: synthetic QA_LANDOWNER_EMAIL/PASSWORD secrets not configured');
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-password').fill(creds.password);
  await page.locator('#signin-btn').click();
  // A hidden dashboard already contains the ID upload input before login; attached is not proof of authentication.
  await expect(page.locator('#dashboard')).toBeVisible({timeout:20000});
  await expect(page.locator('#auth-card')).toBeHidden();
  await screenshotStep(page,info,'landowner-signed-in');
 });
 test('authenticated synthetic landowner session survives reload',async({page},info)=>{
  const creds=requireSyntheticCredentials('QA_LANDOWNER');
  test.skip(!creds,'BLOCKED: verified synthetic QA_LANDOWNER credentials not configured');
  await visit(page,'/landowner-portal.html');
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-password').fill(creds.password);
  await page.locator('#signin-btn').click();
  await expect(page.locator('#dashboard')).toBeVisible({timeout:20000});
  await expect(page.locator('#auth-card')).toBeHidden();
  await page.reload();
  await expect(page.locator('#dashboard')).toBeVisible({timeout:20000});
  await expect(page.locator('#auth-card')).toBeHidden();
  await screenshotStep(page,info,'landowner-session-persists-after-reload');
 });
 test('human fills outfitter login',async({page},info)=>{
  await visit(page,'/outfitter-portal.html');
  const creds=requireSyntheticCredentials('QA_OUTFITTER');
  test.skip(!creds,'BLOCKED: synthetic QA_OUTFITTER_EMAIL/PASSWORD secrets not configured');
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-pass').fill(creds.password);
  await page.locator('#si-btn').click();
  // The pre-login HTML already contains dashboard/listing text. Require the actual authenticated dashboard to become visible.
  await expect(page.locator('#dashboard')).toBeVisible({timeout:20000});
  await expect(page.locator('#panel-signin')).toBeHidden();
  await screenshotStep(page,info,'outfitter-signed-in');
 });
 test('admin logs in and clicks Reservations and ID verification tabs',async({page},info)=>{
  await visit(page,'/admin.html');
  const creds=requireSyntheticCredentials('QA_ADMIN');
  test.skip(!creds,'BLOCKED: synthetic QA_ADMIN_EMAIL/PASSWORD secrets not configured');
  await page.locator('#email').fill(creds.email);
  await page.locator('#password').fill(creds.password);
  await page.locator('#login button[type=submit]').click();
  await expect(page.locator('[data-admin-tab=reservations]')).toBeVisible({timeout:20000});
  await page.locator('[data-admin-tab=reservations]').click();
  await expect(page.locator('#reservations-panel')).toBeVisible();
  await screenshotStep(page,info,'admin-reservations-tab');
  await page.locator('[data-admin-tab=identities]').click();
  await expect(page.locator('#identities-panel')).toBeVisible();
 });
});
