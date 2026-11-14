import { test, expect } from '@playwright/test';
import { visit, screenshotStep, requireSyntheticCredentials } from './helpers.mjs';

// Bot B: negative authorization from a separate HUNTER identity, not merely a second owner.
// Runs only with disposable sandbox credentials and a listing belonging to a different owner.
test('synthetic hunter cannot inspect or modify landowner private access zones', async ({ page }, info) => {
  const hunter = requireSyntheticCredentials('QA_HUNTER');
  const listingId = process.env.QA_LANDOWNER_LISTING_ID;
  test.skip(!hunter || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId || ''),
    'NOT TESTED: verified disposable hunter credentials and unrelated synthetic landowner listing required');

  // Authenticate through the real hunter UI; no direct session injection or database mutation.
  await visit(page, '/hunter-portal.html');
  const email = page.locator('#si-email');
  const password = page.locator('#si-password');
  test.skip(!(await email.count()) || !(await password.count()),
    'NOT TESTED: hunter sign-in selectors require updating to deployed UI');
  await email.fill(hunter.email);
  await password.fill(hunter.password);
  await page.locator('#signin-btn').click();

  // Only attempt the authorization assertion after the UI has demonstrably authenticated.
  await expect(page.locator('#dashboard')).toBeVisible({ timeout: 20000 });
  await visit(page, '/sandbox-zone-editor.html?listing=' + encodeURIComponent(listingId));
  await expect(page.locator('#status')).toContainText('You do not have access to edit this listing.', { timeout: 20000 });
  await expect(page.locator('#saved li')).toHaveCount(0);
  await expect(page.locator('#save')).toBeDisabled();
  await expect(page.locator('#save-all')).toBeDisabled();
  await screenshotStep(page, info, 'hunter-private-owner-zones-denied');
});
