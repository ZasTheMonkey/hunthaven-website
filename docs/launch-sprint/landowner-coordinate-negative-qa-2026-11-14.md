# Landowner QA — coordinate negative-case handoff (2026-11-14 05:08 EST)

Scope: `staging/leasewild-full-clone` and `leasewild-sandbox.pages.dev` only. No main, live site, production Supabase, live Stripe or real identities.

## Work completed
- Added `qa/playwright/tests/landowner-coordinate-negative.spec.mjs` at commit `ed2509729ac6d58dfb53590157cee9485fc5288e`.
- Five isolated UI scenarios: missing longitude, latitude >90, latitude <-90, longitude >180, longitude <-180. They assert visible error, unchanged draft count, disabled anonymous save and attach a screenshot when executed.
- Static source inspection confirms `add(p)` calls `valid(p)`, which checks coordinate ranges; incomplete fields are rejected by the Add coordinate click handler.
- These checks are **NOT TESTED** in a fresh real browser; code committed is not a passing E2E result. No Cloudflare deployment was independently verified.

## Coverage and coordination
- Bot B owns landowner zone editor and host/admin security; Bot A owns hunter checkout and Stripe TEST browser payment. This file is isolated to avoid conflicting edits.
- This negative-case suite does not test authenticated save/reload, polygon self-intersection rejection, RLS, cross-owner denial, property verification, reviews, messaging, or payments.
- Authenticated boundary, entry-area and parking-area save/reload suites still need a verified disposable owner listing and synthetic credentials. A second synthetic owner is required for cross-owner denial.
- Stripe gate remains **NO-GO**: browser payment/receipt, refund and Connect payout reconciliation, tax classification/registrations and role isolation need current proof. Historical zero-linked-outfitter observation is superseded by later sandbox evidence of one linked synthetic test account; no current count asserted.

## Run accounting
- New test files: 1; new test cases: 5; staging commits: 1 test commit plus this handoff.
- Real browser routes: 0; browser PASS: 0; browser FAIL: 0; browser access: BLOCKED in this environment.
- Application fixes: 0; new TEST card payments: 0; verified Cloudflare deployments: 0.
- Next: execute host Chromium/WebKit tests against deployed sandbox and attach run ID, screenshots, trace, plus synthetic fixture provenance. Do not mark PASS before execution.
