import { expect } from '@playwright/test';
export async function visit(page,route) {
 const response=await page.goto(route,{waitUntil:'domcontentloaded'});
 expect(response,route+' should return a response').toBeTruthy();
 expect(response.status(),route+' should not be missing or broken').toBeLessThan(400);
 await expect(page.locator('body')).toBeVisible();
 await expect(page.locator('body')).not.toBeEmpty();
 await expect(page.locator('html')).toHaveCount(1);
 return response;
}
export async function screenshotStep(page,testInfo,name){
 await page.evaluate(() => document.fonts.ready.then(() => {}));
 const dimensions = await page.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight,
  viewportWidth: document.documentElement.clientWidth,
  viewportHeight: window.innerHeight,
 }));
 const { width, height, viewportWidth, viewportHeight } = dimensions;
 const step = Math.max(1, Math.min(viewportHeight, 1800));
 const total = Math.max(1, Math.ceil(height / step));
 const maxTiles = 10;
 if (total > maxTiles || width > viewportWidth) {
  testInfo.annotations.push({
   type: 'screenshot coverage',
   description: `${name}: page ${width}×${height}, viewport ${viewportWidth}×${viewportHeight}; ${Math.min(total,maxTiles)} viewport tiles captured`,
  });
 }
 // Playwright clip coordinates are viewport-relative; scrolling first avoids
 // the 'Clipped area is outside the resulting image' error on long pages.
 const originalScroll = await page.evaluate(() => window.scrollY);
 try {
  for (let i = 0; i < Math.min(total,maxTiles); i++) {
   const tile = i === maxTiles - 1 && total > maxTiles ? total - 1 : i;
   await page.evaluate(y => window.scrollTo(0,y), tile * step);
   const filename = i === 0 ? name : `${name}-part-${i+1}`;
   await page.screenshot({
    path: testInfo.outputPath(filename + '.png'),
    fullPage: false,
    scale: 'css',
    animations: 'disabled',
   });
  }
 } finally {
  await page.evaluate(y => window.scrollTo(0,y), originalScroll).catch(() => {});
 }
}
export async function checkNoRawScript(page) {
 const visible=await page.locator('body').innerText();
 expect(visible).not.toMatch(/(?:let reservationRows=\[\]|async function loadIdentities\(|const fmtMoney=v=>)/);
}
export async function checkOverflow(page) {
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
 expect(dimensions.scroll,'unexpected horizontal overflow').toBeLessThanOrEqual(dimensions.viewport+8);
}
export async function captureConsole(page){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));return errors;
}
export function requireSyntheticCredentials(prefix) {
 const email=process.env[prefix+'_EMAIL'],password=process.env[prefix+'_PASSWORD'];
 return email&&password?{email,password}:null;
}
