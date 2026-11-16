# Hunter QA — WebKit payment retry, 2026-11-16 07:56 UTC

Scope: sandbox-only; source workflow run [43770738144](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43770738144), attempt 2, payment job [133162829535](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43770738144/job/133162829535). This is independent CI-log review, not an additional browser session launched by this report author.

## Actual retry evidence

- **REAL BROWSER PASS (CI Playwright Chromium):** 7 scenarios: success (Stripe payment_pages 200, confirm 200), generic decline (confirm 402), insufficient funds (confirm 402), completed 3DS (confirm 200), decline/retry (confirm 402 then 200), hunter journey (confirm 200), and 20% commission/connected-account transfer. Each executed against `https://leasewild-sandbox.pages.dev`.
- **REAL BROWSER FAIL (CI Playwright mobile WebKit):** `hunter_journey / real Stripe TEST card entry` at `tests/payments.spec.mjs:472`, timed out after 25 seconds locating Stripe card form or payment selector; scenario 38.3 seconds. `Stripe sandbox payment responses []` indicates no logged payment_pages/confirm responses in that scenario. Do not infer a Stripe PaymentIntent was created or that the checkout app caused the failure without network and TEST object reconciliation.
- **NOT TESTED (explicitly skipped):** delivered receipt email, external-bank payout readiness, partial refund.
- **Artifact:** [14206628093](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43770738144/artifacts/14206628093), ZIP SHA-256 `5c8134640de4ddcb155cf041775805d3793fdf6ba9ec148ac7d7ed11088d39a9`.
- Other four Hunter/Host jobs remained successful; these do not establish mobile hosted Stripe checkout success.

## Ownership and next steps

Hunter QA owns the WebKit payment failure. Before modifying app checkout, inspect retry artifact error-context and compare with first attempt; add scoped navigation, console, requestfailed, and Stripe hosted page status capture in the Playwright harness if absent. Confirm the fresh Checkout Session is TEST-mode, unexpired and accessible; compare Chromium and WebKit under the same network conditions. Retry with a new synthetic booking/session, then reconcile Stripe TEST and sandbox DB rows. Do not edit host/outfitter files without coordination. Tax registration/classification, receipt inbox, partial refund, payout and authenticated privacy gates remain open. Overall NO-GO.

This documentation-only run: 0 newly initiated browser journeys, 0 payments, 0 application fixes, 0 sandbox deployments. No production/main changes.
