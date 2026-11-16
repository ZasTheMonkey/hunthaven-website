# Hunter QA — mobile WebKit Stripe checkout triage (2026-11-16 00:23 ET)

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev only. This is a **CI-log and source inspection**, not a new browser test or confirmed application defect.

## Evidence
- GitHub Actions run: https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43770738144 (head SHA fea08470a859a61f69a3010b7269ae91ec217320).
- Payment job ID 132985854427: **7 passed, 1 failed, 3 skipped**. All four separate hunter/host browser jobs succeeded. The payment job explicitly executes both payments-chromium and payments-mobile-webkit despite its name.
- Failing scenario: payments-mobile-webkit hunter_journey, tests/payments.spec.mjs:472, 36.7 seconds; findCheckoutControl timed out after 25 seconds at line 204 waiting for a visible Stripe card input or Card button. The log recorded zero Stripe POST payment responses for that scenario. Artifact: https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43770738144/artifacts/14184307906 (error-context.md; not inspected in this pass).
- The same hunter_journey passed on Chromium; success, decline, insufficient funds, 3DS, retry and connected-account commission scenarios passed in Chromium. Receipt delivery, connected-account bank payout and partial refund were skipped.

## Source-level diagnostic observation
- stripeFrames(page) only examines frames whose origin is checkout.stripe.com, js.stripe.com or hooks.stripe.com.
- findCheckoutControl requires a visible input matching input[name=cardNumber] or input[autocomplete=cc-number], or a button with accessible name exactly Card.
- In the mobile journey the test waits for the verified Stripe Checkout URL, then immediately searches these controls. Thus the failure is compatible with an alternative mobile payment UI, an unrecognized frame origin, a delayed frame, or a genuine Stripe render failure. **None is established as the cause.** Do not weaken payment verification or change checkout logic without inspecting the actual failure snapshot/trace.

## Next safe execution
1. Download/open the 253,312-byte payment artifact, inspect error-context.md and any trace/screenshot, record the URL, visible page text, frame origins and controls. Avoid exposing tokens or customer details in shared logs.
2. If the Stripe card UI is present under a different accessible selector, update only the Playwright test locator and run the exact WebKit scenario plus Chromium regression. If Stripe did not render, investigate page errors/network and sandbox checkout configuration first.
3. Reconcile the synthetic Checkout Session, PaymentIntent, webhook and booking rows after any successful fresh payment; no success is inferred from a green UI assertion alone.
4. Bot A owns this diagnostic; coordinate any payment/backend changes with Developer and Connect/payout verification with Landowner QA.

## Run counters
New deployed browser routes: 0; new browser journeys: 0; new Stripe TEST payments: 0; application defects fixed: 0; deployments: 0. **Classification: API-ONLY + STATIC-ONLY.** Launch remains **NO-GO** pending WebKit checkout and other financial/privacy gates. No production/main/live access.

## 2026-11-16 01:00 ET — artifact opened; failure page confirmed

- **REAL CI BROWSER FAIL (historical run, artifact inspection this run):** Downloaded and opened artifact `14184307906` from run `43770738144`; `test-results/payments-hunter-journey-real-Stripe-TEST-card-entry-payments-mobile-webkit/error-context.md` contains the actual Playwright page snapshot. The hosted Stripe Checkout page displays heading **“Something went wrong”** and message **“You might be having a network connection problem, the link might be expired, or the payment provider cannot be reached at the moment.”** No card form or Card selector is present in that snapshot. The failing locator is therefore observing a Stripe-hosted error page, not merely missing a visible alternate card selector in this captured state.
- The artifact contains `error-context.md`, `results.json`, `junit.xml`, and HTML report files, but no standalone trace ZIP or screenshot. This snapshot alone cannot distinguish Stripe service/network rejection, session expiry, or WebKit environment limitations. No new payment was submitted during artifact inspection.
- **Priority:** On a fresh, verified TEST Session, instrument navigation response status, console/page errors, frame URLs (redacted), and request failures for emulated WebKit; compare with Chromium. If hosted Stripe returns the same error, do not relax selectors or declare a checkout fix. Reconcile session status/expiration via Stripe TEST API and test on physical Safari when possible. Coordinate checkout/backend changes with developer bot.
- **Run counters:** 0 fresh browser journeys, 0 new TEST payments, 0 application fixes, 0 deployments. Artifact investigation only; **NO-GO**.

## 2026-11-16 11:37 ET — independent current-code and retry check

- **STATIC-ONLY:** Re-read the staging `qa/playwright/tests/payments.spec.mjs` checkout helper (lines 167–235). `verifiedCheckout()` independently reads the Stripe TEST Checkout Session and requires `livemode === false`, `status === open`, `payment_status === unpaid`, a matching synthetic booking ID, sandbox metadata, and exact Checkout URL before browser card entry. Therefore the mobile failure is **after a pre-navigation Stripe TEST session verification**, but this does **not** establish that the session remains valid when the WebKit navigation completes.
- **REAL CI BROWSER FAIL (historical evidence, not a fresh execution):** Latest-attempt job query for run [43770738144](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43770738144) returned payment job `133162829535` failed, with all four separate hunter/host jobs successful. Earlier inspected failure artifact showed the Stripe-hosted “Something went wrong” page. Do not mistake the four successful jobs for proof of mobile Stripe card submission.
- **NEXT DIAGNOSTIC:** For a fresh synthetic WebKit checkout, record redacted main-frame navigation response status, `requestfailed` events, `pageerror`, console errors, frame origins, and Stripe TEST Session status/expiry immediately after the hosted error. Compare the same instrumentation against a fresh Chromium session; preserve test URLs only in private CI artifacts and redact tokens/session identifiers from logs. Do not change payment application behavior or relax card locators before classifying the hosted error.
- **THIS RUN:** 0 new deployed browser routes; 0 fresh graphical journeys; 0 new Stripe TEST card submissions; 0 application fixes; 0 deployments. Classification: STATIC-ONLY + CI metadata review. Receipt delivery, partial refunds, connected-bank payout, tax and authenticated privacy gates remain open. **NO-GO.**

## 2026-11-16 12:33 ET — diagnostic instrumentation staged, pending CI execution

- Commit `78b8893c5f1b90f024aa89b8ccdc9a2efc108485` changes **only** `qa/playwright/tests/payments.spec.mjs`, not checkout application behavior. On card-entry failure it attaches a JSON artifact containing browser project, error class, whether Stripe's hosted error heading is visible, frame **origins only**, request-failure origins/resource types, console-error origins, and a fresh read of Stripe TEST Session status, payment status and expiration. It deliberately excludes Checkout URLs, tokens, card data, response bodies and customer details.
- **STATIC-ONLY / NOT RETESTED:** GitHub accepted the staging commit. No CI run, new Stripe card payment, browser PASS, or sandbox deployment has been verified for this commit. The earlier WebKit browser failure remains open. Before treating this instrumentation as proven, run the payment job on the exact new staging head, inspect the redacted attachment, and compare fresh WebKit and Chromium results. Coordinate any checkout/backend repair with Developer and other QA owners.
- **Counters this execution:** 0 new browser routes; 0 browser flows; 0 TEST card submissions; 0 application fixes; 1 test-harness commit; 0 deployments. **Launch NO-GO.**
