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

## Verified rerun — 2026-11-13 15:57 ET

[Run 43505786846](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43505786846), payment job `132162975474`, commit `39236b175e492b5ac9b4277257fecd351d94479a`: **6 passed, 3 skipped, 0 failed**. Artifact `14075903372` has SHA-256 `897521acecd9567a1910039e0744bcf1d1dafbbc226f9c23975a6a9b438ad779`.

The official 3DS TEST card completed through the hosted browser using keyboard activation of Stripe's challenge. Checkout completed, the TEST intent reached `requires_capture`, 3DS result was `authenticated`, the matching completion event had zero pending deliveries, and the booking reached `pending_approval` before cleanup. Success, decline, insufficient funds, retry, capture, cancellation and full-refund checks also passed.

The Connect case charged 20,000 cents, applied a 4,000-cent platform fee, transferred to the linked TEST account, then fully refunded the charge, fully reversed the transfer and fully refunded the application fee. Supabase request `b79f5764-51d2-4023-90d2-1621992a6368` reconciled to `cancelled/refunded`.

Receipt inbox delivery, a paid external-bank payout and partial refund remain explicit skips. These are not passes.

Post-run cleanup restored the exact synthetic outfitter listing `SANDBOX TEST ONLY — Guided Outfitter Checkout` to `inactive` at 2026-11-13 16:02 ET so it is not public sandbox inventory. A future Connect run must explicitly activate that exact fixture for the test window and restore it afterward.

## Synthetic listing lifecycle regression fix — November 13, 2026 at 4:58 PM ET

- **Reproduced:** run `43511127313` passed the authenticated 3DS case but the Connect case failed before Checkout because the exact synthetic outfitter listing was correctly `inactive`.
- **Fixed:** commits `84aac3673b58954d83035dc80046e97461437328` and `ec64704fc70e19b85ced674e167bcb3919b9aae1` make the server-authorized fixture helper temporarily activate only the validated `SANDBOX TEST ONLY` listing, enter cleanup before fixture creation, and force the listing back to `inactive` even when setup or payment assertions fail. Supabase Edge `sandbox-outfitter-qa-fixture` v3 is active.
- **Verified:** workflow [43514846824](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43514846824), payment job `132194067461`, exact commit `ec64704fc70e19b85ced674e167bcb3919b9aae1`: **6 passed, 3 explicit skips, 0 failed**. Host Chromium/mobile WebKit were **25 passed, 3 skipped** each; hunter Chromium/mobile WebKit were **24 passed, 2 skipped** each.
- **Connect evidence:** request `54234812-1162-4a9f-9bbf-5d8439764e56`, TEST PaymentIntent `pi_3UbSTGAO40Rp32aF0IKdm0XI`, application fee `fee_1UbSTJAO408zPcFQvGn9mlaz`, transfer `tr_3UbSTGAO40Rp32aF0vcjVXwa`, charge `ch_3UbSTGAO40Rp32aF0mNfC1ux`, refund `re_3UbSTGAO40Rp32aF0saolpmL`.
- **3DS evidence:** booking `5a2ba231-4a13-4dee-8723-018012805268`, TEST PaymentIntent `pi_3UbSShAO40Rp32aF1OCXLzSd`, event `evt_1UbSSkAO40Rp32aFj0ZYr2Ia`; keyboard challenge completion, `authenticated`, `requires_capture`, zero pending webhook deliveries, booking `pending_approval` before cleanup.
- **Cleanup proof:** attached result reported `listing_status: inactive` and `unsettled_paid_fixtures: 0`; an independent sandbox database query confirmed the exact listing is `inactive` and zero accepted/paid synthetic Connect fixtures remain.
- **Artifact:** `14080940933`, SHA-256 `e6cb3d44723bf5395a304d160f6ad1b72279a9d36852a947b9dc6b9910d4e00c`.
- **Still BLOCKED / SKIPPED:** delivered receipt inbox, external-bank payout and partial refund. A hard runner termination can still bypass browser-level cleanup; the listing is fail-closed between completed runs, but a TTL/lease would be needed to eliminate that residual case.


## Duplicate-checkout protection and full rerun — November 13, 2026 at 10:01 PM ET

- **PASS — server idempotency:** migration `add_booking_checkout_request_idempotency` adds nullable UUID `bookings.checkout_request_key` plus a unique partial index. `sandbox-booking-checkout` v10 requires the key, forwards a stable Stripe TEST idempotency key, replays the existing open Session for the same key/payload, rejects mismatched reuse, and treats `authorization_pending` dates as unavailable.
- **PASS — browser retry behavior:** `booking.js` stores one logical request UUID per checkout payload in session storage, reuses it after an ambiguous retry, and clears it after an explicit failed response.
- **PASS — real sandbox evidence:** workflow [43549078806](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43549078806), exact commit `c1b16f9af832bf6aa401aab52e8fdbcf741eaf51`, payment job `132307104791`: **6 passed, 3 explicit skips, 0 failed**. Artifact `14095687333`, SHA-256 `f6d620cfdb3523903dd057de3ba135ee19b540808b54137c9b522cf12e7d63e2`.
- **PASS — duplicate submission:** request key `f009182a-69f0-4eda-a19a-11c79770b062` returned booking `6b57e3ce-8d71-4137-9f22-32c1faf1418e` on both same-key calls, reused the same Checkout Session, and a different key for the same dates returned HTTP 409. Independent sandbox SQL found exactly one booking row for each of the five card-scenario keys; all were `cancelled` after cleanup.
- **PASS — payment lifecycle regression:** success used TEST PaymentIntent `pi_3UbXBAAO40Rp32aF0yfTm8OK`, event `evt_1UbXBCAO40Rp32aFCvDeR3rn`, charge `ch_3UbXBAAO40Rp32aF0kGKnGUx`, and full refund `re_3UbXBAAO40Rp32aF0yizrfyb`. Decline, insufficient funds, completed keyboard 3DS, and decline/retry also passed.
- **PASS — Connect regression:** TEST PaymentIntent `pi_3UbXCVAO40Rp32aF3rdF0NJU`, application fee `fee_1UbXCYAO408zPcFQlGIlDBgX`, transfer `tr_3UbXCVAO40Rp32aF3Ha314A6`, charge `ch_3UbXCVAO40Rp32aF3LY3dNJe`, and refund `re_3UbXCVAO40Rp32aF35Qpup55`; cleanup reports the synthetic listing `inactive` and zero unsettled paid fixtures.
- **SKIPPED / OPEN:** delivered receipt inbox, external-bank payout, and partial refund. Stripe Tax registration/classification, promo/add-on/cleaning-deposit economics, and webhook replay remain separate gates.

All activity used sandbox Supabase and Stripe TEST only. No production deployment or live payment resource was touched.
