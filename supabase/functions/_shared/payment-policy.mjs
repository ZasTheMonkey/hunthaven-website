// Pure payment rules, shared by Edge Functions and Node tests. All money is cents.
export const POLICY_VERSION = 'lease-80-20-cleaning-hold-48h-v1';
export function cents(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error('Invalid price');
  const result = Math.round((n + Number.EPSILON) * 100);
  if (!Number.isSafeInteger(result)) throw new Error('Price exceeds supported range');
  return result;
}
export function quote({rate, nights, deposit = 0, discount = 0, protection = false}) {
  if (!Number.isSafeInteger(nights) || nights < 1 || nights > 365) throw new Error('Invalid stay');
  const gross = cents(rate) * nights;
  const discountCents = cents(discount);
  if (discountCents > gross) throw new Error('Discount exceeds lease price');
  const lease = gross - discountCents;
  if (lease < 50) throw new Error('Lease must be at least $0.50');
  const tax = Math.round(lease * 650 / 10000); // User-selected fixed 6.5%, discounted lease only.
  const commission = Math.round(lease * 0.20);
  const protectionCents = protection ? 1800 : 0;
  // Preserve the existing disclosed guest processing surcharge, on paid items only.
  const processing = Math.round((lease + protectionCents) * 0.029) + 30;
  return {lease, tax, commission, owner: lease - commission, deposit: cents(deposit),
    protection: protectionCents, processing, total: lease + protectionCents + processing + tax,
    platform: commission + protectionCents + processing + tax};
}
export const TIME_ZONES = ['America/New_York','America/Chicago','America/Denver','America/Phoenix','America/Los_Angeles','America/Anchorage','Pacific/Honolulu'];
export function checkoutTime(date, time='00:00', zone='America/New_York') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(:00)?$/.test(time) || !TIME_ZONES.includes(zone)) throw new Error('Invalid access time');
  const [year,month,day]=date.split('-').map(Number);
  const [hour,minute]=time.split(':').map(Number);
  const target=Date.UTC(year,month-1,day,hour,minute);
  if(hour>23 || minute>59 || new Date(target).toISOString().slice(0,10)!==date) throw new Error('Invalid access time');
  const fmt=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  let utc=target;
  for(let i=0;i<4;i++){
    const parts=Object.fromEntries(fmt.formatToParts(new Date(utc)).map(p=>[p.type,p.value]));
    const local=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute);
    if(local===target) return new Date(utc).toISOString();
    utc+=target-local;
  }
  throw new Error('This local time does not exist because of daylight saving time. Choose another time.');
}
export function windowFor(date, time='00:00', zone='America/New_York') {
  const end = +new Date(checkoutTime(date,time,zone));
  return {checkout_at:new Date(end).toISOString(), hold_at:new Date(end-86400000).toISOString(),
    claim_deadline:new Date(end+48*3600000).toISOString()};
}
export function validateClaim(row, amount, reason, now = Date.now()) {
  if (now < Date.parse(row.checkout_at) || now >= Date.parse(row.claim_deadline)) throw new Error('Cleaning claims are allowed only during the 48 hours after checkout.');
  if (row.state !== 'held') throw new Error('A valid cleaning hold is required.');
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > row.deposit_cents) throw new Error('Claim must be greater than zero and no larger than the deposit.');
  if (typeof reason !== 'string' || reason.trim().length < 10 || reason.length > 2000) throw new Error('Describe the cleaning needed (10–2000 characters).');
  if (!row.capture_before || now >= Date.parse(row.capture_before)) throw new Error('The card hold has expired.');
}
export function validHold(intent, deadline) {
  const charge = intent.latest_charge;
  const expiry = typeof charge === 'object' && charge?.payment_method_details?.card?.capture_before;
  return intent.status === 'requires_capture' && Number.isFinite(expiry) && expiry * 1000 > Date.parse(deadline) + 5*60000;
}
