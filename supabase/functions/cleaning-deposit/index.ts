import {stripe,sb,json,cors,user,check,locked,save,release} from '../_shared/payments.ts';
import {processPayment} from '../_shared/deposit-lifecycle.ts';
import {validateClaim} from '../_shared/payment-policy.mjs';
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
 if(req.method!=='POST') return json({error:'Method not allowed'},405);
 try {
  const actor=await user(req), body=await req.json();
  const snapshot=check(await sb.from('lease_payments').select('*').eq('booking_id',body.booking_id).single());
  if(snapshot.guest_id!==actor.id && snapshot.owner_id!==actor.id) return json({error:'Not authorized'},403);
  return await locked(snapshot.id,async(row)=>{
   if(body.action==='cancel') {
    await release(row);await save(row.id,{payment_state:'cancelled'});
    return json({ok:true}); // Cancels deposit only; lease refund follows existing policy.
   }
   await processPayment(row);
   row=check(await sb.from('lease_payments').select('*').eq('id',row.id).single());
   if(body.action==='claim') {
    if(actor.id!==row.owner_id || row.payment_state!=='paid') return json({error:'Not authorized'},403);
    validateClaim(row,body.amount_cents,body.reason);
    await save(row.id,{state:'capturing',claim_cents:body.amount_cents,claim_reason:body.reason.trim(),claim_at:new Date().toISOString(),next_attempt_at:new Date().toISOString()});
    await processPayment({...row,state:'capturing',claim_cents:body.amount_cents,claim_at:new Date().toISOString()});
    return json({ok:true});
   }
   if(body.action==='authorize') {
    if(actor.id!==row.guest_id || row.payment_state!=='paid' || row.state!=='action_required' || Date.now()<Date.parse(row.hold_at) || Date.now()>=Date.parse(row.claim_deadline)) throw new Error('Cleaning authorization is not available.');
    if(row.recovery_session_id) {
     const existing=await stripe.checkout.sessions.retrieve(row.recovery_session_id);
     if(existing.status==='open') return json({url:existing.url});
     throw new Error('Contact LeaseWild to retry this authorization.');
    }
    if(row.deposit_intent_id) {
     const old=await stripe.paymentIntents.retrieve(row.deposit_intent_id);
     if(old.status!=='canceled') await stripe.paymentIntents.cancel(old.id,{}, {idempotencyKey:'replace-hold-'+old.id});
     await save(row.id,{deposit_intent_id:null});
    }
    const session=await stripe.checkout.sessions.create({mode:'payment',customer:row.customer_id,payment_method_types:['card'],
     line_items:[{price_data:{currency:'usd',unit_amount:row.deposit_cents,product_data:{name:'Refundable cleaning authorization',description:'A temporary hold only. Cleaning may be charged within 48 hours after checkout.'}},quantity:1}],
     payment_intent_data:{capture_method:'manual',application_fee_amount:0,transfer_data:{destination:row.destination},metadata:{cleaning_payment_id:row.id}},
     metadata:{cleaning_payment_id:row.id},success_url:'https://leasewild.com/guest-portal.html?deposit=authorized',cancel_url:'https://leasewild.com/guest-portal.html?deposit=cancelled'
    },{idempotencyKey:'cleaning-recovery-'+row.id});
    await save(row.id,{recovery_session_id:session.id,next_attempt_at:new Date().toISOString()});
    return json({url:session.url});
   }
   if(body.action!=='status') throw new Error('Unknown action');
   // No card secrets or payment-method IDs are returned.
   return json({state:row.state,deposit_cents:row.deposit_cents,captured_cents:row.captured_cents,claim_reason:row.claim_reason,checkout_at:row.checkout_at,claim_deadline:row.claim_deadline,last_error:row.last_error});
  });
 }catch(e){console.error('deposit',e);return json({error:e instanceof Error?e.message:'Deposit update failed'},400);}
});
