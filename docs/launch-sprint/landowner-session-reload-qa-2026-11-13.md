# Landowner session reload QA — 2026-11-13 18:38 ET

Scope: staging/leasewild-full-clone, Cloudflare sandbox only. Owner: Landowner QA (Bot B). Coordinate with Hunter/Payments for Stripe scenarios; no payment-code changes.

## Change

Commit `f8c4e4d651085154639df8331b0beb107641264e` adds a Playwright browser regression to `qa/playwright/tests/host.spec.mjs`. With verified synthetic `QA_LANDOWNER` credentials, the test signs in through the visible landowner form, verifies dashboard visibility and auth-card dismissal, reloads, then requires the authenticated dashboard to remain visible and the auth card hidden. It captures a post-reload screenshot. This addresses the unverified session persistence leg of the host journey, without creating data or touching production.

## Evidence and status

- Test source: **STATIC-ONLY** (committed, no new runner execution verified in this invocation).
- Authenticated sign-in: **REAL BROWSER PASS in prior run** [43518561227](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43518561227), but not evidence for reload persistence.
- Authenticated session reload: **NOT TESTED** until a fresh GitHub Actions browser run exercises the new case with verified sandbox-only credentials.
- Landowner map save/reload, cross-owner isolation, verification, completed-booking hunter review, reservations and messaging: **NOT TESTED** as authenticated E2E in this invocation.
- Payments: no fresh card tests submitted here. Previously verified 6 pass / 3 skip payment job [43514846824](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43514846824). Receipt delivery, bank payout, partial refund, tax and remaining payment economics stay open. Launch **NO-GO**.

## Next action

Confirm the new staging commit's Actions run actually executes the test, inspect job log and screenshot, then build authenticated map polygon/entry/parking save/reload and negative owner-isolation tests using isolated QA-only listing fixtures. Do not count a committed test as a browser pass. No main/live website, production Supabase, live Stripe or real customer data touched.
