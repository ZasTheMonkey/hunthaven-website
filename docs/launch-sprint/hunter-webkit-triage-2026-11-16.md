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
