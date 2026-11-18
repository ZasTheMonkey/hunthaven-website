import {test,expect} from '@playwright/test';
import {readFile,readdir} from 'node:fs/promises';
const routes=(await readdir(new URL('../../../',import.meta.url))).filter(p=>p.endsWith('.html'));
for(const route of routes)test('public route responsive and accessibility audit '+route,async({page},info)=>{
 test.setTimeout(90000);
 if(process.env.QA_CANDIDATE_SOURCE==='true')await page.route('https://leasewild-sandbox.pages.dev/**',async r=>{const u=new URL(r.request().url());const file=u.pathname.slice(1);if(/^[\w-]+\.(html|css)$/.test(file)){return r.fulfill({contentType:file.endsWith('css')?'text/css':'text/html',body:await readFile(new URL('../../../'+file,import.meta.url),'utf8')});}return r.fallback();});
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='leasewild.com'||u.hostname.endsWith('.leasewild.com')||(u.hostname.endsWith('.supabase.co')&&u.hostname!=='kbkdfpmlyggfijkyjxoi.supabase.co'))return r.abort();return r.fallback();});
 const response=await page.goto('https://leasewild-sandbox.pages.dev/'+route,{waitUntil:'domcontentloaded'});
 expect(response.status()).toBeLessThan(400);
 if(route==='list-your-land.html'){
  await expect(page).toHaveURL(/\/landowner-portal(?:\.html)?(?:[?#]|$)/);
  info.annotations.push({type:'coverage',description:'Anonymous auth-gate redirect only; authenticated listing creation is separate coverage.'});
 }
 await page.evaluate(()=>document.fonts.ready);
 const dimensions=[];
 for(const width of [320,375,390,430,768,1024,1280,1440,1920,2560]){
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  dimensions.push(await page.evaluate(()=>({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})));
 }
 await info.attach('dimensions.json',{body:JSON.stringify(dimensions),contentType:'application/json'});
 // Measure finished visual states rather than an intermediate fade-in frame.
 await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming().iterations)).map(a=>a.finished.catch(()=>{})));});
 await page.addScriptTag({path:new URL('../node_modules/axe-core/axe.min.js',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
 const a=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(x=>({id:x.id,impact:x.impact,description:x.description,nodes:x.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,8)}));});
 await info.attach('accessibility.json',{body:JSON.stringify(a),contentType:'application/json'});
 if(a.length||dimensions.some(d=>d.scroll>d.client+8))await page.screenshot({path:info.outputPath('page-findings.png'),fullPage:false});
 expect(dimensions.filter(d=>d.scroll>d.client+8),'horizontal overflow').toEqual([]);
 expect(a.filter(x=>['serious','critical'].includes(x.impact)),'serious or critical accessibility findings').toEqual([]);
});
