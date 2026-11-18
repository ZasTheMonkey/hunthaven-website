import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test.beforeEach(async({page})=>{
 if(process.env.QA_CANDIDATE_SOURCE==='true')await page.route('https://leasewild-sandbox.pages.dev/',async route=>route.fulfill({contentType:'text/html',body:await readFile(new URL('../../../index.html',import.meta.url),'utf8')}));
});

test('homepage species filters exclude unrelated active inventory',async({page},info)=>{
 await page.goto('https://leasewild-sandbox.pages.dev/');
 await expect(page.locator('#cards-grid')).toHaveAttribute('aria-busy','false');
 await page.getByRole('button',{name:'🦌 Deer',exact:true}).press('Enter');
 await expect(page.getByRole('button',{name:'🦌 Deer',exact:true})).toHaveAttribute('aria-pressed','true');
 const visible=page.locator('#cards-grid .card:visible');
 expect(await visible.count()).toBeGreaterThan(0);
 for(const card of await visible.all())expect(await card.getAttribute('data-species')).toMatch(/deer/i);
 await page.screenshot({path:info.outputPath('deer-filter.png'),fullPage:false});
 await page.getByRole('button',{name:'🐦 Dove',exact:true}).press('Enter');
 for(const card of await visible.all())expect(await card.getAttribute('data-species')).toMatch(/dove/i);
 await page.getByRole('button',{name:'🌎 All',exact:true}).press('Enter');
 expect(await visible.count()).toBeGreaterThan(1);
});
