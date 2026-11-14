import { test, expect } from '@playwright/test';
import { visit, screenshotStep } from './helpers.mjs';

// Bot B: browser-level negative cases; anonymous synthetic state, no writes.
// A successful test proves input rejection in the deployed UI, NOT owner save/RLS.
test.describe('Landowner coordinate input guardrails', () => {
  test('missing latitude or longitude does not create a draft corner', async ({ page }, info) => {
    await visit(page, '/sandbox-zone-editor.html');
    await page.locator('summary').filter({ hasText: 'Optional: enter exact coordinates' }).click();
    await page.locator('#latitude').fill('29.02');
    await page.locator('#add-point').click();
    await expect(page.locator('#status')).toContainText('Enter both latitude and longitude.');
    await expect(page.locator('#draft-count')).toContainText('No draft points');
    await expect(page.locator('#save')).toBeDisabled();
    await screenshotStep(page, info, 'missing-coordinate-rejected');
  });

  for (const [name, latitude, longitude] of [
    ['latitude over 90', '91', '-80.93'],
    ['latitude below minus 90', '-91', '-80.93'],
    ['longitude over 180', '29.02', '181'],
    ['longitude below minus 180', '29.02', '-181'],
  ]) {
    test(name + ' is rejected without draft mutation', async ({ page }, info) => {
      await visit(page, '/sandbox-zone-editor.html');
      await page.locator('summary').filter({ hasText: 'Optional: enter exact coordinates' }).click();
      await page.locator('#latitude').fill(latitude);
      await page.locator('#longitude').fill(longitude);
      await page.locator('#add-point').click();
      await expect(page.locator('#status')).toContainText('Coordinates out of range.');
      await expect(page.locator('#draft-count')).toContainText('No draft points');
      await expect(page.locator('#save')).toBeDisabled();
      await screenshotStep(page, info, 'invalid-coordinate-' + name.replaceAll(' ', '-'));
    });
  }
});
