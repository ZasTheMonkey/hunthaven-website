# LeaseWild Stripe launch gate — 2026-11-11 (SANDBOX ONLY)

Scope: GitHub `ZasTheMonkey/hunthaven-website` branch `staging/leasewild-full-clone`, Cloudflare `leasewild-sandbox.pages.dev`, sandbox Supabase `kbkdfpmlyggfijkyjxoi`, Stripe sandbox `acct_1TOJ2rAO40Rp32aF` ONLY. Never push/merge/deploy to main or live leasewild.com. Never use Stripe livemode or real cards. Owner's explicit **Go Live!!** required before any production deployment.

## Initial independent audit (read-only)

- PASS — Stripe sandbox connector selected; not live account. 10 test Checkout Sessions, including completed paid and completed unpaid/manual-capture/canceled scenarios. 14 PaymentIntents, successful, canceled and released/declined simulation. 7 Stripe test refunds with status succeeded.
- PASS — One enabled webhook endpoint `/functions/v1/sandbox-booking-webhook`; subscribed events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
- PASS — Verified relevant Supabase Edge Functions ACTIVE: `sandbox-booking-checkout`, `sandbox-booking-webhook`, `sandbox-booking-approval`, `sandbox-booking-expiry`, `sandbox-booking-cancel`.
- REVIEW — Current landowner checkout uses manual-capture authorization: user authorizes card, owner approves within 24 hours, capture on approval. Checkout and approval functions enforce test-mode keys. Webhook validates signature and Stripe state. Actual browser E2E tests are NOT VERIFIED by this audit.
- REVIEW — 6 of 13 sandbox bookings are cancelled, 2 confirmed, 1 declined, 2 expired, 2 pre_reserved. 6 cancelled booking records have test payment-intent IDs; one full refund >48h before checkin was found, while later cancellations match the sandbox's no-refund-within-48h policy. Check all cancellation economics, business approval and date/timezone logic.
- BLOCKER — Stripe Tax settings status **pending** (head office missing); 0 tax registrations. Sandbox checkout/policy code applies a flat 6.5% to lease amounts. This is NOT a validated tax treatment; do not assume it applies to all rentals, guided services or jurisdictions. Owner/tax advisor must confirm tax obligations before live charges. Do not add fake registrations or enable Stripe Tax without them.
- BLOCKER — `public.outfitter_stripe_accounts` has 0 rows, hence 0 payout-ready outfitters. Stripe sandbox has 2 connected test accounts, but they are not linked to outfitters through the LeaseWild sandbox data. Need test outfitter onboarding and destination payout using synthetic identities.
- REVIEW — Outfitter booking requests currently include a declined/unpaid test. No end-to-end paid outfitter reservation is proven.
- REVIEW — Webhook handler only handles booking checkout completed, async success, expired and ignores payment-intent capturable; no async-failed, refund/dispute lifecycle evidence. Confirm actual requirements for enabled payment methods and expected financial reconciliation.
- FIXED/VERIFIED — Revoked anon and authenticated EXECUTE on `public.enqueue_pending_listing_notification()` trigger function in sandbox; verified both roles now cannot execute it. Other security-definer functions still require individual audit. Leaked-password protection remains disabled.
- REVIEW — Existing `stripe-checkout` / `cleaning-deposit` legacy or alternative functions use Stripe SDK v14.25.0 and Stripe API 2023-10-16. Confirm which flows are deployed and called; don't confuse legacy paths with active booking checkout. Some carry an older production-origin CORS setting despite being present in sandbox; inspect carefully.
- NOT TESTED — New test-card Checkout UI flow run, declined card retry, 3DS authentication, double-submit/concurrent bookings, price and discount/add-on verification, cleaning deposit hold/capture/release, voucher/promo, chargebacks, settlement, webhook delivery retry, failure recovery, payout reconciliation, mobile checkout.

## Bots: mandatory immediate launch-day Stripe QA

- Designer/Developer: isolate exact active browser checkout routes, inspect deployed sandbox vs staging commits, test manual capture > decline/approve > webhook, reconcile Stripe + Supabase statuses, locate and fix errors. Test simultaneous requests / booking collision. Investigate security and mixed-origin/legacy Stripe functions.
- Hunter QA: real browser Stripe TEST card flow, success, declines, 3DS, retries, two-click duplicate attempt, guest cancellation before/after 48-hour deadline, booking status and receipt/confirmation; collect evidence.
- Landowner QA: owner approval within deadline triggers exactly one capture, decline releases auth, expired approval returns inventory and releases holds, property payout/connect readiness, cleaning damage-deposit lifecycle (hold, release, allowed claim) test mode.
- Legal Risk Review: verify cancellation language, tax treatment and chargeback/dispute policies vs actual UI/handlers; note legal/tax uncertainties, privacy of payment data, no misrepresenting capture/refund outcomes.
- Growth Research: test checkout fee/total transparency, tax line display, promo code, hog-hunting add-ons, confirmation messages; prioritize conversion-safe fixes, avoid paid campaigns/launch announcements before gate passes.

## Required proof before calling Stripe launch-ready

1. Actual UI tests using Stripe official TEST cards only, report Test IDs and screenshot/visible result with PASS/FAIL/BLOCKED, no real PAN.
2. For each payment: verify Stripe Checkout Session, PaymentIntent, Supabase booking/request state, webhook delivery and expected messages.
3. Approval/decline/refund/expiry/deposit/duplicate/Connect paths verified; failure cases do not charge unexpectedly and never overbook.
4. Complete policy and tax review; real registration and correct tax class handled outside sandbox only with owner's explicit approval.
5. No security/privacy regressions and no production secrets in client code. Never modify Stripe live mode or GitHub main.
6. Report individual blockers clearly. Do not declare launch ready solely from registered endpoints or historic test records.

Findings are read-only observations, not proof of today's new E2E test execution. Continue scheduled QA and fix issues in staging/sandbox only; report reproducible evidence and commit SHA.

## 2026-11-11 coordination

All five saved LeaseWild automations (Designer/Developer, Hunter QA, Landowner QA, Legal Risk Review and Growth Research) had this file and launch-day sandbox-only Stripe testing added to their saved instructions. Their immediate run commands were invoked; the inline audit findings above do NOT constitute separate passed browser E2E results. Continue on their existing schedules and log real evidence.

## 2026-11-11 14:27 ET follow-up — fresh verification

- CONFIRMED FAILURE: staging `outfitter-experience.html` states `Requests are not confirmed reservations. No payment is collected.` and submission message `No payment was taken.`; `outfitter-portal.html` displays `Accepted — payment not collected` and approval confirmation `No payment will be collected.` The current outfitter UI does **not** charge hunters. No end-to-end outfitter booking payout is possible until this is implemented and tested.
- VERIFIED EXISTING STRIPE TEST CONNECT: `GET /v1/accounts` returns test connected account `acct_1TOJMRAO408zPcFQ`, `charges_enabled=true`, `payouts_enabled=true`, `capabilities.transfers=active`, and a Stripe test bank account. Four historic test transfers exist, including `tr_3UZrcCAO40Rp32aF1uRujzrX` for 10,970 cents. These are **not** fresh outfitter booking payout evidence.
- CONFIRMED BLOCKER: sandbox `public.outfitter_stripe_accounts` contains zero rows, despite Stripe test connected account existing. Need a synthetic outfitter account linked through an authenticated onboarding flow; never insert someone else's Stripe account ID into a real user record.
- CONFIRMED TAX BLOCKER: Stripe Tax settings `status=pending`, `head_office=null`, `missing_fields=[head_office]`, and no tax registrations. Need owner's actual business tax address and list of jurisdictions where the business is registered; do not fabricate. Fixed 6.5% code cannot be certified as correct for all marketplace products.
- LIMITATION: no authenticated browser or test identity/session accessible in current tool session, so no fresh UI test-card completion. No fresh payment, payout or webhook event was created in this follow-up. Historic tests remain historical only. Maintain launch gate.

**Implementation priority:** Add authenticated outfitter Checkout with TEST Stripe Connect destination charge/transfer, server-side price/tax/add-on/promo validation, webhook signature+idempotency and reservation state transitions; run real UI test card payment + refund, 3DS, declined card and payout reconciliation before launch. Do not change live site.

## 2026-11-11 16:38 ET — Landowner QA fresh sandbox reconciliation

- **PASS (database read, not E2E):** `public.outfitter_stripe_accounts` now contains **one** linked synthetic outfitter: `0c9ed01e-8c96-4a35-b0db-a8ed34322e11` → Stripe TEST connected account `acct_1TOJMRAO408zPcFQ`, stored flags `charges_enabled=true`, `payouts_enabled=true`. The earlier “0 linked outfitter accounts” blocker in the initial audit is **outdated**. This does not prove a fresh charge, transfer or bank payout.
- **PASS (database read):** `public.outfitter_booking_requests` has **three** rows: two `accepted/unpaid`, one `declined/unpaid`. Synthetic accepted booking `3cac448b-0331-4a91-a46a-eaec4d316bae` (trip 2026-11-25) is **still unpaid**. Thus **zero paid outfitter bookings** are evidenced in the sandbox booking table.
- **P0 remains:** Implement and verify a real authenticated outfitter Stripe TEST checkout and reconcile PaymentIntent, webhook, booking state, Connect transfer and payout. Do not claim readiness from connected-account flags alone. Designer/Developer and Hunter QA own browser checkout; Landowner QA to verify owner-facing payment/booking visibility and authorization.
- **NOT TESTED this pass:** Browser checkout, authorization/capture/3DS/decline, bank payout, authenticated zone drawing/save/reload, cross-owner denial, review eligibility, responsive matrix. No payments/refunds were initiated, no real accounts touched, no production deployment.

## 2026-11-11 16:50 ET — Growth Research sandbox audit

- **FIX COMMITTED, DEPLOY PENDING:** `outfitters.html` had conflicting successive CSS overrides causing the mobile directory photo to expand to its intrinsic height and the CTA to inherit dark green text over a dark green background (owner screenshot). Added final scoped CSS to restore a bounded 16:10 cropped image, flex card, high-contrast white-on-green 48px CTA, keyboard focus ring and narrow-screen heading wrapping. Commit `2defa83b25543c7e82d83f792e144a940de80cd7`. Cloudflare deployment for that commit was at `clone_repo/active` on inspection; **not yet browser-verified**. Source-level inspection PASS, responsive 320–2560 browser matrix NOT TESTED.
- **PAYMENT GATE OPEN:** Outfitter booking checkout currently uses sandbox-only platform-held test payment fallback when no Connect account is linked (function v3). This must not be confused with a verified Connect payout. No fresh authenticated Stripe test payment or webhook reconciliation was executed by Growth Research; status **NOT TESTED**. Tax registration/classification, promo/add-on totals and cleaning deposit remain unverified. Never port the fallback to live.
- **Coordination:** Growth Research owns directory presentation and conversion copy. Other bots should avoid editing `outfitters.html` concurrently without fetching the latest SHA. Hunter QA / Developer own authenticated payment E2E; Landowner QA owns booking reconciliation; Legal owns tax/policy. No production resources changed.

## 2026-11-11 17:21 ET — Landowner QA new paid-outfitter reconciliation

- **NEW PASS (cross-system read):** One outfitter booking is now `accepted/paid`: sandbox booking `109b742b-471a-42c1-972f-e43f7fd0d3f9`, Checkout `cs_test_a0kItbfKi7528zMIrYY9Qqp3jr4wxxtEABdC2QTUm2uxQuE1noQRhdfWP1`, PaymentIntent `pi_3UajWCAO40Rp32aF3UhWMCT1`. Stripe TEST PaymentIntent is `succeeded`, `livemode=false`, amount received **25,000 cents ($250)**. This supersedes the earlier zero-paid-outfitter observation. The linked synthetic outfitter booking `3cac448b-0331-4a91-a46a-eaec4d316bae` remains accepted/unpaid.
- **P0 REVIEW (Connect payout not proven):** The successful $250 PaymentIntent has metadata `platform_only_test=true` and `sandbox=true`, with `transfer_data=null` and `application_fee_amount=null`. Its booking belongs to outfitter `11e4aede-a553-4b13-bdb2-bd8e2dad5ff8`, not the single connected synthetic outfitter `0c9ed01e-8c96-4a35-b0db-a8ed34322e11`. This is a platform-only test charge, **NOT** proof of a destination charge, separate transfer, or bank payout. Do not describe it as a successful Connect E2E.
- **PASS (database snapshot):** Three outfitter requests: one accepted/paid, one accepted/unpaid, one declined/unpaid; one Stripe-linked synthetic outfitter with enabled flags. Three access zones exist (one hunting area, one entry, one parking); zero hunter reviews. These are counts, not UI test results.
- **NOT TESTED:** New authenticated landowner browser drawing/save/reload, owner B isolation, verification, reviews, messages, ten viewport widths; Stripe TEST decline/3DS/retry, webhook delivery proof, refunds, real Connect transfer/payout, tax classification. No fresh test charge was initiated in this Landowner QA pass; this is reconciliation of another sandbox test.
- **COORDINATION:** Developer/Hunter QA: verify whether platform-only fallback is restricted to sandbox and implement/test real Connect payout for the linked synthetic outfitter. Landowner QA: inspect owner-facing paid booking and zone persistence with authenticated browser. Legal: retain tax gate. **NO-GO**; no production changes.


## 2026-11-11 17:53 ET — Growth Research checkout/cancellation conversion review

- **PASS — sandbox deployment metadata:** Cloudflare Pages reports commit `a19ae59bf43c82e4814fef414a47f0c2e6f85f1a` successful at deploy stage. This fixes a missing `SUPABASE_URL` reference in the shared outfitter cancellation modal; a successful deployment is **not** authenticated browser/Stripe refund proof.
- **FAIL (owner screenshot, before latest fix):** Hunter's paid outfitter cancellation preview showed `Can't find variable: SUPABASE_URL`, blocking the cancellation confirmation. Latest commit substitutes the sandbox-only endpoint and publishable key; **retest on iPhone and verify authenticated preview + refund before marking fixed**.
- **REVIEW — customer communication:** New outfitter cancellation UI mirrors landowner's 48-hour policy, but the user must see an accurate full/no-refund preview before confirmation. The current function's refund status can be pending after Stripe refund initiation; never label a refund as settled without reconciling Stripe's actual refund status and Connect fee/transfer reversal.
- **REVIEW — existing request:** Synthetic paid booking `109b742b-471a-42c1-972f-e43f7fd0d3f9` has a pending cancellation request. Do not generate duplicate refunds or assume cancellation occurred. Reconcile booking status, Stripe TEST PaymentIntent, Refund and request status after the user's next test.
- **NOT TESTED — conversion matrix:** 320/375/390/430/768/1024/1280/1440/1920/2560 viewport screenshot matrix, keyboard/zoom, promo/add-on price breakdown, live checkout and tax display, 3DS/decline and payout settlement remain unverified by Growth Research. No new payments or synthetic records created this run.
- **P0 — launch remains NO-GO:** Stripe Tax registration/classification, true Connect payout, full E2E payment/refund evidence, and end-user cancellation confirmation remain open. Coordinate with Developer/Hunter QA for authenticated checkout/refund tests; Legal Risk Review for tax/cancellation policy. Growth Research continues discovery and transparent conversion copy; no live changes.

## 2026-11-11 18:26 ET — Growth Research conversion integrity

- **FAIL (source verified):** Public `outfitters.html` lead/application form claimed “Application received! We'll be in touch soon” and cleared all entered fields without any network submission or persistent storage. This is a false-success conversion and loses prospective outfitter leads.
- **FIX COMMITTED:** `41bc590fd6703657167e85776ad352d0fccd485b` changes the form to disclose that submissions are unavailable and that no information was sent, preserving entered values. Syntax check PASS. **Deploy/browser confirmation PENDING**; form still needs a real consented submission endpoint and spam controls before enabling success states. No production changes.
- **SEO REVIEW:** `outfitters.html` includes a production canonical and OG URL; sandbox-wide `_headers` sets noindex/nofollow. Do not index sandbox or remove its noindex policy.
- **PAYMENT GATE:** Checkout total/tax/add-on/promo and Stripe Connect payout browser E2E remain **NOT TESTED** in this run. No test payment/refund performed. Prior historical Stripe records are not fresh proof; launch remains **NO-GO**.
- **RESPONSIVE:** 320/375/390/430/768/1024/1280/1440/1920/2560 actual rendered viewport matrix **NOT TESTED** (no browser rendering session available in this run); source inspection alone is not PASS.

## 2026-11-11 18:42 ET — Landowner QA cancellation closure and second charge reconciliation

- **PASS (sandbox DB + Stripe TEST cross-read):** Outfitter booking `9322e2b7-1022-48c5-a996-f4e7c47e0e2f` is `accepted/paid`; its TEST PaymentIntent `pi_3UakixAO40Rp32aF3AZMg72p` is `succeeded` for 25,000 cents. This is a second distinct successful $250 test payment, not a new charge initiated by this QA run.
- **PASS (cancellation workflow record, not browser E2E):** Earlier paid booking `109b742b-471a-42c1-972f-e43f7fd0d3f9` now reads `cancelled/paid`. Its cancellation request `2bd57a14-a029-4b0b-869a-629a3f6e2551` is `closed`, `refund_policy=no_refund`, `refund_amount_cents=0`, `refund_status=not_applicable`, with request at 22:35:42 UTC and resolution at 22:53:27 UTC on November 11. The original $250 PaymentIntent remains succeeded; no refund was expected per the stored policy decision. This proves recorded policy handling, **not** that checkout disclosures or cutoff calculations were correct.
- **CONNECT PAYOUT NOT PROVEN:** Both successful $250 PaymentIntents have `metadata.platform_only_test=true`, `transfer_data=null`, `application_fee_amount=null`. Both belong to the outfitter without a linked Stripe Connect account. The sole linked synthetic outfitter's $200 booking `3cac448b-0331-4a91-a46a-eaec4d316bae` remains `accepted/unpaid`. Therefore neither payment proves a connected-outfitter transfer or bank payout.
- **P0:** Developer/Hunter QA should execute Stripe TEST checkout for the **linked** synthetic outfitter, confirm transfer and payout records, and test 3DS/decline/refund; Legal should confirm no-refund policy disclosure, cutoff, and applicable taxes. Landowner QA to validate owner booking visibility, map save/reload, review permissions and cross-owner denial with authenticated synthetic sessions.
- **NOT TESTED this run:** New card entry, webhooks, Connect transfer/payout, authenticated map/verification/messaging/reviews, viewport screenshots 320–2560. No Stripe mutations, production access, main/live deployment, or real payments. **NO-GO**.


## Growth Research — directory conversion audit (2026-11-11 evening)

- PASS (database read-only): sandbox `public.outfitter_listings` contains **2 active** rows; `counties` is text, `species` and `photos` are text arrays, and `price` is numeric. No synthetic inventory was created or mixed into the directory.
- FAIL (source inspection): outfitter directory application section claimed applications were being accepted even though its submit handler only displayed an unavailable message and never persisted a lead. This risks misleading applicants and lost leads. **FIX COMMITTED** `870e41d`: application availability copy now matches reality, input is preserved, and unreachable reset statements removed. Actual application backend remains NOT IMPLEMENTED.
- FIX COMMITTED `870e41d`: public directory now guards against invalid/negative numeric prices and validates optional location/species fields before rendering. Static inline script syntax validated. Browser responsive widths and network-loaded directory rendering remain NOT TESTED this run.
- Launch gate remains **NO-GO**: do not mistake static code validation or existing inventory for verified checkout/refund/tax/payout E2E evidence. No production/live changes.

### Growth Research — 2026-11-11 20:20 ET
- **FIXED (source)** — Outfitter directory had a visibly disabled application heading but still presented name/email inputs and a clickable “Submit Application” control that could never persist leads. Removed the dead form and replaced it with an accessible 48px link to outfitter requirements. Commit `fd903b50`. No checkout or payment files touched.
- **PASS (static inspection)** — Form controls and dead submission handler removed; HTML script open/close counts match (4 each). **NOT TESTED** — Browser conversion flow, all ten viewport widths, keyboard and zoom, and post-deployment visual inspection.
- **NO-GO** — Existing Stripe Tax, Connect payout and test-payment reconciliation blockers remain; this change does not address payment readiness.


## Growth Research — 2026-11-11 21:39 ET — directory claims and slow-response safety

- FIXED (source verified): `outfitters.html` previously advertised *licensed* outfitters in the SEO description and a comparison card without per-outfitter licensing proof in the directory. Changed public claims to neutral experience language and added a reminder to confirm credentials before booking. Commit `c6c175caf09837ba654729aedd3bb9328fa19fc9`.
- FIXED (source verified): directory previously used a 12-second timer that replaced the listing grid even if a fetch eventually succeeded. The fetch now uses AbortController and a specific timeout message, avoiding a late success/timeout race. Same commit.
- PASS: Embedded JavaScript parsed successfully in static syntax checks; changes are limited to public directory content and fetch lifecycle, with no payment functions changed.
- NOT TESTED: browser viewport matrix (320–2560 px), actual authenticated checkout, Stripe TEST card and payout reconciliation, mobile Safari visual evidence. Do not infer browser PASS from syntax checks.
- NO-GO unchanged: Stripe Tax registration, payout-account linkage, refunds and end-to-end checkout proof remain required.


## Growth Research — 2026-11-11 22:08 ET — directory recovery and data hygiene

- **FIXED (source):** Public outfitter directory had no in-page recovery control when Supabase returned an error or timed out. Added a keyboard-operable 48px retry button that reloads the directory. Commit `5fd2f7bf1ac7dbff4a597150a317a1b54c76f8e6`.
- **FIXED (source):** Species chips now exclude non-string and empty entries before joining; bio is rendered only when nonempty text. Prevents malformed inventory values from leaking into discovery cards.
- **PASS:** GitHub staging commit succeeded; changes are confined to public directory display and do not modify Stripe/payment code.
- **NOT TESTED:** Actual timeout/retry browser behavior, 320–2560 responsive screenshots, authenticated bookings, Stripe TEST refund/payout reconciliation. Await deployment confirmation and browser evidence; do not claim launch readiness.
- **NO-GO:** Stripe Tax, Connect payout and E2E payment evidence remain open. No production/live changes.

## 2026-11-11 22:25 ET — Landowner QA identity onboarding
- **FAIL reproduced:** Landowner signup requested a driver's-license file but did not persist it. This could misleadingly imply successful ID submission after account creation. Sandbox identity verification table and private bucket both showed zero submissions/objects.
- **FIX staged:** `aedac5afe2a47fe49289d02ff394968ca885fce5` removes the misleading signup ID picker/requirement and explicitly directs landowners to authenticated dashboard ID verification. No proof of ownership required. Inline JS syntax PASS; authenticated E2E NOT TESTED.
- **Still NOT TESTED:** ID upload/review with synthetic identity, map save/reload, owner/hunter isolation, landowner authorization/capture, Stripe TEST UI card transactions, refunds, responsive viewport matrix. Stripe launch gate stays open. Other bots: do not reintroduce unauthenticated signup ID upload.

## 2026-11-11 23:35 ET — Landowner QA automated reconciliation
- **PASS (sandbox read-only):** 16 booking rows by status: authorization_pending 1, cancelled 8, confirmed 2, declined 1, expired 2, pre_reserved 2. This is a database state inventory, not UI E2E proof.
- **FAIL / high priority:** Latest booking `b9484030-63c3-4cd8-ad60-4353cf5cfb82` is still `authorization_pending` despite having a Stripe Checkout session. Created 2026-11-12 04:17:56 UTC, check-in 2026-11-13, approval deadline 2026-11-13 04:17:56 UTC. Investigate whether checkout was completed, whether webhook fired, and whether it should transition to `pending_approval`; do not manually advance without verifying Stripe state.
- **FAIL / high priority:** New booking-email outbox currently has no rows; `sandbox-booking-email-worker` v1 is deployed but requires sandbox RESEND_API_KEY, SANDBOX_EMAIL_WORKER_SECRET, recipient allowlist and authenticated scheduler. Thus landowner approval email remains unproven and adult guest ID invites are unimplemented. Do not send real-recipient sandbox messages.
- **NOT TESTED:** authenticated landowner polygon save/reload, property ID document verification, owner/hunter isolation, review eligibility, browser responsive matrix, Stripe test-card UI, refund and payout E2E. No production or live Stripe accessed; no synthetic payments initiated in this run.

## Growth Research — 2026-11-11 23:49 ET — outfitter SEO metadata
- **FAIL (source):** `outfitters.html` metadata still claimed all listed guides were licensed, despite on-page copy warning users to check credentials; sandbox route also advertised index/follow and a live-domain canonical/OG URL.
- **FIXED (source):** commit `8af8f67794f6d37c8f6778bd3e079037e1cddbf9` removes unsupported licensed-guide claims, sets sandbox directory `noindex, nofollow`, and points canonical/OG URL to sandbox. Only staging file changed; production SEO unaffected.
- **PASS:** GitHub staging commit accepted. **NOT TESTED:** rendered search snippets/crawler behavior, mobile viewport matrix, Stripe TEST E2E and payout/refund reconciliation. Launch remains **NO-GO**.

## Growth Research — 2026-11-12 00:24 ET — outfitter discovery integrity and photography
- **FAIL (source):** The public directory hero still claimed all listed outfitters were licensed even after SEO metadata was corrected. The listing media also had conflicting CSS rules: an earlier `object-fit:contain`/natural-height rule was overridden by a later `object-fit:cover`/fixed-ratio rule, potentially cropping uploaded listing photos on mobile.
- **FIXED (source):** Commit `7ee9b14ed9f4218dce33ebc1389f521175843438` changes visible hero text to neutral, credential-checking language, uses sandbox OG/Twitter image URLs, and adds a final scoped CSS override to show the full photograph without `cover` cropping. No payment code or production resources touched.
- **PASS:** Embedded JavaScript static parse check; staging commit accepted. **DEPLOY PENDING:** Cloudflare deployment `7ee9b14` observed active at initialize stage. **NOT TESTED:** live rendered visual at 320/375/390/430/768/1024/1280/1440/1920/2560 px, keyboard/touch/zoom, actual Stripe TEST checkout/refund/webhook/payout reconciliation.
- **NO-GO:** Stripe Tax registration, Connect payout accounts, booking/payment reconciliation, and refund E2E remain unresolved. Coordinate with payment and QA teams; do not infer production readiness from discovery fixes.

### Growth Research — 2026-11-12 01:28 ET
- FIXED IN SOURCE — `outfitters.html` guidance incorrectly asserted every outfitter must hold a Florida freshwater/saltwater guide license, irrespective of service. Replaced with activity-specific credential/permit requirements and guest verification guidance. Also corrected Twitter preview image URL to sandbox origin. Commit `92b9f12`.
- PASS — GitHub staging file update accepted; original file SHA was verified before write.
- NOT TESTED — Rendered Cloudflare deployment, real browser responsive matrix, social crawler preview, and credential accuracy for individual listings. No production changes or payment code edits.
- NO-GO unchanged — Stripe TEST reconciliation, tax configuration, payout linkage and complete E2E payment/refund evidence remain outstanding.


### Growth Research — 2026-11-12 02:21 ET — outfitter detail navigation integrity
- **FAIL (source):** Directory linked every active record using `outfitter-experience.html?id=` plus `user_id` without checking identity. A malformed active record missing `user_id` would create a broken `id=undefined`/`id=null` detail link.
- **FIXED IN SOURCE:** Skip active records lacking a nonblank string `user_id`, and display a truthful empty state if no navigable records remain. Staging commit `3610dbe7141c632a9990bd82cd541743bcd04107`. No payment code or sandbox data modified.
- **PASS:** GitHub commit accepted; inline JavaScript parsed successfully with `new Function`.
- **NOT TESTED:** Browser rendering with malformed synthetic rows, Cloudflare deployment completion, responsive matrix, authenticated Stripe TEST reconciliation. Do not interpret source validation as E2E PASS.
- **NO-GO:** Stripe Tax registration, Connect payout linkage, refund/cancellation reconciliation and end-to-end checkout evidence remain open.

## 2026-11-12 03:52 ET — Growth Research identifier validation

- **FAIL (source inspection):** Directory previously accepted any nonempty `outfitter_listings.user_id`, potentially rendering broken experience links for malformed IDs.
- **FIX COMMITTED (source):** `b359601892012a4069693d86ae1094a0626c7827` now only builds experience links for UUID-shaped user IDs. Empty-state messaging remains for zero valid results. This is a narrow reversible discovery fix; no payment code changed.
- **PASS:** GitHub staging write accepted. **NOT TESTED:** Browser render/deployment confirmation, malformed-record integration test, viewport matrix, keyboard/touch/zoom, and Stripe TEST checkout/refund/Connect reconciliation this run. No synthetic payment or database mutation performed.
- **LAUNCH GATE:** NO-GO pending documented payment/tax/payout evidence. Other teams retain checkout and booking E2E ownership; Growth Research retains discovery and conversion integrity.


## 2026-11-12 04:40 ET — Growth Research mobile conversion CSS

- **FIX COMMITTED (source-level):** `outfitters.html` contained a global `@media(max-width:768px)` rule hiding `.btn-ghost,.btn-primary,.btn-accent` with `display:none!important` across the whole document. This could suppress non-navigation conversion actions on mobile. Scoped the rule to `.nav` only; commit `e40649a1437fb01d6b817aee99e548d4c5df361c` on `staging/leasewild-full-clone`. Reversible single-selector change; no checkout/payment code touched.
- **PASS:** Source comparison confirmed exactly one targeted selector replacement; GitHub commit succeeded. **NOT TESTED:** Actual deployed Cloudflare HTML and browser CTA visibility at 320/375/390/430/768 widths, keyboard and zoom. Do not infer deployed success from GitHub commit.
- **NO-GO:** Stripe Tax classification/registration, verified Connect destination payout, cancellation/refund reconciliation and comprehensive payment UI E2E remain open. No Stripe test payment initiated in this run.


## Growth Research — 2026-11-12 05:07 ET — narrow-screen and motion safety
- **FAIL (source inspection):** Directory heading used an unbreakable price layout and lacked consistent long-title wrapping; narrow viewports risk horizontal overflow. Hover animation did not honor reduced-motion preference.
- **FIX COMMITTED:** `88f8e880fa54b8aa448a9b701341c236e4b17ef5` adds scoped heading/title/price wrapping, text overflow protection, keyboard focus outlines, and reduced-motion rules to `outfitters.html`. Only public directory CSS changed; no checkout, payments, or production code touched.
- **PASS:** GitHub accepted staging commit; source patch is limited to CSS. **NOT TESTED:** actual rendered 320/375/390/430/768/1024/1280/1440/1920/2560 viewport screenshots, mobile Safari, keyboard/zoom and Cloudflare deployment confirmation. Do not treat static fix as browser-verified.
- **LAUNCH NO-GO:** Existing Stripe TEST Connect transfer/payout, tax registration and full refund/checkout E2E remain open; previous platform-only payments do not prove Connect payout. Coordinate with Hunter QA/Developer for authenticated test cards and Landowner QA for database reconciliation.

## 2026-11-12 Growth Research — broken outfitter photo fallback

- **FIX COMMITTED (source-level):** `outfitters.html` now replaces an image that fails to load with the existing textual `LeaseWild experience` placeholder rather than leaving a broken-image icon inside the experience card. Staging code commit `c1c92f58c37ef3594fd5f0cb01a05d3b85b9ab8e`.
- **PASS:** GitHub staging write accepted and exact source replacement confirmed before commit. **NOT TESTED:** rendered broken-image simulation, ten-width responsive matrix, keyboard/zoom, Cloudflare deployment completion, Stripe TEST payment/refund/Connect reconciliation. Do not claim browser or payment E2E success from this source change.
- **COORDINATION:** Growth Research owns public directory fallback and conversion presentation; Developer/Hunter QA own authenticated checkout and webhook proof; Landowner QA owns payout/booking reconciliation; Legal owns tax classification. **NO-GO** until launch gate is fully evidenced. No production/main changes.

## 2026-11-12 07:14 ET — Growth Research image fallback accessibility

- **FIX COMMITTED (source-level PASS):** Outfitter directory image-error handler previously replaced failed images with plain text but did not apply the `.experience-card__placeholder` class; no-photo cards also lacked that class. Both paths now apply the class, and a scoped CSS rule centers and styles the fallback, maintains minimum height, and wraps text. Commit `377c6877710102a27da4ee573330557eae6b55db` on staging only. No payment or production changes.
- **NOT TESTED:** Actual browser image failure rendering, responsive widths 320/375/390/430/768/1024/1280/1440/1920/2560, touch/keyboard/zoom and Cloudflare deployment completion. Source-level checks are not browser evidence.
- **PAYMENT GATE REMAINS NO-GO:** No new Stripe TEST charge, refund, tax registration, webhook reconciliation, or Connect payout verification performed in this Growth Research run. Prior historical evidence cannot close the launch gate. Developer/Hunter QA retain payment E2E ownership; Growth Research retains directory and conversion presentation.

## 2026-11-12 08:38 ET — Growth Research price transparency

- **FIX COMMITTED (source PASS):** Public outfitter directory previously displayed prices without a clear warning that the final amount may include taxes, LeaseWild fees, or optional add-ons. Added a disclosure directly above active inventory explaining that listed prices may not equal checkout totals and directing hunters to inspect the full total before payment. Code commit `cefd37dbbe0d709504719383a2cbe2c1b5cba5b1` (`outfitters.html`). This is a conversion disclosure only; checkout/payment code unchanged.
- **NOT TESTED:** Cloudflare deployment completion, rendered mobile/desktop visibility, actual checkout line-item correctness, Stripe TEST payment/3DS/refund/webhook/Connect reconciliation, and 320–2560 viewport matrix. Source edit alone is not end-to-end proof.
- **LAUNCH NO-GO:** Tax classification/registration and Connect payout plus complete end-to-end evidence remain gate items. Developer/Hunter QA own checkout verification; Legal owns tax policy; Growth owns public directory copy. Sandbox only; no live or main changes.

## 2026-11-12 09:51 ET — Growth Research navigation correction

- **FAIL (source inspection):** `outfitters.html` included `.nav-links{display:none!important}` in the light-theme override, hiding all primary browse/navigation links across viewport widths. Existing mobile CSS also hid non-login navigation links below 768px. This is a discovery/conversion and keyboard navigation defect.
- **FIX COMMITTED (source PASS, browser NOT TESTED):** commit `8b661ea76e02541fe776810f4771105ab8ad5415` restores desktop links and a horizontally scrollable, keyboard-focusable navigation row on <=1024px screens, with login links available in that row. Scoped exclusively to `outfitters.html`; no payment or production changes.
- **NOT TESTED:** Cloudflare deployment confirmation, all 10 responsive widths, touch/keyboard/zoom behavior, authenticated Stripe TEST card and booking reconciliation. Other bots should avoid simultaneous edits to `outfitters.html` and verify live sandbox navigation after deployment.
- **NO-GO:** Tax classification/registration, real Connect payout, refund and payment E2E proof remain open; historical test payments do not close the gate.


## 2026-11-12 10:49 ET — Growth Research directory accessibility
- **PASS (source and staging commit):** Outfitter directory now exposes a polite live region and `aria-busy` during inventory retrieval, clearing busy state for successful loads, empty results, timeouts and connection errors. Commit `15dc5e860687ea7912e523d164f5cf575aff8d56` (`outfitters.html`). No checkout/payment code modified.
- **NOT TESTED:** Screen-reader announcement behavior, Cloudflare deployment confirmation, ten viewport widths, browser screenshots and Stripe TEST reconciliation. These are not source-level passes.
- **SECURITY REVIEW REQUIRED:** Directory source contains a hardcoded Supabase project URL and publishable key. Project identity has not been verified as sandbox-only. Do not invoke the endpoint, write fixtures, or reconcile payments against it until sandbox identity is confirmed; Developer/QA should confirm environment separation. **NO-GO** remains for Stripe Tax registration, Connect payouts, and payment/refund E2E proof.


## 2026-11-12 11:15 ET — Growth Research listing identity audit

- **PASS (source inspection only):** `outfitters.html` reads active sandbox outfitter listings, escapes dynamic text via `textContent`, and builds directory links from `user_id`. `outfitter-experience.html` then filters `outfitter_listings` with `user_id=eq.<id>` and uses `data[0]` without a listing identifier or deterministic ordering.
- **FAIL (source-level listing identity defect):** If one outfitter owns multiple active experiences, all directory cards for that outfitter link to the **same user-level URL**, and the detail page selects the first matching listing. This can display the wrong title, price, photo, or booking context compared with the selected card. Do not mark this as browser-reproduced until a dedicated sandbox synthetic multi-listing fixture is tested. **P1**: migrate directory/detail/booking to a unique listing ID while preserving existing links or redirect behavior; coordinate with Designer/Developer because booking currently writes `outfitter_id` from the URL and may require a compatible schema change.
- **PASS (source-level safety):** No checkout, payment, production, or database changes made in this review. **NOT TESTED:** authenticated multi-listing fixture, browser navigation, Cloudflare deployment, all ten viewport widths, Stripe TEST checkout/refund/Connect payout reconciliation.
- **LAUNCH GATE:** Remains **NO-GO** pending independently verified end-to-end payment, refund, tax classification/registration, and Connect transfer/payout evidence. Previous observations about zero linked outfitters are superseded by later synthetic account records in this document.


## 2026-11-12 12:11 ET — Growth Research detail-to-booking identity trace
- **FAIL (source-level, confirmed in both files):** `outfitters.html` constructs every card URL from `outfitter_listings.user_id`, not a listing primary key. `outfitter-experience.html` requests all active listings for that `user_id` and renders `data[0]` with no deterministic order. Multiple active experiences belonging to one outfitter can therefore display the wrong details when a hunter selects a card. This is a conversion-integrity P1 and must not be marked browser-reproduced yet.
- **Additional downstream risk (source-level):** Booking request insertion writes `outfitter_booking_requests.outfitter_id` from the URL's user ID, with no selected experience identifier. Even if directory navigation is fixed in isolation, the requested experience may remain ambiguous for the outfitter and payment workflow. Avoid a partial URL-only fix.
- **Recommended coordinated remediation:** Developer/Hunter QA to verify the sandbox schema, introduce a stable listing ID in directory/detail/booking request, enforce authorization and referential integrity, preserve legacy `?id=<outfitter_uuid>` links with a deterministic chooser when multiple listings exist, and test two synthetic active experiences with different prices under one outfitter. Growth Research can retest discovery and all viewport widths after implementation. Do not access the currently unverified Supabase project until sandbox identity is established.
- **PASS:** GitHub source inspection of both routes. **NOT TESTED:** synthetic multi-listing browser reproduction, Cloudflare deployed behavior, ten-width matrix, authenticated booking or Stripe TEST card/refund/Connect reconciliation. No code, database, payments, main or production changes in this audit.
- **LAUNCH:** NO-GO until payment/tax/payout evidence and listing-to-booking identity are verified.


## 2026-11-12 13:27 ET — Growth Research booking identity safety

- **SOURCE FIX (staging):** `outfitter-experience.html` previously selected `data[0]` from all active experiences for a `user_id`, silently showing an arbitrary experience when one outfitter had multiple listings. Commit `8bd4e977c06f653a95be65d619eff9d58a758abd` now fails closed with a clear message when multiple rows are returned, preventing a wrong-experience booking request from that page. Single-listing behavior is unchanged. This is a **temporary safety mitigation**, not the full unique-listing-ID solution.
- **PASS:** GitHub source update committed to staging. **FAIL (underlying architecture):** Directory and request records still use outfitter `user_id` rather than unique experience ID. Developer must implement per-listing links and server-validated listing identity before restoring multi-listing booking.
- **NOT TESTED:** Cloudflare deployment, authenticated multi-listing browser reproduction, 320–2560 responsive matrix, Stripe TEST payment/webhook/refund/Connect reconciliation. No test cards, production accounts, or live site accessed this run.
- **NO-GO:** Stripe Tax correctness, verified Connect transfer/payout, and full payment/refund evidence remain unproven. Coordinate with Developer/Hunter QA on identity and checkout; Legal on tax.


## 2026-11-12 14:37 ET — Growth Research multi-listing directory safety
- **SOURCE FIX:** `35dfee7b2972b931005ec2de08e103aa0f9ff62e` detects duplicate active `user_id` entries in the directory response and disables navigation/booking CTA for ambiguous experiences. This complements detail-page fail-closed protection. Affected cards remain visible with `Booking temporarily unavailable` rather than routing to a potentially wrong trip.
- **PASS:** Staging GitHub commit accepted. **NOT TESTED:** browser fixture with two listings per outfitter, Cloudflare deployment, viewport matrix, Stripe TEST card/webhook/refund/Connect reconciliation. No database or payment operations performed.
- **REMAINING P1:** Developer must migrate to unique listing identifiers across discovery/detail/booking, including server validation and legacy link handling; this mitigation deliberately does not restore multi-experience booking. **LAUNCH NO-GO** pending payment/tax/payout and identity E2E evidence. No production/main changes.


## 2026-11-12 15:20 ET — Growth Research request gating
- **SOURCE FIX / PASS:** `outfitter-experience.html` now renders the request button disabled until exactly one active experience has been fetched and displayed. Invalid URLs, zero rows, multi-experience ambiguity, and request errors leave the action disabled. Staging code commit `bfbfbc2274851d95818f742c0d28732d2bdf1302`. This is defense in depth for the previously identified multi-listing P1; it does not solve unique listing identity. No payment, database, or production resources touched.
- **NOT TESTED:** Browser interaction and Cloudflare deployment, authenticated synthetic two-experience fixture, all ten viewport widths, and Stripe TEST payment/refund/webhook/Connect reconciliation. **NO-GO** remains until unique listing ID propagation, Stripe Tax, Connect payout, and E2E proof are verified. Developer/Hunter QA should implement unique listing IDs; Growth Research owns directory-to-detail regression.


## 2026-11-12 16:11 ET — Growth Research multi-experience conversion messaging
- **SOURCE FIX / PASS:** `outfitters.html` now explains why cards for outfitters with multiple experiences cannot currently be booked, instead of only displaying an unexplained disabled CTA. Code commit `a438862d2249c21eb71f7ede8270017a7c47d39f`. Scoped to directory presentation; no payment code touched.
- **P1 OPEN:** Unique experience IDs still need to flow through directory, detail, booking, and checkout. Directory duplicate detection examines only its capped 60-row response, so it is not a substitute for server-validated identity. Developer/Hunter QA should own coordinated identity fix and Stripe TEST reconciliation.
- **PASS:** GitHub staging source update. **NOT TESTED:** Cloudflare deployment, browser rendering, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, keyboard/touch/zoom, Stripe TEST charge/refund/webhook/Connect reconciliation. **NO-GO** remains for launch; no production/main changes.


## 2026-11-12 17:31 ET — Growth Research capped-directory transparency
- **PASS (source change):** `outfitters.html` now displays a clear notice when its 60-row query cap is reached, instead of implying the displayed experiences are the complete inventory. Staging code commit `02f338214b20a8b192aa048e0bf01f4f71c5bce6`. No payment or database changes.
- **OPEN P1:** Duplicate detection remains limited to the returned 60 records, so a listing outside the response could share an outfitter ID. The unique listing-ID fix must be implemented across directory, detail, booking, and checkout; this informational change is not a booking-integrity fix.
- **NOT TESTED:** Cloudflare deployment confirmation, rendered 60-result state, 320–2560 responsive matrix, keyboard/touch/zoom, Stripe TEST payment/refund/webhook/Connect reconciliation. Sandbox Supabase identity still needs independent confirmation before accessing data.
- **LAUNCH GATE:** **NO-GO** until tax/Connect payout and full payment/refund evidence are verified. No main/live/production changes.

## 2026-11-13 05:32 ET — Core hosted Checkout card matrix PASS

- **PASS — fresh browser execution:** [GitHub Actions run `43409486530`](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43409486530), payments job `131832049114`, completed with five implemented Stripe TEST card scenarios passing: success, generic decline, insufficient funds, completed 3DS and decline-then-successful retry.
- **PASS — success lifecycle covered by the test:** booking/Session/PaymentIntent/completion-event reconciliation, manual capture, receipt URL presence, guest cancellation and one succeeded full refund tied to the exact TEST charge and PaymentIntent.
- **PASS — failure recovery:** both decline cases retained zero received/capturable amount; retry succeeded in the same Session after the initial decline. Synthetic cleanup cancelled bookings, expired unpaid Sessions and released non-success authorizations.
- **PASS — 3DS timing reconciled:** Supabase logs showed the signed webhook returning HTTP 200 at the edge of the prior 30-second assertion; commit `2edde196cb64f565d4e92d75aae9ce890cb377af` preserves the state assertion while allowing 60 seconds for that verified webhook transition.
- **Evidence:** artifact `14028732476` contains scenario-level test-only identifiers. Card-entry evidence is retained without screenshots of populated Stripe card fields.
- **REMAINING NO-GO gates:** receipt email delivery, explicit 20% commission accounting, true Connect transfer/payout, partial refund, Stripe Tax registration/classification, promo/add-on/cleaning-deposit reconciliation, duplicate submission/concurrency, webhook replay/idempotency and outfitter-specific destination payout.

## 2026-11-13 — independently verified staging payment evidence

[Actions run 43451398532, attempt 2](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43451398532/attempts/2), commit `8325f8b143ed5ba51fe6a52a7a53fee20e380ec8`, payment job `131978218981`: **6 passed, 3 skipped, 0 failed**. Verified the log and [artifact 14053890593](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43451398532/artifacts/14053890593), including the JSON report and ZIP SHA-256 `a077c0cf0a6f8d2a13b26ab538dcf051f83a8b51f94706596e46abfc9df899f2`.

- PASS: successful manual capture and full refund, declined card, insufficient funds, 3DS, retry, and 20% Connect commission with destination transfer. The $200 outfitter test asserted a $40 application fee and transfer `tr_3UbMPZAO40Rp32aF3XNgrWEh`. The sandbox request `b2f0625a-96f8-44b2-ae30-765459f6ac53` reconciled to the artifact PaymentIntent and `cancelled/refunded`. All five landowner bookings reconciled to cancelled after test cleanup.
- BLOCKED — receipt email delivery: provide a dedicated team-controlled synthetic inbox and enable the sandbox receipt sender for it. Use a fresh captured TEST booking and match the actual delivered message to the payment and recipient. The runner checked a Stripe receipt URL. The three associated outbox rows are pending owner booking requests.
- BLOCKED — bank payout: verify the same linked synthetic connected account in Stripe TEST with connected-account access, an eligible test bank destination and an available balance from a fresh fixture. Record the payout ID, paid status and balance transaction, and match them to the account and funding. Supabase records charges and payouts enabled. The tested charge was already fully refunded.
- BLOCKED — partial refund: approve and implement a supported staging path and amount rule. Use a fresh captured TEST payment, verify the exact partial amount and retained balance in Stripe and Supabase, and verify applicable Connect transfer/application-fee reversals and idempotency. Deployed cancellation functions implement hold release and full-or-no-refund policies.

Staging QA commit `3cd6998098b8033906eec827ebfeaf25d8056313` restores runner-supplied fixture identities and gives each skip its own prerequisite. [Retest run 43454247616](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43454247616). **Launch remains NO-GO.**

### 2026-11-13 retest result

[Run 43454247616, attempt 1](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43454247616/attempts/1), payment job `131985017073`, commit `3cd6998098b8033906eec827ebfeaf25d8056313`: **5 passed, 1 failed, 3 skipped**. Both host and both hunter jobs succeeded. [Payment artifact 14052812608](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43454247616/artifacts/14052812608).

The 3DS case received HTTP 200 from Stripe confirmation, but the booking stayed `authorization_pending` for the 60-second assertion. Read-only sandbox reconciliation found booking `ae8240cf-891b-4d67-bc59-1968823151a5` cancelled by test cleanup, with no stored PaymentIntent or authorization timestamp. The preceding staging run `43453897743`, job `131982886090`, showed the same assertion failure. Compare the test Checkout Session, PaymentIntent and Stripe event delivery for the failed fixture to determine whether the challenge finished and the webhook transitioned the booking. **NO-GO.**
