import { test, expect } from '@playwright/test';
import { visit,screenshotStep,checkNoRawScript,checkOverflow,requireSyntheticCredentials } from './helpers.mjs';
test.describe('Bot B: real landowner, outfitter and admin browser',()=>{
 for(const route of ['/landowner-portal.html','/outfitter-portal.html','/admin.html','/list-your-land.html','/outfitter-experience.html','/outfitter-pay.html','/sandbox-zone-editor.html','/admin-listing-reviews.html']){
  test('open, render and screenshot '+route,async({page},info)=>{
   await visit(page,route);await checkNoRawScript(page);await checkOverflow(page);
   await screenshotStep(page,info,'page-'+route.replace(/[^a-z0-9]/gi,'-'));
  });
 }
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
