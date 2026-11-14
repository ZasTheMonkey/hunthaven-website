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
      if (width === 320) {
        const viewport = await page.evaluate(() => document.documentElement.clientWidth);
        const offenders = await page.locator('body *').evaluateAll((elements, viewportWidth) => elements
          .map(element => {
            const rect = element.getBoundingClientRect();
            return { tag: element.tagName.toLowerCase(), id: element.id, className: String(element.className || '').slice(0, 120), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), scrollWidth: element.scrollWidth };
          })
          .filter(item => item.left < -8 || item.right > viewportWidth + 8 || item.scrollWidth > Math.ceil(item.width) + 8)
          .slice(0, 20), viewport);
        console.log('Extreme reflow overflow diagnostics', JSON.stringify({ viewport, offenders }));
      }
      await checkOverflow(page);
      await expect(page.locator('#save')).toBeDisabled();
      await screenshotStep(page, info, 'zone-editor-half-width-reflow-' + width);
    });
  }
});
