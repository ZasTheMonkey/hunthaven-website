import { test, expect } from '@playwright/test';
import { visit,screenshotStep,checkNoRawScript,checkOverflow,requireSyntheticCredentials } from './helpers.mjs';
test.describe('Bot A: real hunter browser',()=>{
 for(const route of ['/', '/listings.html','/fishing.html','/outfitters.html','/pricing.html','/about.html','/howitworks.html','/terms.html','/privacy.html','/contact.html','/guest-portal.html','/sandbox-guest-id-upload.html']){
  test('open, render and screenshot '+route,async({page},info)=>{
   await visit(page,route);await checkNoRawScript(page);await checkOverflow(page);
   await screenshotStep(page,info,'page-'+route.replace(/[^a-z0-9]/gi,'-'));
  });
 }
 test('human clicks listing filters',async({page},info)=>{
  await visit(page,'/listings.html');
  const filters=page.locator('.card-filter-btn');
  expect(await filters.count()).toBeGreaterThan(1);
  await filters.filter({hasText:/fishing/i}).first().click();
  await expect(filters.filter({hasText:/fishing/i}).first()).toHaveAttribute('aria-pressed','true');
  await screenshotStep(page,info,'fishing-filter-clicked');
  await filters.filter({hasText:/all/i}).first().click();
 });
 test('human opens hunter login and types synthetic credentials',async({page},info)=>{
  await visit(page,'/guest-portal.html');
  await expect(page.locator('#si-email')).toBeAttached();
  await expect(page.locator('#si-pass')).toBeAttached();
  const credentials=requireSyntheticCredentials('QA_HUNTER');
  test.skip(!credentials,'BLOCKED: add QA_HUNTER_EMAIL and QA_HUNTER_PASSWORD repository secrets for authenticated browser testing');
  await page.locator('#si-email').fill(credentials.email);
  await page.locator('#si-pass').fill(credentials.password);
  await page.locator('#si-btn').click();
  await expect(page.locator('#dtab-bookings')).toBeVisible({timeout:20000});
  await screenshotStep(page,info,'hunter-signed-in');
 });
 test('guest ID upload rejects invalid invitation in real UI',async({page},info)=>{
  await visit(page,'/sandbox-guest-id-upload.html?token=invalid');
  await expect(page.locator('#f')).toBeHidden();
  await expect(page.locator('#msg')).toContainText('invalid');
  await screenshotStep(page,info,'invalid-id-invitation');
 });
 test('real hosted Stripe TEST checkout',async({page})=>{
  test.skip(!process.env.QA_TEST_BOOKING_URL,'BLOCKED: requires a fresh disposable sandbox checkout URL and synthetic test listing; never charge a real card');
  const u=new URL(process.env.QA_TEST_BOOKING_URL);
  expect(['checkout.stripe.com','checkout.stripe.dev']).toContain(u.hostname);
  await page.goto(u.toString(),{waitUntil:'domcontentloaded'});
  await expect(page.locator('body')).toBeVisible();
  // Do not claim a paid booking without completing and reconciling Stripe TEST.
  test.fail(true,'A full test checkout needs a controlled fixture, payment reconciliation and cleanup');
  throw new Error('Checkout opened, but automated TEST payment completion is not yet implemented');
 });
});
