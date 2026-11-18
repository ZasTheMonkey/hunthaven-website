# Hunter QA coverage audit — 2026-11-18 13:41 ET

Scope: `staging/leasewild-full-clone` source inspection only; no production access. This file is a separate Hunter QA handoff to avoid edits conflicting with other bots.

## Source findings (STATIC-ONLY, not new E2E passes)
- `qa/playwright/tests/hunter.spec.mjs` declares 12 public/guest routes and 10 viewport widths (320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560). This defines **120 route-width checks per browser project** when executed. They assert document overflow and script leakage, not pixel-perfect layout, touch gestures, zoom, or WCAG compliance. Do not describe 120 checks as executed by this inspection.
- The hunter suite's `real hosted Stripe TEST checkout` case is **unconditionally skipped**. The independently implemented payment suite in `qa/playwright/tests/payments.spec.mjs` provides separate browser checkout coverage. Do not combine the skipped hunter case with the payment suite as though a single complete signed-in hunter journey passed.
- Authenticated hunter login requires `QA_HUNTER_EMAIL` and `QA_HUNTER_PASSWORD`; when absent the test skips. A green job alone does not establish an authenticated hunter session.
- Guest ID invalid-token UI is covered, but this does not prove valid synthetic invitation upload, cross-account privacy denial, post-booking revocation, or deletion.
- The payment suite explicitly disables trace, screenshots and video to prevent leakage of Stripe Checkout URLs and card data. Keep that privacy control; collect only redacted diagnostics and provider TEST IDs.
- Last separately verified browser CI evidence: https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/44340521035 — eight payment passes (seven Chromium, one mobile WebKit), three explicit payment skips, six green jobs. This inspection did **not** rerun CI or reconcile fresh sandbox Stripe/Supabase records.

## Next Hunter QA execution, coordinated with host/booking owners
1. Verify latest staging commit and deployed sandbox build identity before new transactions; run fresh mobile WebKit checkout and Chromium regression using dedicated TEST fixtures, record matching booking/PaymentIntent/event IDs, and ensure cleanup.
2. Exercise two synthetic hunter accounts and a synthetic host in the actual deployed browser: booking status, realtime message arrival without refresh, cancellation and full refund, invalid/valid guest ID invitation, cross-account denial and revoked access. Mark each browser/DB/notification assertion separately.
3. Run all 10 widths plus keyboard and zoom. Inspect image cropping, overlays, focus visibility, touch targets and route-specific controls rather than treating overflow-only checks as visual QA.
4. Coordinate with Host QA on completed-booking reviews and hunting/entry/parking polygon access. Do not edit host-owned code or shared gate concurrently.
5. Keep delivered receipt, external bank payout, partial refund, tax registration/classification, promo/add-on/deposit accounting, authenticated privacy and attorney review as NO-GO until separately evidenced.

## This inspection counters
New manually controlled browser routes: **0**; fresh TEST card submissions: **0**; newly verified CI runs: **0**; app fixes: **0**; deployments: **0**. Classification: **STATIC-ONLY**. No production, main, live Stripe, or real customer data touched. Overall launch **NO-GO**.
