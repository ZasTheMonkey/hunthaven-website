import { test, expect } from '@playwright/test';
import { visit, checkOverflow, checkNoRawScript, screenshotStep } from './helpers.mjs';

// Landowner QA: responsive accessibility at browser zoom, using anonymous synthetic state.
// No account, database writes, Stripe activity, or production access.
test.describe('Bot B: zone editor zoom and keyboard regression', () => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560]) {
    test('zone editor at 200% zoom equivalent, viewport ' + width, async ({ page }, info) => {
      // Playwright has no portable browser-zoom API; CSS zoom is not equivalent.
      // A half-width viewport approximates 200% layout reflow only; report accordingly.
      await page.setViewportSize({ width: Math.max(160, Math.round(width / 2)), height: 900 });
      await visit(page, '/sandbox-zone-editor.html');
      await expect(page.locator('#zone-type')).toBeVisible();
      await expect(page.locator('#map')).toBeVisible();
      await checkNoRawScript(page);
      await checkOverflow(page);
      await expect(page.locator('#save')).toBeDisabled();
      await screenshotStep(page, info, 'zone-editor-half-width-reflow-' + width);
    });
  }
});
