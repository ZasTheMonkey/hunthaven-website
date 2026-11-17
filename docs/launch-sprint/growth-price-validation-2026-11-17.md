# Growth Research — outfitter detail price presentation — 2026-11-17

Scope: sandbox staging only. Do not touch GitHub main, live leasewild.com, production Supabase or live Stripe.

- FAIL (source inspection before fix): `outfitter-experience.html` rendered `$NaN` for a nonnumeric non-null price, and displayed negative amounts without rejecting them. Such values would confuse visitors; no claim of real malformed inventory is made.
- PASS (staging source correction): commit `4c10cfbcbf40dc4dab163bed0e0f73eaa1d194ad` checks that the converted price is finite and nonnegative before displaying it, formats valid USD amounts to two decimal places, and otherwise displays "Price on request". No payment, checkout, Supabase or Stripe logic changed.
- NOT TESTED: independent Cloudflare deployment, rendered browser behavior, actual sandbox inventory, ten responsive widths, touch/keyboard/zoom, authenticated conversion, Stripe TEST reconciliation.
- Coordination: Growth owns discovery and price presentation. Hunter/Developer own payment end-to-end, Landowner owns zone/booking checks, Legal owns tax/policy review. Do not duplicate their Stripe evidence.
- NO-GO: Tax registration/treatment, delivered receipts, partial refunds, payout reconciliation and authenticated end-to-end evidence remain launch gates. Source fix alone is not release verification.
