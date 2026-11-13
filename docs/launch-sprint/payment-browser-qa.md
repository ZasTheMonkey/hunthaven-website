# LeaseWild payment browser QA

Scope is `staging/leasewild-full-clone`, `https://leasewild-sandbox.pages.dev`, Supabase project `kbkdfpmlyggfijkyjxoi`, Stripe TEST platform `acct_1TOJ2rAO40Rp32aF`. The suite uses the active manual-capture landowner booking API for setup and lifecycle checks and the real hosted Checkout UI for card entry. Each case creates a fresh booking. The retry case reuses only its own open session. Test credentials stay in runner secrets.

## Runner setup

Use two dedicated, confirmed sandbox Auth accounts with administrator-set app metadata `qa_fixture: leasewild-payment-browser`. The hunter requires the `guest` signup role. Set `QA_PAYMENT_HUNTER_EMAIL`, `QA_PAYMENT_HUNTER_ID`, `QA_PAYMENT_OWNER_EMAIL`, and `QA_PAYMENT_OWNER_ID` to the matching sandbox fixture values.

- Set `QA_PAYMENT_HUNTER_PASSWORD` and `QA_PAYMENT_OWNER_PASSWORD` as Actions secrets using the dedicated LeaseWild sandbox login passwords.
- Set `QA_STRIPE_TEST_READ_KEY` as an Actions secret using a restricted `rk_test_` key for the exact sandbox platform, with read access to the account, Checkout Sessions, PaymentIntents, charges, events and refunds.
- Set `QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY` as an Actions variable (or secret) using the sandbox project's `sb_publishable_` key.
- Set `QA_PAYMENT_LISTING_ID` as an Actions variable (or secret) once the new landowner has a dedicated active listing marked QA ONLY, priced at $100/night, with zero cleaning fee, a one-night minimum and the landowner's exact email. Listing `0a0b8819-ce6a-4cdb-a924-3b88dc899e1c` belongs to the previous owner and is explicitly rejected.

Run `bash qa/playwright/run-staging-qa.sh --project=payments-chromium` in Codespaces. GitHub Actions can run the same project as its payments matrix job when dispatched on staging. For unattended scheduling, an authorized runner must dispatch the staging ref and show a completed run with artifacts. GitHub's native schedule runs from the default branch.

## Evidence and handoff

- Hunter QA owns the five card cases, including the completed 3DS challenge and retry. Verify the exact sandbox return and join browser results to booking, Checkout Session, PaymentIntent and Stripe event IDs. The expected one-night total is 10,650 cents, including the configured 6.5% sandbox tax.
- Landowner QA owns approval, capture, release, cancellation and refund reconciliation. The success case checks one capture, a Stripe receipt URL and one full refund outside the 72-hour cutoff. The 3DS and retry cases release the hold. Decline cases verify no paid state and close their open Checkout Sessions. Review any recorded booking ID if cleanup fails.
- Receipt inbox delivery, partial refund, 20% commission and Connect transfer/payout remain blocked. The deployed landowner authorization/capture path lacks Connect destination and application fee fields. Test these against a dedicated connected synthetic fixture and reconcile the charge, fee, transfer and payout readiness separately. Existing account flags or historic transfers are insufficient evidence.
- The JSON/HTML report includes sanitized identifiers. For 3DS, the suite checks that the browser challenge closes, Stripe reports authenticated 3DS and a capturable TEST PaymentIntent, and the matched Checkout completion event has zero pending deliveries. It observes the booking in pending approval before cleanup with explicit recovery disabled. Confirm delivery to the sandbox webhook endpoint in Stripe using that event ID. A receipt URL establishes a Stripe receipt exists, while inbox delivery needs a controlled mailbox.

## Verified run — 2026-11-13 05:32 ET

- **PASS:** GitHub Actions run `43409486530` executed five real Stripe TEST card scenarios through hosted Checkout: success, generic decline, insufficient funds, completed 3DS and decline-then-successful retry. Payments job `131832049114` reports **5 passed, 4 skipped**.
- **PASS:** success reconciled Session, TEST PaymentIntent, booking state, completion event, capture, receipt URL, cancellation and one full refund tied to the exact charge and PaymentIntent.
- **PASS:** the 3DS completion webhook reached `sandbox-booking-webhook` with HTTP 200. The harness permits 60 seconds only for the verified authorization-state transition because the preceding run showed the signed webhook arriving at the edge of the former 30-second window.
- **Evidence artifact:** `14028732476`, containing scenario-level test-only identifiers. No populated card-field screenshot is captured.
- **OPEN:** receipt inbox delivery, explicit 20% commission, connected-account transfer/payout, partial refund, Stripe Tax classification/registration, promo/add-on/cleaning-deposit totals, duplicate submission and webhook replay/idempotency remain separate gates.
