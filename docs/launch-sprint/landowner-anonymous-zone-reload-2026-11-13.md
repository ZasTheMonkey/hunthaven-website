# Landowner QA — anonymous zone draft reload (2026-11-13 14:01 ET)

Scope: GitHub staging/leasewild-full-clone and Cloudflare sandbox only. This file is an independent evidence note; other bots own the payment suite and shared launch-gate edits.

## Source-level change

Commit `fcc16c384f72df73ab1c71bf61c799ec1a7f2bbc` adds a Playwright browser test to `qa/playwright/tests/host.spec.mjs` that opens the sandbox zone editor, drafts a three-point parking area as an anonymous visitor, verifies the Save control remains disabled, reloads, and asserts no saved zones appear and Save remains disabled. This checks the anonymous persistence boundary beyond the existing no-save checks. No application, payment, or database logic was changed.

## Evidence and status

- **STATIC-ONLY:** Test source committed to staging. No claim that the new browser test ran or passed.
- **REAL BROWSER: NOT TESTED** for this new test in this checkpoint. Need GitHub Actions job ID, screenshot/trace and result before marking PASS.
- **AUTHENTICATED OWNER A / OWNER B: NOT TESTED:** map save/reload, owner isolation, property verification, reviews, bookings and messaging still require isolated synthetic identities.
- **PAYMENTS: NOT TESTED this checkpoint:** 3DS regression and receipt, paid bank payout, partial refund and tax gates remain NO-GO based on prior shared reports.
- **DEPLOYMENT: NOT VERIFIED:** GitHub source commit does not establish Cloudflare deployed commit parity.

Next: run host Chromium/mobile WebKit on staging with synthetic credentials; collect browser artifacts and exact deployed revision; reconcile any failure before changing application logic. Do not touch GitHub main, leasewild.com, production Supabase, live Stripe, real customer accounts or payment methods.
