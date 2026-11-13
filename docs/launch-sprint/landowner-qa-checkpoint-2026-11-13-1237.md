# Landowner QA checkpoint — 2026-11-13 12:37 EST

**Scope:** GitHub `ZasTheMonkey/hunthaven-website`, branch `staging/leasewild-full-clone`, Cloudflare sandbox only. **Launch: NO-GO.**

## Change and rationale

- Added four browser-executed negative-case tests in `qa/playwright/tests/host.spec.mjs` for anonymous drafts of `entry`, `parking`, `entry_area`, and `parking_area`.
- Each test navigates to the real sandbox zone editor, chooses the type, expands keyboard-accessible coordinate inputs, enters one point for markers or three for areas, verifies the draft count, confirms Save remains disabled, checks that no saved zone appears, and captures a screenshot.
- Test-only change: [staging commit `50384f1b804257f037795279851f0d45471ae4ed`](https://github.com/ZasTheMonkey/hunthaven-website/commit/50384f1b804257f037795279851f0d45471ae4ed). No application, Stripe, database, or production changes.

## Evidence and limits

- **STATIC-ONLY PASS:** staging source review confirmed these controls/selectors exist and anonymous save-denial is a relevant negative case.
- **REAL BROWSER: NOT TESTED in this invocation.** This runtime's `curl -I https://leasewild-sandbox.pages.dev` failed with `Could not resolve host`. A staging push should trigger `leasewild-real-browser-qa.yml`, but a completed Actions run/artifact has **not** been verified here. Do not mark these four cases PASS until the host Chromium and mobile-WebKit jobs execute and provide evidence.
- **Prior evidence only:** run `43454247616` host suites reported 19 PASS/3 SKIP per browser. Payments 5 PASS/1 FAIL (3DS)/3 SKIP. Those are not fresh tests.
- **BLOCKED / NOT TESTED:** authenticated owner save/reload, cross-owner/hunter RLS, ownership verification, completed-booking hunter review, reservations/messaging, receipt delivery, bank payout, partial refund, tax, and fresh 3DS challenge completion.

## Coordination / next steps

Bot B owns the host spec and should inspect the staging workflow triggered by the test commit, verify the four new cases in both browsers, then build authenticated synthetic-fixture tests for map persistence, verification, reviews and messaging. Hunter/Payments and Developer own 3DS helper and payment fixes. Avoid conflicting changes to payment files. Never touch GitHub main, live leasewild.com, production Supabase, live Stripe, or real accounts.

**This invocation:** 4 new browser test definitions, 0 new browser-executed PASS, 0 new card payments, 0 verified application fixes, 0 deployments.