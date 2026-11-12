# Hunter E2E QA — 2026-11-12 00:56 ET (sandbox only)

## Evidence and execution classification
- **BROWSER ACCESS BLOCKED:** No graphical browser/computer interaction tool was exposed in this automation run. A web fetch of https://leasewild-sandbox.pages.dev/ returned an internal access error; this is not evidence that the site itself is down.
- **STATIC-ONLY PASS:** Fetched and read the staging Stripe launch gate (`docs/launch-sprint/stripe-launch-gate-2026-11-11.md`) and existing Hunter QA handoff (`docs/launch-sprint/hunter-qa.md`) through GitHub's branch-specific file API.
- **NOT TESTED:** Real-browser navigation, signup/login, hunter search, listing details, date/guest/minor constraints, checkout, Stripe success/decline/3DS/retry, double submission, refund, receipts, messaging, guest IDs, notifications, responsive widths, zoom, keyboard/touch, cross-role privacy and DB reconciliation. No synthetic accounts or cards were used in this run.
- **NOT TESTED:** Cloudflare deployment parity; a browser could not be opened.
- **No new code fixes or migrations:** Avoided asserting a reproducible browser defect without evidence.

## Scope counters (this run)
- Routes browser-tested: **0**.
- Browser E2E flows tested: **0**.
- Browser failures reproduced: **0**.
- Fixes committed: **0**.
- Browser E2E flows blocked by unavailable graphical browser: **all requested flows**.
- Stripe TEST payments/refunds created: **0**.

## Launch blocker register
1. **P0 / BROWSER ACCESS BLOCKED:** Provision a real graphical browser/Computer Use runtime for the hourly QA automation, with sandbox-only synthetic authentication and test inboxes. Do not equate code inspection or API calls with E2E PASS.
2. **P0 / NOT TESTED:** Actual Stripe TEST hosted checkout and reconciliation to sandbox booking, webhook, and refund rows; 3DS, decline, retry, concurrent conflicts, payout.
3. **P0 / REVIEW:** Existing launch gate describes incomplete Stripe Tax configuration and unverified tax treatment. Do not represent flat 6.5% as approved tax.
4. **P0 / REVIEW:** Launch gate contains both earlier zero-linked-outfitter finding and later one-linked-test-outfitter update; the earlier count is stale. Neither establishes completed payout E2E.
5. **P1 / NOT TESTED:** Hunter/host messaging lifecycle, cancellation and guest private-ID access, mobile and accessibility.

## Coordination and ownership
This file is owned by Hunter QA (Bot A). Bot B should own host/admin and Connect/payout test journeys, record evidence in its own report, and avoid editing this file. Developer owns checkout and webhook fixes; Hunter QA retests visible hunter outcomes after deployment. No GitHub main, live leasewild.com, production Supabase, or live Stripe accessed.

## Next executable step
In a graphical sandbox browser, navigate home → search → listing → synthetic login → select dates/guests → official Stripe TEST card hosted checkout → return to hunter reservations; capture timestamped screenshots and test-only session/intent IDs, then corroborate sandbox booking/webhook rows. Repeat decline, 3DS, cancellation/refund and two-account messaging. Do not declare PASS before executing.


## 2026-11-12 03:15 ET — Hunter QA static regression and repair
- **STATIC-ONLY FAIL reproduced:** `booking.js` native-date fallback contained `if(cinEl.value) const next=...`, which is invalid JavaScript grammar (a lexical declaration cannot be the single statement of an if without braces). This causes the entire booking script to fail parsing where loaded, not merely the fallback branch. This is a source-level defect, not browser reproduction.
- **FIX COMMITTED:** `0b07cd2cac7c9237898589c3b90c1f3906471d64` on `staging/leasewild-full-clone`: return early on missing check-in and safely scope the `next` date variable before setting checkout minimum. No payment/backend logic modified.
- **STATIC-ONLY PASS:** Independently re-fetched updated `booking.js` from staging (blob `6d7e1c5697eaf8d62b9dc72e10cbd629110e6141`) and parsed complete JavaScript with `new Function(source)` successfully. This does **not** prove runtime date-picker behavior.
- **BROWSER ACCESS BLOCKED:** No graphical browser/computer-control tool available in this run; no actual navigation, Stripe TEST card, screenshot, Cloudflare deployment parity, or authenticated booking/notification/reconciliation verification. Need Work/computer environment or executable GitHub Actions browser harness with recorded run URL.
- **Counters this run:** browser routes **0**; real-browser flows **0**; browser failures **0**; static defects **1**; code fixes **1**; real-browser retests **0**; test card transactions **0**; critical payment flows still **NOT TESTED**.
- **Coordination:** Hunter QA owns `booking.js` syntax fix and this report. Developer/other QA roles should avoid conflicting booking.js edits until incorporating this commit; independently confirm Cloudflare sandbox deployment and real-browser checkout. Stripe Tax, Connect payout, tax/20% reconciliation, refunds, guest IDs, email delivery remain launch blockers. **NO-GO**. No main/live/production access.


## 2026-11-12 04:30 ET — workflow execution evidence audit
- **API-ONLY PASS (GitHub query):** Queried GitHub Actions workflow runs scoped to `staging/leasewild-full-clone` via `GET /repos/ZasTheMonkey/hunthaven-website/actions/runs?branch=staging%2Fleasewild-full-clone&per_page=10`. Response: `total_count: 0`, `workflow_runs: []`. Thus there is **no GitHub Actions run evidence for this branch** at this check. This does not establish that no tests ever ran elsewhere or manually.
- **STATIC-ONLY PASS:** Re-read staging Stripe launch gate, this report, and `booking.js`; prior booking script fix remains present. No fresh browser assertion or payment verification is supported.
- **BROWSER ACCESS BLOCKED:** No graphical browser/computer-control tool available in this execution environment. Cannot execute the owner's required human-like checkout/3DS/refund or viewport matrix; do not label API or static checks E2E.
- **NOT TESTED:** Stripe TEST success/decline/insufficient funds/3DS, webhook and booking reconciliation, tax, 20% commission, payout, cancellations/refunds, messaging, emails, ID privacy, responsive and accessibility behavior.
- **Counters:** browser routes 0; real-browser flows 0; new browser failures 0; application fixes 0; Stripe TEST payments 0; branch workflow runs found 0.
- **Actionable blocker:** Run the browser harness in a graphical Work/computer environment or explicitly dispatch a staging workflow (`workflow_dispatch`) with synthetic sandbox-only credentials, then record the exact run URL and screenshots. A scheduled workflow defined only on a nondefault branch should not be assumed to run hourly. No production/main/live resources touched. **NO-GO.**

## 2026-11-12 05:21 ET — browser environment and sandbox network diagnostic
- **LOCAL TOOL CHECK:** Chromium executable is installed at `/usr/bin/chromium` and Playwright executable at `/opt/pyvenv/bin/playwright`. Therefore a browser binary exists; prior shorthand “no graphical browser” is imprecise. This does **not** establish an accessible deployed browser session.
- **BROWSER/NETWORK ACCESS BLOCKED:** Direct HTTP probe `curl -I -L --max-time 12 https://leasewild-sandbox.pages.dev` failed with `curl: (6) Could not resolve host: leasewild-sandbox.pages.dev`. The web fetch tool separately returned an internal access error. Neither is proof the Cloudflare site is down. A browser launched in this network-restricted container cannot navigate the deployed sandbox until DNS/egress is enabled.
- **STATIC-ONLY PASS:** Independently fetched this staging report and the Stripe launch gate via GitHub connector. Attempt to retrieve `.github/workflows/hunter-e2e.yml` on staging returned 404; this specific workflow filename does not exist, but other workflow names have not been enumerated, so do not infer no harness exists.
- **NOT TESTED:** Actual deployed-page navigation, authenticated synthetic user journeys, Stripe TEST cards, receipts, webhook/DB reconciliation, refunds, messaging, emails, privacy, mobile viewports and Cloudflare parity. No payment, booking, refund or fixture created. No application code changed.
- **Counters this run:** real-browser routes 0; E2E flows 0; browser failures 0; application fixes 0; Stripe TEST transactions 0; deployment verifications 0. **NO-GO**.
- **Next action:** Run Chromium/Playwright in a network-enabled Work/cloud computer or GitHub Actions runner explicitly dispatched against staging; provide sandbox-only synthetic credentials/test inbox and verify the exact Actions run URL and screenshots. Keep live/main/production untouched.

## 2026-11-12 05:45 ET — repeated deployed-browser connectivity check
- **BROWSER ACCESS BLOCKED (fresh local evidence):** Chromium `/usr/bin/chromium` and Python Playwright are installed, but `getent hosts leasewild-sandbox.pages.dev` returned no address and `curl -I -L --max-time 8 https://leasewild-sandbox.pages.dev` failed with `curl: (6) Could not resolve host`. This is a DNS/egress restriction of the test environment, **not** proof of Cloudflare downtime. Real deployed-page navigation and hosted Stripe checkout cannot be claimed from this environment.
- **API-ONLY PASS:** Re-fetched this report, `docs/launch-sprint/stripe-launch-gate-2026-11-11.md`, and `booking.js` from the explicit staging ref through the GitHub connector. Prior launch gate includes a later *one linked synthetic outfitter* update; avoid repeating the outdated zero-linked count as current fact. No new Stripe/DB state was queried.
- **COUNTERS:** deployed browser routes 0; real-browser flows 0; browser FAIL 0; application fixes 0; Stripe TEST payments 0; verified deployments 0. Payment, refund, messaging, ID privacy, responsive widths, and accessibility remain **NOT TESTED** in this run.
- **NEXT:** Network-enabled Work cloud computer or sandbox-only GitHub Actions runner must resolve Cloudflare and execute Playwright against real deployed pages; collect run URL, screenshots, test-mode Stripe IDs, and database reconciliation before any E2E PASS. Maintain **NO-GO**. No main/live/production access.


## 2026-11-12 07:30 ET — workflow discovered; execution gate still open
- **API-ONLY PASS:** Enumerated `.github/workflows` on the explicit staging branch and found `.github/workflows/leasewild-real-browser-qa.yml` (blob `a2235683aa47b3b00166f0232bcb6d6b1c1300e9`). The earlier 404 for `hunter-e2e.yml` was a filename mismatch, **not** evidence that no browser workflow exists.
- **STATIC-ONLY PASS:** Read the actual workflow: 5 Playwright matrix jobs (hunter Chromium, hunter mobile WebKit, host Chromium, host mobile WebKit, payments Chromium), `workflow_dispatch`, and hourly cron `17 * * * *`; artifact upload for screenshots/video/traces. The workflow job condition requires `github.ref == 'refs/heads/staging/leasewild-full-clone'`.
- **API-ONLY FAIL (execution evidence):** Fresh GitHub Actions GET `/actions/runs?branch=staging%2Fleasewild-full-clone&per_page=10` returned `total_count=0`, `workflow_runs=[]`. A cron schedule on a nondefault branch is not sufficient to execute hourly, and a dispatch run is not evidenced. The workflow's `workflow_dispatch` can be initiated only if GitHub recognizes it on the default branch; do not change main under project restrictions. A permitted staging-only runner or network-enabled Work browser is needed.
- **BROWSER ACCESS BLOCKED:** No graphical computer-control session with deployed-sandbox network access is exposed in this run. Do not claim the five jobs ran or that hosted Stripe TEST checkout completed.
- **COUNTERS:** real-browser routes 0; real-browser E2E flows 0; Stripe TEST payments 0; application fixes 0; deployed-browser retests 0; Actions runs found 0. Payment, booking lifecycle, refunds, emails, messaging, RLS, viewport matrix remain NOT TESTED. **NO-GO.**
- **Coordination:** Hunter QA owns this report and hunter test evidence; host/payments matrix belongs to other QA roles. No main/live/production access.


## 2026-11-12 07:50 ET — 8 AM readiness evidence / browser harness coverage audit
- **API-ONLY PASS:** Re-fetched the staging launch gate, workflow and Hunter QA report; queried GitHub Actions runs for the staging branch. GitHub API returned `total_count: 0` and `workflow_runs: []`. No actual GitHub run URL, screenshots, or payment execution evidence exists from this branch query.
- **STATIC-ONLY finding / P0 test coverage gap:** `qa/playwright/tests/hunter.spec.mjs` explicitly skips its “real hosted Stripe TEST checkout” test. `qa/playwright/tests/payments.spec.mjs` only starts from externally pre-created `QA_STRIPE_TEST_CHECKOUTS_JSON` URLs, not from the LeaseWild booking UI; it does not independently create bookings, validate webhook/database rows, or verify receipts. Its refund, cancellation, duplicate-payment, tax, promo, add-on, deposit and payout tests are unconditional skips. Thus even a green suite would **not** prove the required hunter-to-Stripe-to-booking E2E or financial launch gate.
- **STATIC-ONLY workflow review:** `.github/workflows/leasewild-real-browser-qa.yml` has five Playwright matrix entries and an hourly cron, but the workflow is on staging and its job condition requires staging; cron alone cannot demonstrate hourly execution. No dispatch-capable write action is exposed by the current GitHub connector. Do not touch main to enable cron.
- **BROWSER ACCESS BLOCKED:** This automation environment has no usable deployed-sandbox graphical browser session; prior direct DNS probes failed. No actual UI navigation or payment can be claimed. Need a network-enabled Work computer or staging-only CI runner with sandbox synthetic identities and fresh test-only Checkout sessions, and a run URL with artifacts.
- **Counts this run:** browser-tested routes **0**; real-browser flows **0**; real-browser FAIL **0**; application fixes **0**; Stripe TEST payments **0**; verified deployments **0**; staging Actions runs found **0**. Test harness coverage gap identified **1 P0**; no new application defect proven.
- **Launch decision: NO-GO.** Required evidence: browser-started successful/declined/3DS checkout, return-page booking state, signed webhook and Supabase reconciliation, cancellation/refund, 20% fee/6.5% provisional tax breakdown, true Stripe Connect transfer/payout, synthetic emails, ID privacy and mobile regression. Prior launch gate says one linked synthetic outfitter and historical platform-only charges, **not** a verified Connect payout. Stripe Tax registration/classification remains unresolved. Keep production/main/live untouched.
- **Coordination:** Bot A owns hunter UI and this report; Bot B/landowner QA owns host approval and Connect reconciliation; developer owns backend checkout/webhook corrections. Avoid concurrent edits to payment source without coordinating in `docs/launch-sprint/`.

## 2026-11-12 09:14 ET — sandbox Connect payout evidence check
- **API-ONLY PASS:** Selected Stripe account `acct_1TOJ2rAO40Rp32aF` with `livemode=false`; did not access the available live account. The sandbox contains one connected account `acct_1TOJMRAO408zPcFQ` with `payouts_enabled=true`.
- **API-ONLY PASS (historic transfer records):** `GET /v1/transfers` returns four TEST transfers to that connected account: three for $109.70 and one for $25.00. These are not fresh browser checkout or payout evidence.
- **API-ONLY result:** `GET /v1/payouts` on the *platform* account returns zero payouts. This endpoint does **not** establish the connected account's own bank-payout history; the connected account must be queried in its own context.
- **BROWSER ACCESS BLOCKED:** No authenticated graphical computer session exposed in this run. No fresh official TEST card entry, synthetic checkout, 3DS, cancellation/refund, message, email, responsive screenshot or actual browser journey executed. No Stripe mutations, real money, or production resources used.
- **COUNTERS:** browser-tested routes 0; real-browser E2E flows 0; fresh card payments 0; newly reproduced browser failures 0; application fixes 0; fresh verified deployments 0. Existing unverified payment/Connect/tax/UX gates remain **NO-GO**.
- **NEXT:** Network-enabled Work computer or staging-only runner should execute the actual hunter UI Checkout and confirm Stripe PaymentIntent + connected transfer + connected bank payout + booking/webhook state. Host QA owns connected-account payout reconciliation; Hunter QA owns browser-visible hunter checkout/booking. Avoid double-charging existing synthetic bookings.


## 2026-11-12 09:44 ET — fresh deployed-browser network probe
- **BROWSER ACCESS BLOCKED (new direct probe):** `getent hosts leasewild-sandbox.pages.dev` returned no DNS address; `curl -I -L --max-time 7 https://leasewild-sandbox.pages.dev` failed with `curl: (6) Could not resolve host`. Chromium exists at `/usr/bin/chromium`, but it cannot navigate the actual deployed sandbox in this network-restricted runtime. This is not evidence that the site itself is down.
- **API-ONLY PASS:** Re-fetched staging-specific launch gate and Hunter QA report via GitHub connector. Existing report documents one linked synthetic outfitter and historic TEST Stripe transfers, but no fresh end-to-end payout proof. No provider state was freshly queried this run.
- **NOT TESTED:** Real-browser hunter navigation, Stripe official TEST card submission (success/decline/3DS), booking/webhook reconciliation, cancellation/refund, messaging, email, privacy, responsive matrix, payout and tax. No synthetic booking/payment/refund initiated.
- **COUNTERS THIS RUN:** browser routes 0; real-browser flows 0; reproduced browser defects 0; application fixes 0; TEST charges 0; deployment verifications 0. **NO-GO**. Next step is network-enabled Work computer or staging-only CI runner with synthetic credentials and screenshot/trace artifacts. Do not touch main/live/production.


## 2026-11-12 10:48 ET — fresh Hunter QA connectivity and launch-gate audit
- **BROWSER ACCESS BLOCKED (fresh local reproduction):** `getent hosts leasewild-sandbox.pages.dev` returned no DNS result; `curl -I -L --max-time 8 https://leasewild-sandbox.pages.dev` failed with `curl: (6) Could not resolve host`. Chromium `/usr/bin/chromium` and Playwright `/opt/pyvenv/bin/playwright` are installed, but deployed sandbox navigation cannot execute from this runtime without DNS/egress. This does **not** establish Cloudflare downtime.
- **API-ONLY PASS:** Re-fetched this Hunter report and `docs/launch-sprint/stripe-launch-gate-2026-11-11.md` from the exact staging branch via GitHub. Historic launch gate records a paid **platform-only** outfitter charge, not Connect payout proof; linked synthetic account status is distinct from actual transfer/bank payout.
- **NOT TESTED this run:** Actual browser hunter routes, Stripe test card success/decline/insufficient funds/3DS, hosted checkout, reservations, cancellations/refunds, webhooks, tax/commission reconciliation, emails, messaging, guest ID privacy, ten viewport widths, deployment parity. No Stripe or Supabase access attempted and no synthetic fixture created.
- **COUNTERS:** deployed browser routes **0**, browser E2E flows **0**, reproduced application failures **0**, application fixes **0**, Stripe TEST payments **0**, verified deployments **0**. This run has no basis for claiming a payment or UI PASS.
- **ACTION:** Execute the existing staging Playwright harness from a network-enabled graphical Work/computer session or an explicitly triggered staging-only CI runner; obtain run URL, screenshots and Stripe TEST + sandbox DB reconciliation. The existing harness's skipped checkout/refund coverage must be replaced with genuine booking-UI flows before launch signoff. Keep NO-GO and never touch main/live/production.
