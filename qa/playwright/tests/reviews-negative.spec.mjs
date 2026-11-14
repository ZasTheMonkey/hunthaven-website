import { test, expect } from '@playwright/test';
import { visit, screenshotStep, checkNoRawScript, checkOverflow, requireSyntheticCredentials } from './helpers.mjs';

test.describe('Bot B: hunter review fail-closed browser checks', () => {
  test('review page renders without overflow or raw source', async ({ page }, info) => {
    await visit(page, '/sandbox-hunter-review.html');
    await checkNoRawScript(page);
    await checkOverflow(page);
    await expect(page.locator('#status')).toContainText('A valid booking ID is required.');
    await expect(page.locator('#review-form')).toBeHidden();
    await screenshotStep(page, info, 'hunter-review-page-safe-default');
  });

  test('malformed booking ID never exposes the review form', async ({ page }, info) => {
    await visit(page, '/sandbox-hunter-review.html?booking=not-a-booking');
    await expect(page.locator('#status')).toContainText('A valid booking ID is required.');
    await expect(page.locator('#review-form')).toBeHidden();
    await screenshotStep(page, info, 'hunter-review-invalid-booking-rejected');
  });

  test('signed-out visitor cannot review a valid booking identifier', async ({ page }, info) => {
    await visit(page, '/sandbox-hunter-review.html?booking=00000000-0000-4000-8000-000000000001');
    await expect(page.locator('#status')).toContainText('Sign in to the landowner portal first.');
    await expect(page.locator('#review-form')).toBeHidden();
    await screenshotStep(page, info, 'hunter-review-signin-required');
  });

  test('authenticated landowner cannot review an unknown booking', async ({ page }, info) => {
    const credentials = requireSyntheticCredentials('QA_LANDOWNER');
    test.skip(!credentials, 'BLOCKED: verified synthetic QA_LANDOWNER credentials not configured');
    await visit(page, '/landowner-portal.html');
    await page.locator('#si-email').fill(credentials.email);
    await page.locator('#si-password').fill(credentials.password);
    await page.locator('#signin-btn').click();
    await expect(page.locator('#dashboard')).toBeVisible({ timeout: 20000 });
    await visit(page, '/sandbox-hunter-review.html?booking=00000000-0000-4000-8000-000000000001');
    await expect(page.locator('#status')).toContainText('This booking is not eligible for a review.', { timeout: 20000 });
    await expect(page.locator('#review-form')).toBeHidden();
    await screenshotStep(page, info, 'hunter-review-unknown-booking-denied');
  });
});
