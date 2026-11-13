import { test, expect } from '@playwright/test';
import { visit, screenshotStep } from './helpers.mjs';

// Landowner QA: browser-only negative cases. No account, listing, or payment is mutated.
test.describe('Landowner zone geometry validation (anonymous sandbox)', () => {
  test('keyboard coordinate entry rejects out-of-range latitude and longitude', async ({ page }, info) => {
    await visit(page, '/sandbox-zone-editor.html');
    await page.locator('summary').filter({ hasText: 'Optional: enter exact coordinates' }).click();
    const latitude = page.locator('#latitude');
    const longitude = page.locator('#longitude');
    await latitude.fill('91');
    await longitude.fill('-80.93');
    await page.locator('#add-point').click();
    await expect(page.locator('#status')).toContainText('Coordinates out of range');
    await expect(page.locator('#draft-count')).toContainText('No draft points');
    await latitude.fill('29.02');
    await longitude.fill('-181');
    await page.locator('#add-point').click();
    await expect(page.locator('#status')).toContainText('Coordinates out of range');
    await expect(page.locator('#draft-count')).toContainText('No draft points');
    await expect(page.locator('#save')).toBeDisabled();
    await screenshotStep(page, info, 'invalid-coordinates-denied');
  });

  test('self-intersecting hunting boundary cannot be queued as a draft', async ({ page }, info) => {
    await visit(page, '/sandbox-zone-editor.html');
    await page.locator('#zone-label').fill('QA bow-tie boundary (unsaved)');
    await page.locator('summary').filter({ hasText: 'Optional: enter exact coordinates' }).click();
    for (const [lat, lng] of [
      [29.020, -80.930], [29.022, -80.928],
      [29.020, -80.928], [29.022, -80.930],
    ]) {
      await page.locator('#latitude').fill(String(lat));
      await page.locator('#longitude').fill(String(lng));
      await page.locator('#add-point').click();
    }
    await expect(page.locator('#draft-count')).toContainText('4 draft point');
    await page.locator('#keep-zone').click();
    await expect(page.locator('#status')).toContainText('Draw a valid hunting boundary');
    await expect(page.locator('#pending-count')).toContainText('0 other draft zones');
    await expect(page.locator('#save')).toBeDisabled();
    await screenshotStep(page, info, 'self-crossing-boundary-rejected');
  });
});
