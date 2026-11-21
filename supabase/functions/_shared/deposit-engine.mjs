import {validHold} from './payment-policy.mjs';

export function createProcessor({stripe,sb,check,save,release,reconcileHold}) {
return async function processPayment(row) {
 const now=Date.now();
 if(row.payment_state==='unpaid') {
  if(!row.checkout_session_id) {await save(row.id,{next_attempt_at:new Date(now+5*60000).toISOString()});return;}
  const session=await stripe.checkout.sessions.retrieve(row.checkout_session_id,{expand:['payment_intent']});
  if(session.payment_status!=='paid') {
   await save(row.id,{next_attempt_at:session.status==='expired'?null:new Date(now+5*60000).toISOString()});return;
  }
  const pi=session.payment_intent;
  if(!pi || typeof pi!=='object' || pi.status!=='succeeded' || pi.amount_received!==row.total_cents || pi.transfer_data?.destination!==row.destination) throw new Error('Lease payment verification failed');
  const fields={payment_state:'paid',lease_intent_id:pi.id,payment_method_id:typeof pi.payment_method==='string'?pi.payment_method:pi.payment_method?.id,
    next_attempt_at:row.deposit_cents?row.hold_at:null};
  await save(row.id,fields);Object.assign(row,fields);
  check(await sb.from('bookings').update({status:'confirmed',stripe_payment_intent:pi.id,guest_email:row.guest_email,guest_name:session.customer_details?.name||'Guest',total:row.total_cents/100}).eq('id',row.booking_id));
 }
 if(row.payment_state!=='paid' || !row.deposit_cents) return;
 // Never capture cleaning on a refunded lease. Read Stripe, not public booking fields.
 const lease=await stripe.paymentIntents.retrieve(row.lease_intent_id,{expand:['latest_charge']});
 const charge=lease.latest_charge;
 if(charge?.refunded) {await release(row);await save(row.id,{payment_state:'refunded'});return;}
 // Recover a guest-authenticated replacement hold before checking deadlines.
 if(row.recovery_session_id) {
  const session=await stripe.checkout.sessions.retrieve(row.recovery_session_id);
  if(session.status==='complete' && session.payment_intent) {
   row.deposit_intent_id=String(session.payment_intent);
   await save(row.id,{deposit_intent_id:row.deposit_intent_id});
  }
 }
 const pi=await reconcileHold(row);
 if(pi?.status==='succeeded' || pi?.status==='canceled') return;
 if(now>=Date.parse(row.claim_deadline) || row.state==='releasing') {await release(row);return;}
 if(pi?.status==='requires_capture') {
  const full=await stripe.paymentIntents.retrieve(pi.id,{expand:['latest_charge']});
  const expiry=full.latest_charge?.payment_method_details?.card?.capture_before;
  if(!validHold(full,row.claim_deadline)) {
   await stripe.paymentIntents.cancel(pi.id,{}, {idempotencyKey:'short-hold-'+pi.id});
   await save(row.id,{state:'action_required',deposit_intent_id:null,recovery_session_id:null,last_error:'The card hold could not cover the claim window. Contact LeaseWild; no cleaning funds are secured.',next_attempt_at:row.claim_deadline});return;
  }
  await save(row.id,{state:row.state==='capturing'?'capturing':'held',capture_before:new Date(expiry*1000).toISOString(),last_error:null,next_attempt_at:row.claim_deadline});
  if(row.state==='capturing' && row.claim_cents && Date.parse(row.claim_at)<Date.parse(row.claim_deadline)) {
   const result=await stripe.paymentIntents.capture(pi.id,{amount_to_capture:row.claim_cents,application_fee_amount:0},{idempotencyKey:'cleaning-capture-'+row.id});
   await save(row.id,{state:'captured',captured_cents:result.amount_received,next_attempt_at:null});
  }
  return;
 }
 if(row.state==='action_required') {await save(row.id,{next_attempt_at:row.claim_deadline});return;}
 if(now<Date.parse(row.hold_at)) {await save(row.id,{next_attempt_at:row.hold_at});return;}
 await save(row.id,{state:'authorizing'});
 // Reconcile a lost create response before retrying, including after Stripe's key retention.
 let hold=pi;
 if(!hold) {
  for await(const existing of stripe.paymentIntents.list({customer:row.customer_id,limit:100})) {
   if(existing.metadata?.cleaning_payment_id===row.id && existing.status!=='canceled') {hold=existing;break;}
  }
 }
 if(!hold) {
  try {
   hold=await stripe.paymentIntents.create({amount:row.deposit_cents,currency:'usd',customer:row.customer_id,payment_method:row.payment_method_id,
    payment_method_types:['card'],confirm:true,off_session:true,capture_method:'manual',application_fee_amount:0,
    transfer_data:{destination:row.destination},metadata:{cleaning_payment_id:row.id},expand:['latest_charge'],description:'LeaseWild refundable cleaning hold'},
    {idempotencyKey:'cleaning-hold-'+row.id});
  }catch(e) {
   if(e.type==='StripeCardError') {
    await save(row.id,{state:'action_required',deposit_intent_id:e.payment_intent?.id||null,last_error:'Your card needs attention. Open the guest portal to authorize the cleaning hold.',next_attempt_at:row.claim_deadline});return;
   }
   throw e;
  }
 }
 hold=await stripe.paymentIntents.retrieve(hold.id,{expand:['latest_charge']});
 await save(row.id,{deposit_intent_id:hold.id});
 if(validHold(hold,row.claim_deadline)) {
  await save(row.id,{state:'held',capture_before:new Date(hold.latest_charge.payment_method_details.card.capture_before*1000).toISOString(),last_error:null,next_attempt_at:row.claim_deadline});
 }else if(hold.status==='requires_capture') {
  await stripe.paymentIntents.cancel(hold.id,{}, {idempotencyKey:'short-hold-'+hold.id});
  await save(row.id,{state:'action_required',deposit_intent_id:null,last_error:'Hold expires too soon. Contact LeaseWild; no cleaning funds are secured.',next_attempt_at:row.claim_deadline});
 }else {
  await save(row.id,{state:'action_required',last_error:'Authorize the cleaning hold in your guest portal.',next_attempt_at:row.claim_deadline});
 }
}

}

