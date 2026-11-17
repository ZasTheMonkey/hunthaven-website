# Hunter QA — Stripe mobile WebKit artifact diagnosis (2026-11-17 07:38 ET)

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev only. No production or live Stripe access.

## New evidence
- **REAL CI BROWSER FAIL (existing rerun, independently inspected artifact):** GitHub Actions run 43976797284, payment job 133869129400, artifact 14306490997, `test-results/payments-hunter-journey-real-Stripe-TEST-card-entry-payments-mobile-webkit/error-context.md`.
- The **actual Playwright page snapshot** on mobile WebKit shows a Stripe-hosted error state: heading **"Something went wrong"**, paragraph **"You might be having a network connection problem, the link might be expired, or the payment provider cannot be reached at the moment."**
- Therefore this is **not merely an unlocated card selector**. The test's 25-second selector timeout is a downstream symptom of an error page. The error message itself is not enough to determine whether Stripe service, runner network, session expiry, or another transient condition caused the failure.
- Chromium payment job: 7 passes (success, decline, insufficient funds, 3DS, retry, hunter journey, 20% Connect transfer), 3 explicit skips (receipt delivery, bank payout, partial refund). Mobile WebKit: 1 fail, no Stripe payment responses.
- Source `qa/playwright/tests/payments.spec.mjs` verifies fresh TEST session before browser navigation; the artifact does not establish that it remained valid at the failure moment. Avoid weakening Stripe origin/session verification.

## Targeted next steps
1. Add safe diagnostic logging for WebKit checkout page URL origin/path class (redact Checkout session IDs), heading/error text, page response status, failed requests with **redacted URLs**, and verified TEST session status at failure time. Do not log card numbers, keys, full checkout URLs, cookies, or tokens.
2. Check whether the same verified TEST session becomes expired/canceled during navigation, and correlate timestamps with Stripe TEST event records and sandbox booking status.
3. Re-run a **fresh** mobile WebKit TEST checkout through actual hosted UI, then Chromium regression. Only classify fixed after a successful browser payment and backend reconciliation.
4. Coordinate with Developer on checkout/CI diagnostics, Host QA on separate zone-drawing failures. Hunter QA owns this handoff; avoid simultaneous changes to shared test files.

## Execution classification and counters (this inspection)
- **ARTIFACT INSPECTION PASS:** ZIP downloaded via GitHub connector and extracted locally; failure snapshot inspected.
- **BROWSER ACCESS BLOCKED for new interactive session:** No new deployed-browser journey performed in this execution.
- New browser flows 0; new TEST payments 0; application fixes 0; deployments 0.
- No app code or payment logic changed; **launch NO-GO**.

## 2026-11-17 08:28 ET — staging diagnostic instrumentation
- **STAGING CODE CHANGE (NOT YET RETESTED):** commit `ff250088e46fbda70bb722a450f3885847b26625` adds a bounded failure-only diagnostic to `qa/playwright/tests/payments.spec.mjs` after Stripe card-control timeout. It records Stripe-frame origins, short visible headings/alerts and read-only TEST Checkout Session status; does not emit full URLs, session IDs, credentials or card numbers. No payment/business logic changed.
- **NOT TESTED:** No new workflow on this exact commit has been observed or triggered; the GitHub connector does not expose workflow dispatch. Prior rerun on older commit still fails mobile WebKit. Do not mark repaired or deployed.
- **NEXT:** Developer/CI owner should dispatch the staging Playwright payment workflow on `ff250088`, inspect `STRIPE_TEST_WEBKIT_SAFE_DIAGNOSTIC` and the browser artifact, correlate TEST session and booking state, then run a fresh mobile card submission plus Chromium regression. Host QA continues separate polygon-zone failures.
- **COUNTERS:** 0 new browser routes, 0 new TEST payments, 1 test-diagnostic code change, 0 verified deployments. Launch NO-GO.
