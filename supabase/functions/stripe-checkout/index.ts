import {stripe,sb,json,cors,check,user,locked,save} from '../_shared/payments.ts';
import {quote,windowFor,POLICY_VERSION,cents,checkoutTime} from '../_shared/payment-policy.mjs';

Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
 if(req.method!=='POST') return json({error:'Method not allowed'},405);
 try {
  const guest=await user(req);
  const body=await req.json();
  if(body.deposit_policy!==POLICY_VERSION || body.deposit_consent!==true) return json({error:'Please review and accept the payment and cleaning-deposit terms.'},400);
  const booking=check(await sb.from('bookings').select('*').eq('id',body.booking_id).single());
  if(!booking || booking.guest_email?.toLowerCase()!==guest.email?.toLowerCase()) throw new Error('Booking does not belong to your account.');
  const prior=check(await sb.from('lease_payments').select('*').eq('booking_id',booking.id).maybeSingle());
  let row=prior;
  if(prior && prior.guest_id!==guest.id) throw new Error('Booking does not belong to your account.');
  if(!row) {
   const enabled=check(await sb.from('site_settings').select('value').eq('key','checkout_enabled').single());
   if(enabled.value!=='true') throw new Error('Online booking is currently unavailable.');
   const listing=check(await sb.from('listings').select('*').eq('id',booking.listing_id).eq('status','active').single());
   const owner=check(await sb.from('landowner_profiles').select('user_id,email,stripe_account_id').eq('email',listing.email).single());
   if(!owner?.user_id || !owner.stripe_account_id) throw new Error('Landowner must connect Stripe before accepting bookings.');
   const ownerAuth=check(await sb.auth.admin.getUserById(owner.user_id)).user;
   if(!ownerAuth?.email_confirmed_at || ownerAuth.email?.toLowerCase()!==listing.email?.toLowerCase()) throw new Error('Landowner account requires verification.');
   const account=await stripe.accounts.retrieve(owner.stripe_account_id);
   if(account.capabilities?.transfers!=='active') throw new Error('Landowner payout account is not ready.');
   const nights=(Date.parse(booking.check_out)-Date.parse(booking.check_in))/86400000;
   const window=windowFor(booking.check_out,listing.checkout_time,listing.time_zone);
   const checkinAt=checkoutTime(booking.check_in,listing.checkin_time,listing.time_zone);
   if(nights<(parseInt(listing.min_stay)||1) || Date.parse(checkinAt)<=Date.now() || Date.parse(window.checkout_at)<=Date.parse(checkinAt)) throw new Error('Invalid booking dates.');
   if(!Number.isInteger(booking.guests) || booking.guests<1 || (listing.max_guests && booking.guests>listing.max_guests)) throw new Error('Invalid guest count.');
   const gross=cents(listing.price_per_day)*nights;
   let discount=0;
   if(booking.discount_code) {
    const code=check(await sb.from('promo_codes').select('*').eq('code',booking.discount_code).eq('active',true).maybeSingle());
    if(code) {
     if((code.expires_at && code.expires_at<new Date().toISOString().slice(0,10)) || (code.max_uses!==null && code.uses>=code.max_uses) || (code.listing_ids?.length && !code.listing_ids.includes(listing.id)) || (code.owner_role==='landowner' && code.owner_email!==listing.email)) throw new Error('Promo code is not valid for this booking.');
     discount=code.discount_type==='fixed'?Math.min(gross,cents(code.discount_amount)):Math.round(gross*Number(code.discount_pct)/100);
    } else {
     const affiliate=check(await sb.from('affiliate_codes').select('*').eq('code',booking.discount_code).eq('active',true).single());
     discount=Math.round(gross*Number(affiliate.guest_discount_pct||0)/100);
    }
   }
   const q=quote({rate:listing.price_per_day,nights,deposit:listing.cleaning_fee||0,discount:discount/100,protection:Number(booking.trip_protection)===18});
   if(body.amount_cents!==q.total) return json({error:'Price changed. Refresh the listing before paying.'},409);
   row=check(await sb.from('lease_payments').insert({booking_id:booking.id,listing_id:listing.id,guest_id:guest.id,owner_id:owner.user_id,guest_email:guest.email,destination:owner.stripe_account_id,lease_cents:q.lease,tax_cents:q.tax,tax_rate_bps:650,owner_cents:q.owner,platform_cents:q.platform,total_cents:q.total,deposit_cents:q.deposit,...window,checkin_at:checkinAt,time_zone:listing.time_zone,hunting_methods:listing.hunting_methods,policy_version:POLICY_VERSION,consent_at:new Date().toISOString(),state:q.deposit?'scheduled':'not_required'}).select().single());
  }
  return await locked(row.id,async(p)=>{
   if(p.payment_state!=='unpaid') throw new Error('This booking has already been paid or closed.');
   if(p.checkout_session_id) {
    const existing=await stripe.checkout.sessions.retrieve(p.checkout_session_id);
    if(existing.status==='open') return json({url:existing.url});
    throw new Error('This checkout has closed. Start a new booking.');
   }
   const customer=p.customer_id?{id:p.customer_id}:await stripe.customers.create({email:guest.email,metadata:{lease_payment_id:p.id}}, {idempotencyKey:'customer-'+p.id});
   await save(p.id,{customer_id:customer.id});
   const session=await stripe.checkout.sessions.create({
    mode:'payment',customer:customer.id,payment_method_types:['card'],
    line_items:[{price_data:{currency:'usd',unit_amount:p.total_cents-p.tax_cents,product_data:{name:'LeaseWild lease',description:'Lease and selected fees. Refundable cleaning hold is separate.'}},quantity:1},...(p.tax_cents?[{price_data:{currency:'usd',unit_amount:p.tax_cents,product_data:{name:'Sales tax (6.5%)',description:'Fixed tax on the discounted lease price.'}},quantity:1}]:[])],
    payment_intent_data:{application_fee_amount:p.platform_cents,transfer_data:{destination:p.destination},...(p.deposit_cents?{setup_future_usage:'off_session' as const}:{}),metadata:{lease_payment_id:p.id,policy_version:POLICY_VERSION}},
    metadata:{lease_payment_id:p.id,booking_id:p.booking_id},
    custom_text:{submit:{message:p.deposit_cents?`You authorize saving this card and a separate $${(p.deposit_cents/100).toFixed(2)} cleaning hold 24 hours before the scheduled checkout. Only cleaning claimed within 48 hours after checkout is charged; unused funds are released. Monitor your guest portal if authorization needs attention.`:'Lease fee: 80% to the landowner, 20% to LeaseWild.'}},
    success_url:'https://leasewild.com/guest-portal.html?payment=success&session_id={CHECKOUT_SESSION_ID}',cancel_url:'https://leasewild.com/guest-portal.html?payment=cancelled'
   },{idempotencyKey:'lease-checkout-'+p.id});
   await save(p.id,{checkout_session_id:session.id});
   check(await sb.from('bookings').update({stripe_session_id:session.id,total:p.total_cents/100,cleaning_fee:p.deposit_cents/100}).eq('id',p.booking_id));
   return json({url:session.url,session_id:session.id});
  });
 }catch(e){console.error('checkout',e);return json({error:e instanceof Error?e.message:'Checkout failed'},400);}
});
