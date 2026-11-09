import test from 'node:test';
import assert from 'node:assert/strict';
import {createProcessor} from '../supabase/functions/_shared/deposit-engine.mjs';
const now=Date.parse('2026-11-10T10:00:00Z');
function fixture(overrides={}) {
 const row={id:'p1',booking_id:'b1',payment_state:'paid',state:'scheduled',deposit_cents:5000,total_cents:10320,lease_intent_id:'lease',customer_id:'cus',payment_method_id:'pm',destination:'acct',checkout_at:new Date(now-3600000).toISOString(),hold_at:new Date(now-25*3600000).toISOString(),claim_deadline:new Date(now+47*3600000).toISOString(),...overrides};
 const calls=[];let hold={id:'hold',status:'requires_capture',amount:5000,latest_charge:{payment_method_details:{card:{capture_before:(now+6*86400000)/1000}}}};
 const deps={save:async(id,values)=>Object.assign(row,values),check:r=>{if(r.error)throw r.error;return r.data;},
  sb:{from:()=>({update:()=>({eq:async()=>({data:null,error:null})})})},
  release:async()=>{calls.push('release');row.state='released';row.next_attempt_at=null;},
  reconcileHold:async()=>{if(!row.deposit_intent_id)return null;if(hold.status==='succeeded')row.state='captured';return hold;},
  stripe:{checkout:{sessions:{retrieve:async()=>({status:'complete',payment_status:'paid',payment_intent:{id:'lease',status:'succeeded',amount_received:10320,payment_method:'pm',transfer_data:{destination:'acct'}}})}},paymentIntents:{
   retrieve:async(id)=>id==='lease'?{latest_charge:{refunded:false}}:hold,
   list:()=>({async *[Symbol.asyncIterator](){}}),
   create:async(params,options)=>{calls.push({create:params,key:options.idempotencyKey});return hold;},
   cancel:async()=>{calls.push('cancel');hold.status='canceled';},
   capture:async(id,params,options)=>{calls.push({capture:params,key:options.idempotencyKey});hold.status='succeeded';return {amount_received:params.amount_to_capture};}
  }}};
 return {row,calls,deps,process:createProcessor(deps),hold};
}
async function atNow(fn){const old=Date.now;Date.now=()=>now;try{await fn();}finally{Date.now=old;}}
test('scheduled deposit authorizes without capturing and routes to owner',()=>atNow(async()=>{
 const f=fixture();await f.process(f.row);assert.equal(f.row.state,'held');
 assert.equal(f.calls[0].create.capture_method,'manual');assert.equal(f.calls[0].create.application_fee_amount,0);assert.equal(f.calls[0].create.transfer_data.destination,'acct');assert.equal(f.calls.some(c=>c.capture),false);
}));
test('far-future hunt waits until hold time',()=>atNow(async()=>{
 const f=fixture({hold_at:new Date(now+86400000).toISOString()});await f.process(f.row);assert.equal(f.calls.length,0);assert.equal(f.row.next_attempt_at,f.row.hold_at);
}));
test('unclaimed hold releases at exact deadline',()=>atNow(async()=>{
 const f=fixture({state:'held',deposit_intent_id:'hold',claim_deadline:new Date(now).toISOString()});await f.process(f.row);assert.equal(f.row.state,'released');assert.deepEqual(f.calls,['release']);
}));
test('partial cleaning capture releases remainder via Stripe final capture',()=>atNow(async()=>{
 const f=fixture({state:'capturing',deposit_intent_id:'hold',claim_cents:2500,claim_at:new Date(now-1000).toISOString()});await f.process(f.row);assert.equal(f.row.captured_cents,2500);assert.equal(f.calls[0].capture.amount_to_capture,2500);assert.equal(f.calls[0].capture.application_fee_amount,0);
 await f.process(f.row);assert.equal(f.calls.length,1);
}));
test('short card authorization is canceled, never silently charged',()=>atNow(async()=>{
 const f=fixture();f.hold.latest_charge.payment_method_details.card.capture_before=(now+86400000)/1000;await f.process(f.row);assert.equal(f.row.state,'action_required');assert.equal(f.row.deposit_intent_id,null);assert.ok(f.calls.includes('cancel'));
}));
test('card failure requires guest action, not automatic capture',()=>atNow(async()=>{
 const f=fixture();f.deps.stripe.paymentIntents.create=async()=>{throw {type:'StripeCardError',payment_intent:{id:'pi_failed'}};};await f.process(f.row);assert.equal(f.row.state,'action_required');assert.equal(f.row.deposit_intent_id,'pi_failed');assert.equal(f.calls.length,0);
}));
test('lost creation response reuses existing hold',()=>atNow(async()=>{
 const f=fixture({state:'authorizing'});f.hold.metadata={cleaning_payment_id:'p1'};f.deps.stripe.paymentIntents.list=()=>({async *[Symbol.asyncIterator](){yield f.hold;}});await f.process(f.row);assert.equal(f.row.state,'held');assert.equal(f.calls.length,0);
}));
test('refunded lease releases cleaning hold',()=>atNow(async()=>{
 const f=fixture({state:'held',deposit_intent_id:'hold'});f.deps.stripe.paymentIntents.retrieve=async()=>({latest_charge:{refunded:true}});await f.process(f.row);assert.equal(f.row.payment_state,'refunded');assert.equal(f.row.state,'released');
}));
test('unpaid checkout cannot authorize a cleaning hold',()=>atNow(async()=>{
 const f=fixture({payment_state:'unpaid',checkout_session_id:'cs'});f.deps.stripe.checkout.sessions.retrieve=async()=>({status:'open',payment_status:'unpaid'});await f.process(f.row);assert.equal(f.row.payment_state,'unpaid');assert.equal(f.calls.length,0);
}));
test('zero cleaning deposit never creates a second payment',()=>atNow(async()=>{
 const f=fixture({deposit_cents:0,state:'not_required'});await f.process(f.row);assert.equal(f.calls.length,0);
}));
