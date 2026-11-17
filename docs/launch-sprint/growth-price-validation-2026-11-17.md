# Growth Research — outfitter detail price presentation — 2026-11-17

Scope: sandbox staging only. Do not touch GitHub main, live leasewild.com, production Supabase or live Stripe.

- FAIL (source inspection before fix): `outfitter-experience.html` rendered `$NaN` for a nonnumeric non-null price, and displayed negative amounts without rejecting them. Such values would confuse visitors; no claim of real malformed inventory is made.
- PASS (staging source correction): commit `4c10cfbcbf40dc4dab163bed0e0f73eaa1d194ad` checks that the converted price is finite and nonnegative before displaying it, formats valid USD amounts to two decimal places, and otherwise displays "Price on request". No payment, checkout, Supabase or Stripe logic changed.
- NOT TESTED: independent Cloudflare deployment, rendered browser behavior, actual sandbox inventory, ten responsive widths, touch/keyboard/zoom, authenticated conversion, Stripe TEST reconciliation.
- Coordination: Growth owns discovery and price presentation. Hunter/Developer own payment end-to-end, Landowner owns zone/booking checks, Legal owns tax/policy review. Do not duplicate their Stripe evidence.
- NO-GO: Tax registration/treatment, delivered receipts, partial refunds, payout reconciliation and authenticated end-to-end evidence remain launch gates. Source fix alone is not release verification.

## 2026-11-17 urgent regression repair

- **FAIL (confirmed in staging source):** The earlier price formatting change left a broken JavaScript ternary (`...>=0?'el('price-label')...`) and appended ~3 KB of duplicated script/document content after `</html>`. This would prevent the outfitter detail loader from parsing and could break booking discovery and conversion. This is a source-confirmed regression, not a browser reproduction.
- **FIXED (staging commit `d0f2f08be8942d0eb4c30b5f3371fd19c408cc30`):** Restored the complete USD-price ternary and removed the duplicated document tail. Re-fetched staging source to verify one closing `</html>` and the expected expression. Payment and database logic unchanged.
- **NOT TESTED:** Deployed Cloudflare browser behavior, actual inventory, authenticated booking, responsive matrix and Stripe TEST reconciliation. The corrected file requires independent browser smoke tests before calling this issue fully resolved.
- **Coordination:** Other QA bots should prioritize outfitter detail load and request flow smoke testing; avoid concurrent edits to `outfitter-experience.html` without refreshing the latest blob SHA. Launch remains NO-GO.

## 2026-11-17 Growth keyboard focus visibility

- **FAIL (source review):** `outfitter-experience.html` defined custom button and input styles but no explicit high-visibility `:focus-visible` treatment for keyboard navigation. Browser defaults and global theme styles were not independently verified; this is a source-level accessibility risk, not a measured WCAG failure.
- **PASS (staging source change):** commit `41ef98b57ea8aeff9188f6dfb6e5c5adc14185bd` adds a 3px contrasting focus outline with offset for links, buttons, inputs and textareas on the outfitter experience page. No booking/payment/database logic modified.
- **NOT TESTED:** deployed Cloudflare build, keyboard focus appearance at 320/375/390/430/768/1024/1280/1440/1920/2560 widths, zoom, actual inventory, signed-in conversion and Stripe TEST reconciliation. Request a browser retest from Hunter QA; do not claim release readiness from source review.
- **Payment gate read:** `stripe-launch-gate-2026-11-11.md` documents 2026-11-14 Stripe TEST 7 passed / 3 skipped; delivered receipt, external-bank payout and partial refund remain unproven. Stripe Tax and other launch gates remain NO-GO. Do not duplicate payment tests or claim new payment evidence.
