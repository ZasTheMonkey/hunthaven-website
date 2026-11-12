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
 const dimensions=await page.evaluate(()=>({height:Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0),width:document.documentElement.scrollWidth}));
 // Browser engines cannot screenshot a single bitmap dimension above 32767px.
 // Preserve full-page screenshots where possible; for exceptionally long pages
 // capture a viewport image instead of failing the underlying page-render test.
 const fullPage=dimensions.height<=32000&&dimensions.width<=32000;
 await page.screenshot({path:testInfo.outputPath(name+'.png'),fullPage});
 if(!fullPage) console.log(`Screenshot capped to viewport for oversized page (${dimensions.width}x${dimensions.height})`);
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
