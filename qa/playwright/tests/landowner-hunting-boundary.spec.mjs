import { test, expect } from '@playwright/test';
import { visit, screenshotStep, requireSyntheticCredentials } from './helpers.mjs';

// Dedicated synthetic-only hunting polygon persistence test. This test is NOT
// evidence of E2E success until executed by a real browser runner.
test('verified synthetic owner saves, reloads, and deletes hunting boundary', async ({page}, info) => {
  const owner = requireSyntheticCredentials('QA_LANDOWNER');
  const listingId = process.env.QA_LANDOWNER_LISTING_ID || '';
  const raw = process.env.QA_LANDOWNER_ZONE_POINTS || '';
  const points = raw.split(';').map(p => p.split(',').map(v => v.trim() === '' ? NaN : Number(v)));
  const valid = points.length >= 3 &&
    points.every(p => p.length === 2 && p.every(Number.isFinite) && p[0] >= -90 && p[0] <= 90 && p[1] >= -180 && p[1] <= 180) &&
    new Set(points.map(p => p.join(','))).size === points.length;
  const verified = process.env.QA_LANDOWNER_FIXTURE_VERIFIED === 'true' &&
    process.env.QA_LANDOWNER_ZONE_CLEANUP_VERIFIED === 'true';
  test.skip(!owner || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId) || !valid || !verified,
    'BLOCKED: verified disposable owner/listing, local polygon points and database cleanup required');

  const label = ('QA hunting boundary ' + info.project.name + ' ' + Date.now()).slice(0, 80);
  await visit(page, '/landowner-portal.html');
  await page.locator('#si-email').fill(owner.email);
  await page.locator('#si-password').fill(owner.password);
  await page.locator('#signin-btn').click();
  await expect(page.locator('#dashboard')).toBeVisible({timeout:20000});
  await visit(page, '/sandbox-zone-editor.html?listing=' + encodeURIComponent(listingId));
  await expect(page.locator('#status')).toContainText('Editing your', {timeout:20000});
  const row = page.locator('#saved li').filter({hasText:label});
  try {
    await page.locator('#zone-type').selectOption('hunting_area');
    await page.locator('#zone-label').fill(label);
    await page.locator('summary').filter({hasText:'Optional: enter exact coordinates'}).click();
    for (const [lat,lng] of points) {
      await page.locator('#latitude').fill(String(lat));
      await page.locator('#longitude').fill(String(lng));
      await page.locator('#add-point').click();
    }
    await expect(page.locator('#save')).toBeEnabled();
    await page.locator('#save').click();
    await expect(page.locator('#status')).toContainText('Zone saved', {timeout:20000});
    await expect(row).toHaveCount(1);
    await page.reload();
    await expect(page.locator('#status')).toContainText('Editing your', {timeout:20000});
    await expect(row).toHaveCount(1);
    await screenshotStep(page, info, 'authenticated-hunting-boundary-survives-reload');
  } finally {
    // A failed browser assertion can follow a successful server write.
    // Attempt cleanup after reload even when the UI never showed success.
    await page.reload();
    await expect(page.locator('#status')).toContainText('Editing your', {timeout:20000});
    if (await row.count()) {
      page.once('dialog', dialog => dialog.accept());
      await row.getByRole('button', {name:'Delete ' + label}).click();
      await expect(row).toHaveCount(0, {timeout:20000});
    }
    await page.reload();
    await expect(page.locator('#status')).toContainText('Editing your', {timeout:20000});
    await expect(row).toHaveCount(0, {timeout:20000});
  }
});
