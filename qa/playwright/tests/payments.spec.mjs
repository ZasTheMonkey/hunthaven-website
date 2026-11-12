import { test, expect } from '@playwright/test';

/**
 * Browser-based Stripe TEST-mode card suite.
 * Requires a distinct, freshly-created sandbox checkout URL for EACH case.
 * Never reuses a Checkout Session or operates on live Stripe.
 */
const cases=[
 {key:'success',card:'4242424242424242',expected:'success'},
 {key:'declined',card:'4000000000000002',expected:'declined'},
 {key:'insufficient_funds',card:'4000000000009995',expected:'declined'},
 {key:'authentication_required',card:'4000002500003155',expected:'3ds'},
];
const getFixture=(key)=>{
 const raw=process.env.QA_STRIPE_TEST_CHECKOUTS_JSON;
 if(!raw)return null;
 const fixtures=JSON.parse(raw);
 return fixtures[key]||null;
};
async function stripeField(page,kind){
 const selector=kind==='number'?'[name="cardnumber"],[name="number"],input[autocomplete="cc-number"]':kind==='expiry'?'[name="exp-date"],[name="expiry"],input[autocomplete="cc-exp"]':'[name="cvc"],input[autocomplete="cc-csc"]';
 for(const frame of page.frames()){
  const loc=frame.locator(selector).first();
  if(await loc.count())return loc;
 }
 return null;
}
async function fillCard(page,card){
 const number=await stripeField(page,'number');
 if(!number)throw new Error('Stripe payment card field not found in live browser; inspect video and update selectors');
 await number.fill(card);
 const expiry=await stripeField(page,'expiry');
 if(expiry)await expiry.fill('1234');
 const cvc=await stripeField(page,'cvc');
 if(cvc)await cvc.fill('123');
 for(const name of ['Email','Name on card','Cardholder name','Billing name']){
  const input=page.getByLabel(name,{exact:false}).first();
  if(await input.count() && await input.isVisible()){
   await input.fill(name==='Email'?'synthetic-qa@example.invalid':'LeaseWild Test');
  }
 }
}
test.describe('Stripe real hosted TEST checkout',()=>{
 for(const c of cases){
  test(c.key+' — fill and submit official Stripe test card',async({page},info)=>{
   const fixture=getFixture(c.key);
   test.skip(!fixture,'BLOCKED: fresh sandbox TEST Checkout URL missing in QA_STRIPE_TEST_CHECKOUTS_JSON for '+c.key);
   const u=new URL(fixture.url);
   expect(u.protocol).toBe('https:');
   expect(u.hostname).toBe('checkout.stripe.com');
   expect(u.pathname).toMatch(/^\/c\//);
   expect(fixture.mode).toBe('test');
   expect(fixture.synthetic).toBe(true);
   await page.goto(u.toString(),{waitUntil:'domcontentloaded'});
   await expect(page.locator('body')).toBeVisible();
   // Capture the hosted checkout before entering any card details. Never persist
   // screenshots of populated payment fields in CI artifacts, even for TEST cards.
   await page.screenshot({path:info.outputPath(c.key+'-pre-card.png'),fullPage:true});
   await fillCard(page,c.card);
   const pay=page.getByRole('button',{name:/pay|authorize|submit|book|confirm/i}).last();
   await expect(pay).toBeVisible();
   await pay.click();
   if(c.expected==='declined'){
    await expect(page.getByText(/declin|insufficient funds|not successful|try another card|could not be processed/i).first()).toBeVisible({timeout:25000});
   }else if(c.expected==='3ds'){
    const challenge=page.getByText(/authenticate|authentication|verify|3d secure|complete your payment/i).first();
    await expect(challenge).toBeVisible({timeout:30000});
   }else{
    await expect(page).toHaveURL(/leasewild-sandbox\.pages\.dev/,{timeout:45000});
   }
   // Only screenshot after a successful return to the LeaseWild sandbox.
   // Stripe decline and 3DS pages may retain sensitive values inside iframes,
   // which page-level input masks cannot reliably redact.
   if(c.expected==='success')await page.screenshot({path:info.outputPath(c.key+'-result.png'),fullPage:true});
  });
 }
 for(const name of ['full_refund','partial_refund','cancellation_before_capture','cancellation_after_capture','duplicate_payment','promo_discount','tax','outfitter_addon','cleaning_deposit','payout']){
  test(name+' — verified end-to-end',async()=>{
   test.skip(true,'BLOCKED: requires isolated synthetic booking, Stripe TEST state reconciliation, and role-authorized refund/capture/payout UI. Never claim PASS based on simulation.');
  });
 }
});
