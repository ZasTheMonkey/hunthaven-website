# Remaining-gates execution — November 18, 2026

IN PROGRESS / NO-GO. User authorized completing the remaining sandbox gates.

Scope: staging/leasewild-full-clone only; https://leasewild-sandbox.pages.dev; Supabase kbkdfpmlyggfijkyjxoi; Stripe TEST acct_1TOJ2rAO40Rp32aF. Never main, live domain, production database or live Stripe.

Coordination claim: this run owns sandbox-booking-checkout, sandbox-booking-cancel and their new source snapshots in supabase/functions; isolated QA fixture provisioning; review-eligibility integration; narrow browser-runner corrections. Recheck branch and deployed versions before replacing any function. Existing payment/host reports remain intact.

Initial branch 037dba9a6c9a0429ccf3dd25050c3032a6ca70da; deployed checkout v11, cancel v6, approval v8, webhook v11. Confirmed sandbox project identity ACTIVE_HEALTHY. Existing CI 44328954618 still active; 44332539382 pending. Shared fixture mutations require checking concurrent jobs and exact ownership.

Findings: checkout lacks Connect/fee routing; cancellation lacks transfer/application-fee reversal. Positive hunter-review UI reads lease_payments, while active hosted authorization/capture writes bookings. No fabricated paid ledger rows will be used to close that integration gap.

## Follow-up evidence

Implemented and deployed sandbox checkout v12 and cancel v7. A $100 rent checkout captured $106.50: host net $80, commission $20, placeholder tax $6.50. Destination charge application fee is $26.50 (commission plus retained placeholder tax), not a $26.50 commission. Full cancellation reverses destination transfer and application fee. Actual TEST charge pi_3UdAlAAO40Rp32aF31cWfq4e fully refunded and reconciled.

Supported Auth Admin provisioning created synthetic second owner 0b22d015-ff3c-4ca6-89e7-28f5fc2cd9b8 and draft e2735636-3e7e-491b-89dd-baa96bdefc9a. Credentials remain outside Git. Cross-owner real browser/API checks PASS: read zero, patch/delete zero, insert 403, original zone retained, editor denied, exact zone cleaned.

Private synthetic PNG lifecycle PASS: owner uploaded, owner/admin could retrieve, unrelated owner/anonymous/public retrieval denied, unrelated approval denied, admin rejected, owner saw rejection after reload. Exact marked synthetic object and submission removed through narrow authenticated cleanup.

Completed-stay review PASS on actual captured TEST booking 8dfbb5b1-2f1f-4020-9a06-55b02c10c5a2, PI pi_3UdAp0AO40Rp32aF28AC79xe. Only after independent Stripe capture verification, this disposable booking's dates were shifted to Nov 15–16 to exercise completed-stay logic. No paid lease_payments rows fabricated. Owner submitted, duplicate 409, hunter/second-owner 403, pending hidden, unauthorized moderation 403, admin publish exposed only to hunter, hide removed hunter visibility. Review deleted after evidence. Two scoped migrations integrate eligibility and audited moderation, with a sandbox admin page.

Partial refund PASS on the same charge: $10 refund re_3UdAp0AO40Rp32aF2EgJLG83, retry same ID and $10 total refunded; different second amount 409; cross-owner 404. Final owner cancellation returned full_refund_issued; independent final Stripe reconciliation pending below.

Three focused Chrome browser tests PASS together, 23.3 seconds. Review/admin frontend was candidate-intercepted from local staging source against the real sandbox backend; deployed-page retest remains required. Evidence saved in desktop outputs/followup-browser-results.json and screenshots. Original broad audit remains separate.

Runner fixes pin Playwright 1.65.1 with lockfile, install only needed browser, serialize shared fixture jobs, and add macOS hosted-checkout WebKit coverage. This does not establish that the previously failing Ubuntu WebKit hosted Checkout is fixed. Fresh CI and sandbox deployment pending. Legacy pinned expired Stripe Session preflight removed; only fresh synthetic Sessions are used.

Still BLOCKED/NOT TESTED until explicit evidence: controlled QA inbox receipt (no isolated receiving domain/inbox found), actual external-bank TEST payout, signed webhook replay/delivery-failure recovery, physical Safari, exhaustive accessibility at every responsive width, every remaining guest-ID invite lifecycle. Placeholder tax requires qualified signoff before launch. Remains NO-GO; no launch or production changes authorized.
