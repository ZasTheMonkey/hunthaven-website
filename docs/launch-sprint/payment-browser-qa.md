# LeaseWild payment browser QA

Scope is `staging/leasewild-full-clone`, `https://leasewild-sandbox.pages.dev`, Supabase project `kbkdfpmlyggfijkyjxoi`, Stripe TEST platform `acct_1TOJ2rAO40Rp32aF`. The suite uses the active manual-capture landowner booking API for setup and lifecycle checks and the real hosted Checkout UI for card entry. Each case creates a fresh booking. The retry case reuses only its own open session. Test credentials stay in runner secrets.

## Runner setup

Configure these names as Actions secrets or Codespaces secrets and use the documented synthetic Hunter and Owner A identities in [synthetic QA fixtures](synthetic-qa-fixtures.md).

- `QA_PAYMENT_HUNTER_PASSWORD` and `QA_PAYMENT_OWNER_PASSWORD` for the two verified synthetic accounts.
- `QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY` from the sandbox project.
- `QA_STRIPE_TEST_READ_KEY` for the exact sandbox platform, with read access to the account, Checkout Sessions, PaymentIntents, charges, events and refunds.
- `QA_PAYMENT_LISTING_ID` for a dedicated active Owner A fixture whose description begins with QA ONLY, priced at $100/night without cleaning fee, with a one-night minimum and Owner A’s controlled email address. Keep existing draft map and authorization fixtures isolated. Provision this fixture only once the environment can run the suite. The booking endpoint requires active status.

Run `bash qa/playwright/run-staging-qa.sh --project=payments-chromium` in Codespaces. GitHub Actions can run the same project as its payments matrix job when dispatched on staging. For unattended scheduling, an authorized runner must dispatch the staging ref and show a completed run with artifacts. GitHub's native schedule runs from the default branch.

## Evidence and handoff

- Hunter QA owns the five card cases, including the completed 3DS challenge and retry. Verify the exact sandbox return and join browser results to booking, Checkout Session, PaymentIntent and Stripe event IDs. The expected one-night total is 10,650 cents, including the configured 6.5% sandbox tax.
- Landowner QA owns approval, capture, release, cancellation and refund reconciliation. The success case checks one capture, a Stripe receipt URL and one full refund outside the 72-hour cutoff. The 3DS and retry cases release the hold. Decline cases verify no paid state and close their open Checkout Sessions. Review any recorded booking ID if cleanup fails.
- Receipt inbox delivery, partial refund, 20% commission and Connect transfer/payout remain blocked. The deployed landowner authorization/capture path lacks Connect destination and application fee fields. Test these against a dedicated connected synthetic fixture and reconcile the charge, fee, transfer and payout readiness separately. Existing account flags or historic transfers are insufficient evidence.
- The JSON/HTML report includes sanitized identifiers. Booking state advancing to pending approval is application-side webhook evidence, alongside the correlated Stripe event. The suite does not inspect Stripe's endpoint delivery log. A receipt URL establishes a Stripe receipt exists, while inbox delivery needs a controlled mailbox.
