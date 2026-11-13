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
 const { width, height, devicePixelRatio } = await page.evaluate(() => {
  const root = document.documentElement;
  const body = document.body;
  return {
   width: Math.max(root.scrollWidth, root.offsetWidth, root.clientWidth, body.scrollWidth, body.offsetWidth, body.clientWidth),
   height: Math.max(root.scrollHeight, root.offsetHeight, root.clientHeight, body.scrollHeight, body.offsetHeight, body.clientHeight),
   devicePixelRatio: window.devicePixelRatio,
  };
 });

 // Keep each clip below WebKit's bitmap limit even at the emulated device scale.
 const maxSide = Math.min(4096, Math.floor(32000 / Math.max(1, devicePixelRatio)));
 const clipWidth = Math.min(width, maxSide);
 const tileCount = Math.ceil(height / maxSide);
 const maxTiles = 10;
 const capturedTiles = Math.min(tileCount, maxTiles);
 if (width > clipWidth || tileCount > maxTiles) {
  const rows = tileCount > maxTiles
   ? `rows 0–${(maxTiles - 1) * maxSide - 1} and ${(tileCount - 1) * maxSide}–${height - 1}`
   : 'all rows';
  testInfo.annotations.push({
   type: 'screenshot coverage',
   description: `${name}: ${width}×${height} CSS px at DPR ${devicePixelRatio}. Captured the leftmost ${clipWidth} px across ${rows}.`,
  });
 }
 for (let index = 0; index < capturedTiles; index++) {
  const tile = index === maxTiles - 1 ? tileCount - 1 : index;
  const y = tile * maxSide;
  const filename = tile === 0 ? name : `${name}-part-${tile + 1}`;
  await page.screenshot({
   path: testInfo.outputPath(filename + '.png'),
   fullPage: false,
   scale: 'css',
   clip: { x: 0, y, width: clipWidth, height: Math.min(height - y, maxSide) },
  });
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
