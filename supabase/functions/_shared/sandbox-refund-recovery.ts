// TEST-only caller guards live in each entrypoint. No customer bank debit or
// arbitrary amount is accepted: recover only this booking's net host share.
const tableFor=(kind='landowner')=>kind==='outfitter'?'sandbox_outfitter_refund_recoveries':'sandbox_booking_refund_recoveries';
const now=()=>new Date().toISOString();
const safeCode=(e:any)=>String(e?.code||e?.name||'recovery_failed').slice(0,120);
async function row(db:any,id:string,kind='landowner'){const r=await db.from(tableFor(kind)).select('*').eq('booking_id',id).maybeSingle();if(r.error)throw r.error;return r.data;}
async function save(db:any,id:string,values:any,kind='landowner'){const r=await db.from(tableFor(kind)).update({...values,updated_at:now()}).eq('booking_id',id).select('*').single();if(r.error)throw r.error;return r.data;}
function assertRefund(refund:any,r:any){if(refund.payment_intent!==r.payment_intent||refund.amount!==r.refund_amount_cents)throw Error('Tracked refund mismatch');}
async function available(key:string,account:string){
 const response=await fetch('https://api.stripe.com/v1/balance',{headers:{Authorization:'Bearer '+key,'Stripe-Account':account}});
 if(!response.ok)throw Error('Host TEST balance unavailable');
 const b=await response.json();return Math.max(0,b.available?.find((x:any)=>x.currency==='usd')?.amount||0);
}
export async function recoverHostShare(db:any,stripe:any,key:string,bookingId:string,kind='landowner'){
 if(!key.startsWith('sk_test_'))throw Error('TEST recovery only');
 let r=await row(db,bookingId,kind);if(!r)return null;
 if(!r.refund_id)return r;
 const refund=await stripe.refunds.retrieve(r.refund_id);assertRefund(refund,r);
 if(refund.status!=='succeeded')return await save(db,bookingId,{status:'refund_pending',refund_status:refund.status||'unknown',claim_started_at:null,last_error:refund.status},kind);
 if(r.target_cents===0)return await save(db,bookingId,{status:'recovered',refund_status:'succeeded',claim_started_at:null,last_error:null},kind);
 if(r.status==='refund_pending')r=await save(db,bookingId,{status:'pending',refund_status:'succeeded',last_error:null},kind);
 const claim=await db.rpc(kind==='outfitter'?'sandbox_claim_outfitter_refund_recovery':'sandbox_claim_refund_recovery',{p_booking_id:bookingId});if(claim.error)throw claim.error;
 if(!claim.data)return await row(db,bookingId,kind);
 r=claim.data;
 try{
  let t=await stripe.transfers.retrieve(r.transfer_id);
  if(t.livemode||t.destination!==r.connected_account||t.currency!=='usd')throw Error('Tracked TEST transfer mismatch');
  let recovered=Math.min(r.target_cents,Math.max(0,t.amount_reversed-r.baseline_reversed_cents));
  const remaining=r.target_cents-recovered;
  if(remaining){
   const amount=Math.min(remaining,await available(key,r.connected_account));
   if(amount>0)await stripe.transfers.createReversal(r.transfer_id,{amount,metadata:{booking_id:bookingId,refund_recovery:'true'}},{idempotencyKey:'leasewild-host-recovery-'+bookingId+'-'+recovered+'-'+amount});
   t=await stripe.transfers.retrieve(r.transfer_id);
   recovered=Math.min(r.target_cents,Math.max(0,t.amount_reversed-r.baseline_reversed_cents));
  }
  return await save(db,bookingId,{recovered_cents:recovered,refund_status:'succeeded',status:recovered===r.target_cents?'recovered':'pending',claim_started_at:null,last_error:null},kind);
 }catch(e){
  // A timed-out Stripe reversal may have succeeded. Re-read before retrying;
  // the durable baseline and Stripe idempotency key prevent over-recovery.
  let recovered=r.recovered_cents;
  try{const t=await stripe.transfers.retrieve(r.transfer_id);recovered=Math.min(r.target_cents,Math.max(0,t.amount_reversed-r.baseline_reversed_cents));}catch{}
  return await save(db,bookingId,{recovered_cents:recovered,refund_status:'succeeded',status:recovered===r.target_cents?'recovered':'pending',claim_started_at:null,last_error:safeCode(e)},kind);
 }
}
async function finishTracked(db:any,stripe:any,key:string,r:any){
 const kind=r.booking_type||'landowner';
 let refund;
 if(r.refund_id)refund=await stripe.refunds.retrieve(r.refund_id);
 else{
  const previous=await stripe.refunds.list({payment_intent:r.payment_intent,limit:100});
  refund=previous.data.find((x:any)=>x.metadata?.booking_id===r.booking_id&&x.metadata?.leasewild_host_recovery==='tracked');
  if(!refund)refund=await stripe.refunds.create({payment_intent:r.payment_intent,amount:r.refund_amount_cents,reason:'requested_by_customer',metadata:{booking_id:r.booking_id,leasewild_host_recovery:'tracked'}},{idempotencyKey:'leasewild-sandbox-'+(kind==='outfitter'?'outfitter-':'')+'platform-refund-'+r.booking_id});
 }
 assertRefund(refund,r);
 try{
  r=await save(db,r.booking_id,{refund_id:refund.id,refund_status:refund.status||'unknown',status:refund.status==='succeeded'?(r.status==='recovering'?'recovering':r.recovered_cents===r.target_cents?'recovered':'pending'):'refund_pending',last_error:null},kind);
  const recovery=await recoverHostShare(db,stripe,key,r.booking_id,kind);
  return {refund,recovery};
 }catch(e){const failure:any=Error('Stripe refund applied; ledger reconciliation required');failure.refundApplied=true;throw failure;}
}
export async function refundWithHostRecovery(db:any,stripe:any,key:string,b:any,pi:any,ownerId:string,kind='landowner'){
 if(!key.startsWith('sk_test_')||pi.livemode)throw Error('TEST refund only');
 const existing=await row(db,b.id,kind);
 if(existing){if(existing.payment_intent!==pi.id||existing.owner_id!==ownerId)throw Error('Refund ledger booking mismatch');return await finishTracked(db,stripe,key,existing);}
 try{
  const refund=await stripe.refunds.create({payment_intent:pi.id,reason:'requested_by_customer',...(pi.transfer_data?.destination?{reverse_transfer:true,refund_application_fee:true}:{})},{idempotencyKey:'leasewild-sandbox-'+(kind==='outfitter'?'outfitter-':'')+'refund-'+b.id});
  if(refund.status!=='succeeded'){
   const insert=await db.from(tableFor(kind)).insert({booking_id:b.id,booking_type:kind,owner_id:ownerId,payment_intent:pi.id,refund_id:refund.id,refund_status:refund.status||'unknown',refund_amount_cents:refund.amount,target_cents:0,mode:'normal_pending',status:'refund_pending'});
   if(insert.error){const failure:any=Error('Stripe refund applied; pending-status reconciliation required');failure.refundApplied=true;throw failure;}
  }
  return {refund,recovery:null};
 }catch(e:any){
  if(e.refundApplied)throw e;
  if(!/recipient of this transfer.*(not have sufficient|insufficient).*funds/i.test(String(e?.message||e)))throw e;
  const charge=typeof pi.latest_charge==='string'?await stripe.charges.retrieve(pi.latest_charge):pi.latest_charge;
  if(!charge||charge.livemode||charge.currency!=='usd'||!charge.transfer||!charge.application_fee)throw Error('Destination refund recovery unavailable');
  const transfer=await stripe.transfers.retrieve(charge.transfer),fee=await stripe.applicationFees.retrieve(charge.application_fee);
  const destination=typeof pi.transfer_data.destination==='string'?pi.transfer_data.destination:pi.transfer_data.destination.id;
  if(transfer.livemode||transfer.destination!==destination||transfer.source_transaction!==charge.id)throw Error('Destination TEST transfer mismatch');
  const amount=charge.amount_captured-charge.amount_refunded,target=Math.max(0,transfer.amount-transfer.amount_reversed-(fee.amount-fee.amount_refunded));
  if(!Number.isSafeInteger(amount)||amount<=0||!Number.isSafeInteger(target))throw Error('Refund recovery amount unavailable');
  const inserted=await db.from(tableFor(kind)).insert({booking_id:b.id,booking_type:kind,owner_id:ownerId,payment_intent:pi.id,refund_amount_cents:amount,transfer_id:transfer.id,connected_account:destination,baseline_reversed_cents:transfer.amount_reversed,target_cents:target,recovered_cents:0,mode:'platform_funded',status:'refund_pending'}).select('*').single();
  if(inserted.error)throw inserted.error;
  return await finishTracked(db,stripe,key,inserted.data);
 }
}
export async function recoverPendingForHost(db:any,stripe:any,key:string,ownerId:string){
 if(!key.startsWith('sk_test_'))throw Error('TEST recovery only');
 for(const kind of ['landowner','outfitter']){
  const pending=await db.from(tableFor(kind)).select('booking_id').eq('owner_id',ownerId).neq('status','recovered').order('created_at').limit(5);
  if(pending.error)throw pending.error;
  for(const r of pending.data||[])await recoverHostShare(db,stripe,key,r.booking_id,kind);
 }
}
