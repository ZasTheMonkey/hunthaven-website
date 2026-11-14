import { test, expect } from '@playwright/test';
import { visit, screenshotStep, requireSyntheticCredentials } from './helpers.mjs';

// Bot B isolated negative authentication regression. Never logs credentials.
test('synthetic landowner rejects incorrect password without revealing dashboard', async ({ page }, info) => {
  const creds = requireSyntheticCredentials('QA_LANDOWNER');
  test.skip(!creds, 'BLOCKED: verified synthetic QA_LANDOWNER credentials unavailable');
  await visit(page, '/landowner-portal.html');
  await expect(page.locator('#auth-card')).toBeVisible();
  await page.locator('#si-email').fill(creds.email);
  await page.locator('#si-password').fill('deliberately-invalid-qa-password-20261113');
  await page.locator('#signin-btn').click();
  await expect(page.locator('#dashboard')).toBeHidden({ timeout: 20000 });
  await expect(page.locator('#auth-card')).toBeVisible();
  await page.reload();
  await expect(page.locator('#dashboard')).toBeHidden({ timeout: 20000 });
  await expect(page.locator('#auth-card')).toBeVisible();
  await screenshotStep(page, info, 'landowner-invalid-password-denied-after-reload');
});
