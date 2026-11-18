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

## 2026-11-17 Growth species rendering resilience

- FAIL (source review): `outfitter-experience.html` directly called `.join(', ')` on `item.species`. A scalar string or other non-array value would throw during page initialization, hide the listing and prevent the booking-request form from appearing. The directory already supports both scalar and array species fields. No malformed live sandbox inventory or browser reproduction is claimed.
- PASS (staging source fix): commit `edd35235c72e6880fd38ce977c6ee4b4a31fe6b8` normalizes scalar/array/missing species to trimmed strings and preserves `Ask outfitter` fallback. Payment, checkout, booking state and database code unchanged.
- NOT TESTED: Cloudflare deployment, actual inventory type distributions, rendered browser and all ten responsive widths, authenticated request flow, Stripe TEST reconciliation. Hunter/Developer should independently smoke-test the deployed outfitter detail route; Growth retains directory/detail presentation ownership.
- NO-GO: Existing Stripe Tax, receipt, partial refund, payout and complete end-to-end gates remain open. Do not treat this source fix as launch proof.

## 2026-11-17 Growth group-size validation

- FAIL (source inspection): outfitter detail applied the raw `max_group_size` directly to the guest-number input. Noninteger, negative, zero, or excessive values could produce inconsistent guest-count validation and confusing conversion UX. No malformed inventory was observed.
- PASS (staging source fix): `2145328319803fc7d4d37a209258a59d63fcd07b` normalizes the guest limit to an integer between 1 and 30, falling back to 30 otherwise. Booking database, payments and Stripe were not modified. This is client-side UX validation, **not** a substitute for server-side booking limits.
- BLOCKED (network): independent `curl -I https://leasewild-sandbox.pages.dev/outfitter-experience.html` failed DNS resolution (`Could not resolve host`) from the execution container. Deployment, actual listing inventory and browser retest cannot be verified in this run.
- NOT TESTED: ten responsive widths, keyboard/zoom, real booking submission, Stripe TEST checkout/refund/payout reconciliation. Developer/Hunter QA own payment flows; Landowner QA owns zones and reviews. No new Stripe passing evidence; launch remains NO-GO.


## 2026-11-17 Growth harvest allowance validation

- FAIL (source inspection): `included_hogs_per_guest` previously accepted fractional, non-finite, or excessive positive numbers for the displayed allowance; malformed data could mislead hunters. No malformed sandbox listing was observed.
- PASS (staging source fix): commit `385e93e3d3aeb9fa2b3815195e57964bc7d88eaf` displays the hog allowance only when the field is nonblank and a positive safe integer no greater than 30. This cap is a defensive presentation guard, not a policy or server-side harvest limit. No checkout, Stripe, booking, or database code changed.
- NOT TESTED: independent deployed browser reproduction, inventory, ten viewport widths, accessibility and Stripe TEST reconciliation. Hunter/Developer retain checkout/payment evidence; Landowner owns boundaries/reviews; Legal owns policy/tax.
- NO-GO: delivered receipt, external bank payout, partial refund, Stripe Tax and other shared launch gates remain open.

## 2026-11-17 Growth request-form mobile autofill and native validation

- REVIEW (source): outfitter detail trip date, guest count, name and email inputs lacked required attributes; name/email lacked autocomplete hints; guest count lacked explicit integer step. The JavaScript click handler already validates these fields, so no claim of a reproduced invalid booking is made.
- PASS (source change): commit `078020f999a17de16e5c8d7029fd9027600a1ab0` adds `required`, `autocomplete=name/email`, and `step=1` to corresponding controls. Existing JavaScript/server booking logic, Stripe and taxes unchanged. Mobile autofill behavior and browser constraint validation still require testing.
- NOT TESTED: deployed Cloudflare behavior, 320/375/390/430/768/1024/1280/1440/1920/2560 responsive matrix, touch/keyboard/zoom, authenticated conversion and fresh Stripe TEST reconciliation.
- Coordination: Growth owns discovery/form presentation; Hunter/Developer own booking and Stripe tests; Landowner owns maps/reviews; Legal owns policy/tax. Stripe launch gate remains NO-GO.

## 2026-11-17 Growth sign-in failure recovery

- FAIL (source inspection): outfitter detail sign-in button allowed overlapping sign-in attempts, and an auth transport rejection could escape the click handler without an actionable message.
- PASS (staging source correction): commit `2c3e4da14551eb5ea6ab4264c9f7f138ee295269` disables sign-in during an attempt, checks required email/password inputs, catches authentication/network failures, and re-enables the control in `finally`. No payment, booking insert, Stripe or database logic changed.
- NOT TESTED: deployed Cloudflare behavior, authenticated browser sign-in, 320/375/390/430/768/1024/1280/1440/1920/2560 responsive matrix, keyboard/zoom, actual inventory, fresh Stripe TEST reconciliation.
- Coordination: Growth owns sign-in entry UX on outfitter detail; Hunter QA/Developer should independently exercise bad credentials, network failure, and successful sign-in. Do not duplicate payment gate evidence. Launch remains NO-GO pending Stripe Tax, receipts, refunds and payout proof.

## 2026-11-17 Growth request submission feedback

- FAIL (source inspection only): Clicking Request availability disabled the button but gave no immediate in-progress feedback while authentication/database calls were pending. On a slow connection visitors could mistake the action for a frozen form. No browser reproduction claimed.
- PASS (staging source change): `ec2bed9efb2cf7f786b1b9889840e94b6caa442a` displays `Submitting request…` on the button and an accessible status message while awaiting the request. On failure the original button text and enabled state are restored, with a fallback error message. Successful requests retain the existing submitted state. No payment, pricing, tax, Stripe, Supabase schema, or production logic changed.
- NOT TESTED: Cloudflare deployment, actual browser latency/error recovery, sandbox inventory, responsive 320/375/390/430/768/1024/1280/1440/1920/2560 matrix, keyboard/zoom, authenticated submission, and Stripe TEST reconciliation.
- Coordination: Growth owns request conversion UI. Hunter/Developer own authenticated booking and payment E2E; Landowner owns boundaries/reviews; Legal owns tax/policy. Stripe Tax, receipts, partial refunds and payout readiness remain NO-GO.


## 2026-11-17 Growth auth-session resilience

- FAIL (source-level risk): outfitter detail `refresh()` destructured the authentication response without handling transport errors or unexpected empty responses. A rejected `getUser()` call could cause an unhandled rejection and leave sign-in UI in an uncertain state. No browser reproduction claimed.
- PASS (staging source commit `24322e2cd997674a264103614fc0df3137e3fbd6`): `refresh()` now handles errors, restores visible sign-in controls, and displays an actionable connection message. No checkout, pricing, Stripe, or booking persistence changes.
- NOT TESTED: deployed Cloudflare browser behavior, authenticated failure injection, actual inventory, ten responsive widths, touch/keyboard/zoom, fresh Stripe TEST session/intent/refund reconciliation.
- Coordination: Growth owns outfitter detail conversion UX. Hunter/Developer own authenticated Stripe browser E2E, Landowner owns boundaries/reviews and booking reconciliation, Legal owns tax/policy. Shared launch gate remains NO-GO until independently verified.


## 2026-11-17 21:35 ET — Outfitter capacity visibility

- FAIL (source inspection): `outfitter-experience.html` included a Group size heading and empty `#group` element, but never populated the element from the listing. This concealed capacity information from shoppers. No browser reproduction claimed.
- PASS (staging source commit `7948740d73d8cd86dd84bbe81bd180e271a511f8`): display `Up to N guests` for a valid integer `max_group_size` from 1 through 30, otherwise `Ask outfitter for group capacity`. Existing booking input validation and payment code remain unchanged.
- NOT TESTED: deployed Cloudflare behavior, actual inventory, browser layout and screen reader, responsive widths 320/375/390/430/768/1024/1280/1440/1920/2560, authenticated booking, fresh Stripe TEST reconciliation.
- Coordination: Growth owns discovery and listing detail presentation; Hunter/Developer own booking and Stripe E2E; Landowner owns maps/reviews; Legal owns tax and policy. Stripe launch gate remains NO-GO. Do not duplicate payment evidence.

## 2026-11-17 Growth ambiguous outfitter listing recovery

- FAIL (staging source review): When an outfitter had multiple active experiences under the same `user_id`, the detail page displayed a support-only dead-end instead of an actionable directory navigation link. This is a source-observed conversion risk, not a confirmed sandbox inventory reproduction.
- PASS (staging source fix): commit `5b524a2cef65e193adf7a61e18c5c98bac061886` adds a DOM-created `Browse outfitter experiences` link to `outfitters.html` in the ambiguous-listing state. It preserves the existing guard against silently booking an arbitrary listing. No payments, booking tables, Stripe, or production resources changed.
- NOT TESTED: Cloudflare deployment, actual multiple-listing inventory, responsive/browser keyboard behavior, authenticated conversion, Stripe TEST reconciliation. Next Growth pass should verify directory routing and identify a stable listing-specific URL design with Developer before changing the booking identity model.
- Coordination: Growth owns this directory recovery change. Developer/Hunter retain checkout and Stripe E2E, Landowner retains maps/reviews, Legal retains tax/policy. Launch remains NO-GO pending outstanding evidence in the shared Stripe gate.

## 2026-11-17 Growth responsive card overflow guard

- REVIEW (source inspection): `outfitter-experience.html` wrapped long listing title, location and descriptions, but not group capacity, price or custom price labels. Unbroken text in these fields could overflow narrow booking cards; no real malformed inventory or browser reproduction is claimed.
- PASS (staging source correction): commit `782bda56d820ea353f945fc14a8c19e62d4d5a10` applies `overflow-wrap:anywhere` to `#group`, `#price` and `#price-label` while preserving existing styles and booking/payment logic.
- NOT TESTED: deployed Cloudflare rendering, actual sandbox inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, keyboard/zoom, signed-in conversion, Stripe TEST reconciliation. Ask Hunter QA/Designer to browser-smoke-test after deployment; Growth retains discovery ownership.
- Launch remains NO-GO per shared Stripe launch gate. No production resources or main branch changed.

## 2026-11-18 Growth hidden-state CSS correction

- FAIL (source-level): `.layout{display:grid}` is an author stylesheet declaration that can override the user-agent `[hidden]{display:none}` default on `#experience`, exposing empty listing content and request controls while data loads or on invalid listing IDs. This is a source-level reproducible cascade issue, not a browser-observed incident.
- PASS (staging source commit `20529f711ab7981290f180ae891c7f18c1bb8bee`): add `[hidden]{display:none!important}` to ensure `#experience`, `#status`, `#photo`, `#hog-policy` and `#login-fields` respect application visibility state. No booking, auth, database, Stripe or production logic changed.
- NOT TESTED: independent Cloudflare deployment, rendered browser state, real inventory, all ten responsive widths, keyboard/touch/zoom, checkout and Stripe TEST reconciliation. Hunter QA/Developer should verify hidden states in deployed browser; Growth owns this detail-page presentation change. Launch remains NO-GO.

## 2026-11-18 accepted-payment CTA clarity (Growth Research)

- **REVIEW (source inspection):** Outfitter detail page linked directly to `outfitter-pay.html` with generic 'Pay for an accepted outfitter request' wording alongside an availability-request form. This could suggest payment is the next step even before an outfitter has accepted. No actual visitor confusion or paid conversion is claimed.
- **PASS (staging source correction):** commit `02ef7b8ba89171cf313d17c4db1f9810d067685f` clarifies that payment follows acceptance and labels the link 'Review accepted-request payment'. No payment endpoint, checkout calculation, authentication or database logic changed.
- **NOT TESTED:** Cloudflare deployment, live browser click-through, whether `outfitter-pay.html` independently verifies accepted booking ownership and payout readiness, ten responsive widths, actual inventory, and Stripe TEST reconciliation. Developer/Hunter QA should confirm payment route rejects unaccepted or unauthorized requests and that final totals, taxes, promos, and extras are transparent.
- **NO-GO:** Preserve the shared Stripe launch gate; source-only copy correction does not prove financial safety.


## 2026-11-18 Growth invalid/unavailable listing recovery

- **REVIEW (source):** `outfitter-experience.html` returned plain text dead ends for malformed/missing `id` and inactive/unavailable outfitter records. This could strand visitors arriving from old or mistyped links; no actual visitor failure or sandbox inventory reproduction claimed.
- **PASS (staging source correction):** `efedf68d4bbaeadf3ee70044b1c0a623b62d0db0` adds safe DOM-created links back to `outfitters.html` for invalid and unavailable listings, consistent with the existing multiple-listing recovery. Does not alter booking, Stripe, Supabase writes or SEO robots settings.
- **NOT TESTED:** sandbox Cloudflare browser rendering, directory route navigation, actual inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, keyboard/zoom, authenticated conversion and fresh Stripe TEST reconciliation. Web retrieval of the sandbox detail URL was inaccessible in this run; this does not establish a deployment outage.
- **Coordination:** Growth owns discovery/recovery UI; Hunter/Developer own booking/payment validation; Landowner owns maps/reviews; Legal owns policy/tax. The Stripe launch gate remains **NO-GO** pending delivered receipt, bank payout, partial refund, Stripe Tax registration/classification and other listed gaps.

## 2026-11-18 Growth availability-request accessible busy state

- **REVIEW (source inspection):** The outfitter request button changed its text to “Submitting request…” and was disabled during submission, but did not expose an explicit `aria-busy` state to assistive technology. No browser/AT failure is claimed.
- **PASS (staging source change):** commit `b450c0f045dc49f1f1183aa8658be986f66606d1` sets `aria-busy=true` during availability submission and removes it on success and failure. Existing visible status messages, validation, booking insertion and Stripe/payment logic are unchanged. This is a small reversible accessibility improvement.
- **NOT TESTED:** deployed Cloudflare rendering, actual screen-reader announcements, ten viewport widths, signed-in booking, synthetic inventory, Stripe TEST reconciliation. Growth owns this page's conversion/accessibility; Hunter/Developer own authenticated payment E2E; Landowner owns zones/reviews; Legal owns tax/policy.
- **NO-GO:** The shared Stripe launch gate still lists delivered receipt, external-bank payout, partial refund, Stripe Tax classification/registration and other unproven launch requirements. Do not infer a payment pass from this source-only change.


## 2026-11-18 Growth request authentication response guard

- **REVIEW (source inspection):** The availability-request handler destructured `data.user` directly from `client.auth.getUser()`. An unexpectedly empty authentication response could throw a TypeError instead of displaying the intended sign-in guidance. This is a source-level resilience risk, not a browser-reproduced failure.
- **PASS (staging source commit `12fd3db16367c99c8126d60c8d6f05f46135a4f6`):** Check the returned authentication error explicitly and access `authData?.user` safely. On failure the existing catch/finally-style recovery restores the request button and clears `aria-busy`. Booking inserts, pricing, Stripe, taxes and payout code unchanged.
- **NOT TESTED:** deployed Cloudflare browser, simulated malformed auth response, ten responsive widths, authenticated submission, synthetic inventory and fresh Stripe TEST reconciliation. Growth owns this UI; Hunter/Developer own booking/payment regression; Landowner owns map/reviews; Legal owns policy/tax.
- **NO-GO:** Receipt delivery, bank payout, partial refund, Stripe Tax and remaining cross-role/payment gates still require evidence.


## 2026-11-18 Growth listing-fetch failure recovery

- **REVIEW (source):** A failed or timed-out outfitter detail API fetch offered only a page reload, leaving visitors with no alternative discovery route during persistent service failure. This is a source-observed UX limitation; no browser failure was reproduced.
- **PASS (staging source correction):** commit `dc32dc84d8e351d58c1519411c49845785fb987f` adds a safe DOM-created `Browse available outfitter experiences` link alongside `Retry loading` in the network/error state. No payment, booking, database write, Stripe, or production code changed.
- **NOT TESTED:** deployed Cloudflare browser failure injection, actual inventory, responsive matrix (320/375/390/430/768/1024/1280/1440/1920/2560), keyboard/zoom and Stripe TEST reconciliation. Growth owns discovery; Hunter/Developer own booking/payment; Landowner owns maps/reviews; Legal owns tax/policy.
- **NO-GO:** The shared payment gate still lacks delivered receipts, external-bank payout, partial refund, Stripe Tax registrations/classification, and other cross-role evidence. This change does not close those gates.


## 2026-11-18 Growth missing-auth-SDK fallback

- REVIEW (source): `outfitter-experience.html` called `supabase.createClient` unconditionally after loading its external SDK and configuration. A failed CDN load or absent configuration caused a JavaScript exception without a useful explanation to visitors. This is a source-level resilience issue, not a reproduced outage.
- PASS (staging source commit `a5fc7ae50496b46d7c902f84e5398204c1417259`): detect unavailable Supabase SDK/config before initialization, display a recoverable sign-in error, and disable sign-in and request controls. Existing listing discovery, booking writes, pricing, tax and Stripe code are unchanged.
- NOT TESTED: CDN failure injection in browser, Cloudflare deployment, ten responsive widths, actual sandbox inventory, signed-in booking and fresh Stripe TEST reconciliation. Growth owns outfitter discovery/conversion; Hunter/Developer own authenticated checkout/payment; Landowner owns maps/reviews; Legal owns tax/policy.
- NO-GO: receipt inbox, bank payout, partial refund, Stripe Tax registrations/classification and remaining launch gates require independent evidence. Do not duplicate payment evidence from the shared gate.

## 2026-11-18 Growth async authentication race guard

- FAIL (source-confirmed): When the Supabase SDK/configuration is unavailable, the auth initialization disables Request availability, but an independently running listing-fetch completion could subsequently re-enable the button. This creates a broken conversion path despite the sign-in error message. No browser reproduction claimed.
- PASS (staging source fix): `3d73e7fe2723ea35234ab9668d58b544794728f4` marks the button with `data-auth-unavailable=true` on auth initialization failure; the listing fetch now honors that marker rather than re-enabling the button. This is UI-only; no payment, booking, database, or production changes.
- NOT TESTED: Cloudflare deployment, simulated SDK failure in browser, actual inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 viewports, keyboard/zoom, authenticated booking and fresh Stripe TEST reconciliation.
- Coordination: Growth owns this outfitter detail state race. Hunter/Developer should verify the deployed browser case and retain Stripe E2E ownership; Landowner owns maps/reviews; Legal owns tax. Launch NO-GO until payment gates independently pass.

## 2026-11-18 Growth Supabase client-construction exception guard

- REVIEW (source): The prior missing-SDK guard handled absent globals but did not handle `supabase.createClient(...)` throwing (e.g. malformed runtime configuration). Such an exception would bypass the visible sign-in fallback; listing fetch could later enable Request availability. This is a source-observed failure path, not a reproduced sandbox outage.
- PASS (staging source commit `c0cc92ad8e267378d545ce52a0ea2926cb8b2d77`): catch client-construction exceptions, show the same actionable connection error, disable login/request buttons, and mark `data-auth-unavailable` so the asynchronous listing loader cannot re-enable requests. No booking insert, price, Stripe, tax, or production logic changed.
- NOT TESTED: Cloudflare deployment, browser exception injection, actual sandbox inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 widths, keyboard/zoom, authenticated request and Stripe TEST reconciliation. Growth owns discovery/conversion; Hunter/Developer own booking and payment E2E; Landowner owns zones/reviews; Legal owns policy/tax.
- NO-GO: the shared Stripe launch gate still lacks delivered receipt, bank payout, partial refund, Stripe Tax registration/classification and other launch evidence. This source fix is not a payment test.
