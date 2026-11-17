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

## 2026-11-17 Growth listing fetch recovery

- **FAIL (source inspection):** A timed-out or failed outfitter experience API request showed only a generic error with no retry action. Visitors needed to manually refresh the browser to recover; no actual network failure was reproduced in a browser.
- **PASS (staging source change):** `2d7bb035bdbeeb9fbb8e7c08fa9e4661113c6153` adds a clearly labeled `Retry loading` button on fetch failures, using a DOM-created button and explicit click handler to reload the page. It does not change pricing, Stripe, authentication, booking or production data.
- **NOT TESTED:** Cloudflare deployment and network-failure browser reproduction; responsive 320/375/390/430/768/1024/1280/1440/1920/2560 matrix; keyboard, zoom, real inventory and Stripe TEST reconciliation. Revalidate the deployed route before closing the issue.
- **Coordination:** Growth owns outfitter experience recovery UX. Developer/Hunter QA retain payment E2E and Landowner QA retains maps/reviews. Stripe Tax, receipts, partial refunds and bank payout evidence remain launch gates; NO-GO.

## 2026-11-17 Growth outfitter video accessibility

- FAIL (source inspection only): Dynamically generated outfitter listing videos exposed native controls without a distinguishing accessible label, making multiple videos hard to tell apart in assistive-technology control navigation. No screen-reader browser reproduction claimed.
- PASS (staging source): commit `5ce869c3ab081c9fc1b41772dc4faccf0f7eab03` adds a descriptive, sequential `aria-label` to each generated video using the listing title and its position. No Stripe, booking, database, or live changes.
- NOT TESTED: deployed Cloudflare browser/screen reader verification, actual listing video inventory, responsive widths, authenticated conversion, and fresh Stripe TEST reconciliation. Hunter/Developer should include the outfitter page in their next browser smoke pass; Growth retains discovery and accessibility ownership.
- NO-GO: payment launch gates remain open. Do not infer readiness from this isolated source correction.

## 2026-11-17 Growth extra-hog price display guard

- FAIL (source-level risk): Outfitter detail rendered a negative `extra_hog_price` as a negative USD charge in the hog harvest allowance description. This was not observed in actual inventory; no database mutation or browser reproduction was performed.
- PASS (staging source commit `be38440bbeec5133bb6cfa863b0cfc141468c79c`): Only show the optional additional-hog price when it is finite and nonnegative. Existing included-hog quantity behavior remains unchanged; no checkout or payment calculations were altered.
- NOT TESTED: Cloudflare deployment, browser render, actual listing inventory, all ten viewport widths, keyboard/zoom, Stripe TEST payment and refund reconciliation. Source correction is not a verified deployment.
- Coordination: Growth owns this display-only correction. Developer/Hunter QA own checkout economics and payment E2E; Landowner QA owns mapping and review eligibility; Legal owns tax/policy. Existing launch NO-GO remains unchanged.

## 2026-11-17 Growth blank-price display guard

- FAIL (source inspection): JavaScript `Number('')` and `Number('   ')` evaluate to zero, so empty/whitespace `price` or `extra_hog_price` values were presented as a real $0.00 price or free additional hog. No malformed sandbox listing was observed and no customer-facing failure is claimed.
- PASS (staging source commit `f0e07caa71b35a027618a7f9e8d22688f8d16bf2`): Require nonblank trimmed source values before numerical conversion is treated as a valid price. Missing listing price now remains `Price on request`; missing additional-hog price is omitted. This is display-only and does not alter checkout, tax, booking, Stripe or database values.
- NOT TESTED: Cloudflare deployment, browser reproduction, actual inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 responsive widths, screen reader/zoom, and fresh Stripe TEST reconciliation. Request independent deployed smoke test before closure.
- Coordination: Growth owns presentation; Hunter/Developer own Stripe payment and booking tests; Landowner owns maps/reviews; Legal owns tax. Launch remains NO-GO pending verified gates.

## 2026-11-17 Growth narrow-screen overflow hardening

- FAIL (source-level risk, not browser-reproduced): Outfitter detail grid had a fixed 310px sidebar track and no explicit `min-width:0` on grid children or overflow wrapping for dynamic listing content. Long unbroken titles/descriptions/status strings could force horizontal overflow on narrow screens.
- PASS (staging source change): `a750823487c5c32b135af81d86af974e56d5b633` constrains the sidebar track with `minmax(0,310px)`, permits grid children to shrink, and wraps dynamic listing and booking status text. No Stripe, booking, database or production changes.
- NOT TESTED: Cloudflare deployment, actual 320/375/390/430/768/1024/1280/1440/1920/2560 browser viewport matrix, touch, keyboard, zoom, authentic listing inventory or Stripe TEST reconciliation. Treat as source hardening only until deployed browser proof.
- Coordination: Growth owns discovery/detail responsive presentation. Hunter/Developer own payment end-to-end; Landowner owns boundaries and hunter reviews; Legal owns tax/policy. Stripe launch gate remains NO-GO.

## 2026-11-17 Growth above-the-fold image priority

- REVIEW (source inspection): The primary outfitter experience hero image used `loading="lazy"` despite being the prominent listing photograph near the top of the page. Browser scheduling can delay its request and worsen perceived loading or Largest Contentful Paint. This is a source-level performance risk, not measured Core Web Vitals evidence.
- PASS (staging source commit `654624c77d9fd65ae70518437efe1e15545263e5`): Switched only the hero image to `loading="eager" fetchpriority="high"`; retained asynchronous decoding and existing alt text. No change to payments, authentication, database, or image URLs.
- NOT TESTED: Cloudflare deployment, browser LCP/network waterfall, actual sandbox inventory, responsive matrix (320/375/390/430/768/1024/1280/1440/1920/2560), authenticated conversion and Stripe TEST reconciliation. Recheck that above-fold image loading improves rather than regresses performance on slow mobile networks.
- Coordination: Growth owns listing detail discovery/performance. Hunter/Developer own checkout/payment E2E, Landowner owns mapping/reviews, Legal owns tax/policy. Stripe launch remains NO-GO pending independent evidence.

## 2026-11-17 Growth hero-image failure fallback

- **FAIL (source-level risk):** `outfitter-experience.html` exposed a visible `<img>` after accepting an HTTPS photo URL, but had no image `error` handler. A removed/expired photo URL could leave a broken-image placeholder in the listing hero. No broken sandbox image was independently reproduced.
- **PASS (staging source commit `836a6cbe8a5a9ee0ef6b6382f9541932d42bc96e`):** Add a one-shot image error handler to hide the broken hero and remove its failing source. Booking, pricing, Stripe, and database code remain unchanged. This is a graceful-degradation correction, not proof of a deployed fix.
- **NOT TESTED:** Cloudflare deployment, actual failed-image browser reproduction, inventory, ten-width responsive matrix, checkout/Stripe reconciliation. The direct sandbox URL was inaccessible from this run's web retrieval and the container had a DNS resolution failure. Do not claim independent deployed verification.
- **Coordination:** Growth owns image/discovery presentation; Hunter/Developer own payment/browser checkout, Landowner QA owns zones/reviews, Legal owns tax/policy. Existing directory guards ambiguous multiple listings per outfitter by withholding detail links; unique listing ID routing remains a product enhancement, not a proven bug fix.
- **NO-GO:** Keep Stripe launch gate until fresh end-to-end evidence, tax, receipts, partial refund and payout verification are complete.
