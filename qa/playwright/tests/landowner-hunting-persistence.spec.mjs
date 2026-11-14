import { test, expect } from '@playwright/test';
import { visit, screenshotStep, requireSyntheticCredentials } from './helpers.mjs';

// Bot B owns this isolated synthetic fixture test. It never uses real listings.
test('synthetic landowner hunting boundary survives reload and is cleaned up', async ({ page }, info) => {
  const credentials = requireSyntheticCredentials('QA_LANDOWNER');
  const listingId = process.env.QA_LANDOWNER_LISTING_ID;
  test.skip(!credentials || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId || ''),
    'BLOCKED: sandbox-only landowner credentials and verified synthetic listing ID required');

  // A UUID alone does not establish that the listing is disposable or geographically valid.
  // Require independently verified fixture ownership, bounds and cleanup before writes.
  const rawPoints = process.env.QA_LANDOWNER_ZONE_POINTS || '';
  const points = rawPoints.split(';').map(pair => pair.split(',').map(Number));
  const validPoints = rawPoints.length > 0 && points.length >= 3 &&
    points.every(pair => pair.length === 2 && pair.every(Number.isFinite) &&
      Math.abs(pair[0]) <= 90 && Math.abs(pair[1]) <= 180) &&
    new Set(points.map(pair => pair.join(','))).size >= 3;
  test.skip(!validPoints || process.env.QA_LANDOWNER_FIXTURE_VERIFIED !== 'true' ||
    process.env.QA_LANDOWNER_ZONE_CLEANUP_VERIFIED !== 'true',
    'BLOCKED: fixture-specific polygon, independently verified sandbox ownership/bounds and reliable cleanup required');

  const label = ('QA hunting boundary ' + info.project.name + ' ' + Date.now()).slice(0, 80);
  await visit(page, '/landowner-portal.html');
  await page.locator('#si-email').fill(credentials.email);
  await page.locator('#si-password').fill(credentials.password);
  await page.locator('#signin-btn').click();
  await expect(page.locator('#dashboard')).toBeVisible({ timeout: 20000 });
  await visit(page, '/sandbox-zone-editor.html?listing=' + encodeURIComponent(listingId));
  await expect(page.locator('#status')).toContainText('Editing your', { timeout: 20000 });

  const row = page.locator('#saved li').filter({ hasText: label });
  try {
    await page.locator('#zone-type').selectOption('hunting_area');
    await page.locator('#zone-label').fill(label);
    await page.locator('summary').filter({ hasText: 'Optional: enter exact coordinates' }).click();
    for (const [latitude, longitude] of points) {
      await page.locator('#latitude').fill(String(latitude));
      await page.locator('#longitude').fill(String(longitude));
      await page.locator('#add-point').click();
    }
    await expect(page.locator('#save')).toBeEnabled();
    await page.locator('#save').click();
    await expect(page.locator('#status')).toContainText('Zone saved', { timeout: 20000 });
    await expect(row).toHaveCount(1);
    await page.reload();
    await expect(page.locator('#status')).toContainText('Editing your', { timeout: 20000 });
    await expect(row).toHaveCount(1);
    await screenshotStep(page, info, 'synthetic-hunting-boundary-persisted');
  } finally {
    if (await row.count()) {
      page.once('dialog', dialog => dialog.accept());
      await row.getByRole('button', { name: 'Delete ' + label }).click();
      await expect(row).toHaveCount(0, { timeout: 20000 });
    }
  }
});
