# Landowner QA — 2026-11-13 15:27 EST checkpoint

**Scope:** GitHub `ZasTheMonkey/hunthaven-website`, branch `staging/leasewild-full-clone`, Cloudflare sandbox only. Bot B owns host/admin and map regression coverage; payment helper and Stripe TEST execution remain with Hunter/Payments to avoid conflicting edits.

## Change

- Commit `66e8234761a2246d8651cfb82b7826bb44d37e43` adds a browser regression for unsaved hunting-boundary protection when changing zone types: draft three coordinates, dismiss the discard confirmation, verify boundary and draft survive, then accept confirmation and verify clearing. The test is intentionally unauthenticated and never writes database records.
- **STATIC-ONLY / NOT TESTED:** GitHub source commit succeeded, but this invocation has no verified GitHub Actions job, screenshots, Cloudflare deployment or fresh browser result for the added case. Do not mark PASS until real Chromium and mobile WebKit run artifacts are inspected.

## Open launch gates

- **BLOCKED (browser execution in this invocation):** no directly available graphical browser session for authenticated sandbox journeys; GitHub Actions is configured to run on staging Playwright changes, but no new job result was independently confirmed.
- **NOT TESTED:** authenticated owner polygon/entry/parking save and reload, owner-to-owner and hunter role isolation, property verification, completed-booking hunter review, reservation and messaging lifecycle, owner email and admin private ID review.
- **FAIL (prior runs):** Stripe 3DS challenge stayed `requires_action` in runs `43453897743` and `43454247616`. Do not conflate this with a new failure or claim repair.
- **BLOCKED/NOT TESTED:** receipt delivery, paid connected-account bank payout, partial refund, Stripe Tax registrations/classification and broader add-on/promo/cleaning-deposit payment reconciliation.

## Run accounting

1 new browser test authored; 0 newly verified browser passes; 0 test cards submitted; 0 application defects repaired; 0 deployments independently verified. **NO-GO.** Never touch main, live `leasewild.com`, production Supabase, live Stripe or real accounts.
