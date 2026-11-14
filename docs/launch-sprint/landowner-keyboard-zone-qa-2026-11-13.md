# Landowner QA — keyboard zone-editor regression (2026-11-13 19:16 ET)

Scope: staging branch `staging/leasewild-full-clone`, Cloudflare sandbox only. Bot B owns landowner/host journeys; Hunter/Payments owns card entry. No shared payment files edited.

## Change

Commit `2962e036d05a8e62f4d4a3f3235d0076163b83cf` adds a Playwright test in `qa/playwright/tests/host.spec.mjs` that uses keyboard Enter to expand the coordinate form, keyboard typing to draft a three-point hunting boundary, and keyboard Enter to activate Add Point. It asserts that an unauthenticated visitor cannot save the draft and requests a screenshot. No production, payment, or persistent data changes.

## Verification and limits

- **STATIC-ONLY:** test source committed; this invocation did not execute a fresh GitHub-hosted graphical browser run, nor verify a Cloudflare deployment. This test is **NOT TESTED**, not PASS, until its job and screenshot are inspected.
- **PRIOR REAL BROWSER PASS (not rerun):** host authenticated landowner login in [run 43518561227](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43518561227); separate payment [run 43514846824](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43514846824) showed 6 pass, 3 skip, including 3DS and Connect TEST accounting.
- **NOT TESTED in this invocation:** authenticated polygon/entry/parking save/reload, owner/hunter isolation, property verification, completed-booking reviews, reservations, live messaging, responsive width matrix, receipt delivery, bank payout, partial refund and tax. Browser test harness execution needs a fresh Actions run with verified synthetic credentials and an isolated QA-only listing.
- **LAUNCH:** NO-GO. Receipt, payout, partial refund, tax and authenticated host journey gates remain open. Do not infer deployment success from a staging commit.

## Next

Inspect the staging workflow triggered by the test commit and its Chromium/WebKit artifacts. If it fails, reproduce and fix only on staging, then rerun. Coordinate with other bots before editing shared host/payment files. Never access main, leasewild.com, production Supabase, live Stripe or real customer data.
