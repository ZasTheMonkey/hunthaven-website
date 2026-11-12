import { test, expect } from '@playwright/test';
import { visit,screenshotStep,checkNoRawScript,checkOverflow,requireSyntheticCredentials } from './helpers.mjs';
test.describe('Bot A: real hunter browser',()=>{
 for(const route of ['/', '/listings.html','/fishing.html','/outfitters.html','/pricing.html','/about.html','/howitworks.html','/terms.html','/privacy.html','/contact.html','/guest-portal.html','/sandbox-guest-id-upload.html']){
  test('open, render and screenshot '+route,async({page},info)=>{
   await visit(page,route);await checkNoRawScript(page);await checkOverflow(page);
   if (route === '/terms.html') {
    await expect(page.getByRole('heading', { level: 1, name: 'Terms & Legal' })).toBeVisible();
    await expect(page.locator('.legal-section h2')).toHaveText([
     'Terms of Service', 'Landowner Agreement', 'Guest Terms', 'Liability Waiver & Release', 'Privacy Policy',
    ]);
    for (const heading of await page.locator('.legal-section h2').all()) {
     await expect(heading).toBeVisible();
    }
    await expect(page.locator('footer')).toBeVisible();
   }
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
 test('real hosted Stripe TEST checkout',async()=>{
  test.skip(true,'BLOCKED: full checkout, webhook reconciliation and synthetic fixture cleanup are not implemented; do not report this as passing');
 });
});
