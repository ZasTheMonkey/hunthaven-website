import { test, expect } from '@playwright/test';
import { visit, screenshotStep, requireSyntheticCredentials } from './helpers.mjs';

// Non-mutating authenticated negative cases: invalid polygons must be rejected
// before any Supabase insert. A verified disposable listing is still required.
test('synthetic owner cannot save a self-crossing hunting boundary', async ({ page }, info) => {
  const creds = requireSyntheticCredentials('QA_LANDOWNER');
  const listingId = process.env.QA_LANDOWNER_LISTING_ID || '';
  test.skip(!creds || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(listingId) ||
    process.env.QA_LANDOWNER_FIXTURE_VERIFIED !== 'true',
    'BLOCKED: verified sandbox-only landowner identity and owned disposable listing required');

  await visit(page, '/landowner-portal.html');
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-password').fill(creds.password);
  await page.locator('#signin-btn').click();
  await expect(page.locator('#dashboard')).toBeVisible({ timeout: 20000 });

  await visit(page, '/sandbox-zone-editor.html?listing=' + encodeURIComponent(listingId));
  await expect(page.locator('#status')).toContainText('Editing your', { timeout: 20000 });
  await page.locator('#zone-type').selectOption('hunting_area');
  await page.locator('#zone-label').fill('QA invalid crossing boundary');
  await page.locator('summary').filter({ hasText: 'Optional: enter exact coordinates' }).click();

  // Bowtie: nonadjacent edges cross. These are synthetic coordinates; no save
  // should be sent, and the draft is discarded by closing this page.
  for (const [lat, lng] of [[29.02,-80.93],[29.022,-80.928],[29.02,-80.928],[29.022,-80.93]]) {
    await page.locator('#latitude').fill(String(lat));
    await page.locator('#longitude').fill(String(lng));
    await page.locator('#add-point').click();
  }
  await expect(page.locator('#draft-count')).toContainText('4 draft point');
  await expect(page.locator('#save')).toBeEnabled();
  let writes = 0;
  page.on('request', request => {
    if (request.method() !== 'GET' && /listing_access_zones/.test(request.url())) writes++;
  });
  await page.locator('#save').click();
  await expect(page.locator('#status')).toContainText('non-crossing corners');
  expect(writes, 'Invalid polygon must be rejected before a network write').toBe(0);
  await expect(page.locator('#saved li').filter({ hasText: 'QA invalid crossing boundary' })).toHaveCount(0);
  await screenshotStep(page, info, 'invalid-crossing-boundary-rejected');
});
