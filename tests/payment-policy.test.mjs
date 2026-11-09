import test from 'node:test';
import assert from 'node:assert/strict';
import {quote,cents,checkoutTime,windowFor,validateClaim,validHold} from '../supabase/functions/_shared/payment-policy.mjs';
test('lease splits 80/20; cleaning is excluded from immediate charge',()=>{
 const q=quote({rate:100,nights:1,deposit:50});
 assert.equal(q.owner,8000);assert.equal(q.commission,2000);assert.equal(q.deposit,5000);
 assert.equal(q.total,10970);assert.equal(q.platform,2970);
});
test('100% cleaning is independent of lease pricing and protection',()=>{
 const a=quote({rate:100,nights:2,deposit:0});const b=quote({rate:100,nights:2,deposit:500});
 assert.equal(a.total,b.total);assert.equal(a.owner,b.owner);
 const c=quote({rate:100,nights:2,protection:true});assert.equal(c.owner,a.owner);assert.equal(c.protection,1800);
});
test('discount is applied to lease before splitting, cents conserve total',()=>{
 const q=quote({rate:10.03,nights:1,discount:1,deposit:5});
 assert.equal(q.lease,903);assert.equal(q.commission,181);assert.equal(q.owner,722);assert.equal(q.owner+q.platform,q.total);
});
test('invalid amounts, dates and durations fail closed',()=>{
 for(const x of [NaN,Infinity,-1,'bad'])assert.throws(()=>cents(x));
 for(const nights of [0,1.2,366])assert.throws(()=>quote({rate:10,nights}));
 assert.throws(()=>quote({rate:10,nights:1,discount:20}));
 assert.throws(()=>checkoutTime('2026-02-30'));assert.throws(()=>checkoutTime('2026-11-09','24:00'));
 assert.throws(()=>checkoutTime('2026-11-09','00:00','Invalid/Zone'));
});
test('midnight default supports full-day booking',()=>{
 assert.equal(checkoutTime('2026-11-09'),'2026-11-09T05:00:00.000Z');
 assert.equal(Date.parse(checkoutTime('2026-11-10'))-Date.parse(checkoutTime('2026-11-09')),86400000);
});
test('owner-selected times and property time zones are honored',()=>{
 assert.equal(checkoutTime('2026-07-04','15:30','America/Chicago'),'2026-07-04T20:30:00.000Z');
 assert.equal(checkoutTime('2026-07-04','08:00','America/Phoenix'),'2026-07-04T15:00:00.000Z');
});
test('DST calendar days and exact 48 hour deadline',()=>{
 const a=windowFor('2026-03-08','00:00');const b=windowFor('2026-03-09','00:00');
 assert.equal(Date.parse(b.checkout_at)-Date.parse(a.checkout_at),23*3600000);
 assert.equal(Date.parse(a.claim_deadline)-Date.parse(a.checkout_at),48*3600000);
 assert.equal(Date.parse(a.checkout_at)-Date.parse(a.hold_at),24*3600000);
 assert.equal(Date.parse(checkoutTime('2026-11-02'))-Date.parse(checkoutTime('2026-11-01')),25*3600000);
 assert.throws(()=>checkoutTime('2026-03-08','02:30'));
});
const row={state:'held',deposit_cents:5000,checkout_at:'2026-11-10T05:00:00Z',claim_deadline:'2026-11-12T05:00:00Z',capture_before:'2026-11-15T00:00:00Z'};
test('claim allowed only inside exact 48-hour window',()=>{
 validateClaim(row,2500,'Extra cleaning was needed',Date.parse(row.checkout_at));
 assert.throws(()=>validateClaim(row,2500,'Extra cleaning was needed',Date.parse(row.checkout_at)-1));
 assert.throws(()=>validateClaim(row,2500,'Extra cleaning was needed',Date.parse(row.claim_deadline)));
});
test('claim amount, explanation, authorization and expiry enforced',()=>{
 for(const amount of [0,-1,5001,1.5,NaN])assert.throws(()=>validateClaim(row,amount,'Extra cleaning was needed',Date.parse(row.checkout_at)));
 assert.throws(()=>validateClaim(row,100,'',Date.parse(row.checkout_at)));
 assert.throws(()=>validateClaim({...row,state:'captured'},100,'Extra cleaning was needed',Date.parse(row.checkout_at)));
 assert.throws(()=>validateClaim({...row,capture_before:row.checkout_at},100,'Extra cleaning was needed',Date.parse(row.checkout_at)));
});
test('hold must cover deadline with safety margin; never assume card window',()=>{
 const pi={status:'requires_capture',latest_charge:{payment_method_details:{card:{capture_before:Date.parse(row.capture_before)/1000}}}};
 assert.equal(validHold(pi,row.claim_deadline),true);
 assert.equal(validHold({...pi,status:'succeeded'},row.claim_deadline),false);
 assert.equal(validHold({...pi,latest_charge:'ch_unexpanded'},row.claim_deadline),false);
 assert.equal(validHold(pi,row.capture_before),false);
});

test('fixed sales tax applies after discounts, excludes holds and optional protection',()=>{
 const q=quote({rate:100,nights:2,discount:50,deposit:80,protection:true});
 assert.equal(q.tax,975);assert.equal(q.owner,12000);assert.equal(q.commission,3000);
 assert.equal(q.total,q.lease+q.tax+q.protection+q.processing);
 assert.equal(quote({rate:10.03,nights:1,discount:1}).tax,59);
 assert.equal(q.owner+q.platform,q.total);
});
