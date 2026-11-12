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
 test('human fills landowner login',async({page},info)=>{
  await visit(page,'/landowner-portal.html');
  const creds=requireSyntheticCredentials('QA_LANDOWNER');
  test.skip(!creds,'BLOCKED: synthetic QA_LANDOWNER_EMAIL/PASSWORD secrets not configured');
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-password').fill(creds.password);
  await page.locator('#signin-btn').click();
  await expect(page.locator('#lo-id-file')).toBeAttached({timeout:20000});
  await screenshotStep(page,info,'landowner-signed-in');
 });
 test('human fills outfitter login',async({page},info)=>{
  await visit(page,'/outfitter-portal.html');
  const creds=requireSyntheticCredentials('QA_OUTFITTER');
  test.skip(!creds,'BLOCKED: synthetic QA_OUTFITTER_EMAIL/PASSWORD secrets not configured');
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-pass').fill(creds.password);
  await page.locator('#si-btn').click();
  await expect(page.locator('body')).toContainText(/listing|reservation|dashboard/i,{timeout:20000});
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
