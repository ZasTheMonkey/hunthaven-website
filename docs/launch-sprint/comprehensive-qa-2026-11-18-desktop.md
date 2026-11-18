# Comprehensive sandbox QA — November 18, 2026

Status: IN PROGRESS / NO-GO.

Scope: only https://leasewild-sandbox.pages.dev, staging/leasewild-full-clone, Supabase kbkdfpmlyggfijkyjxoi, Stripe TEST acct_1TOJ2rAO40Rp32aF. Initial staging head: 7c3da8224df90e82437e60874fdf1ce67f99cf74.

Coordination: desktop browser audit owns this new report only initially. Existing hunter, landowner, payment and designer reports read; shared code and fixtures are not claimed. Do not overwrite another bot's changes. Verify current head before writes. No production/main access or deployment authorized.

Fresh observation: sandbox home loads with TEST DATA ONLY banner and seven public cards in the in-app browser. No authenticated or payment PASS claimed. Fixture identity and current ownership verification pending before any database or application mutations. Credentials must never appear here.

Historical handoff: latest cited run 44269138868 reported payment mobile WebKit failure; this is not a fresh execution. Full browser evidence and case statuses will be appended after testing.

## Fresh execution and narrow code ownership

Desktop QA claims only the following reproducible corrections: index.html species category filtering/pressed state; sandbox-zone-editor.html normalization of the repeated closing point of a pointer-drawn polygon; about.html header collapse at 1280px. New isolated test files use desktop/discovery names. Other bot files and payment product code remain outside this claim.

- Environment verified: Supabase project kbkdfpmlyggfijkyjxoi is ACTIVE_HEALTHY, named leasewild-payment-testing. Cloudflare project 5883e691-f051-4037-ac4b-54d347f5bc54 is leasewild-sandbox and its configured branch is staging/leasewild-full-clone.
- Verified synthetic payment hunter bf7c510f-f2e1-45a6-923b-89fae1e7148d and owner 7546f675-03be-42a6-9294-aeaf27b9c558: confirmed emails, server-set leasewild-payment-browser fixture marker. Listing f66958e7-f235-4f13-9920-d21523dddcae has that owner_id/email, QA ONLY description, active status, $100 price, $0 cleaning fee and one-night minimum. No actual property boundaries are represented by pointer-test geometry.
- Verified synthetic outfitter df65f8f7-eb9a-40c6-a157-0bd86d78c8fa and admin 825ac35c-8e9b-4404-984b-634675ccb3be: confirmed emails and server-set leasewild-host-browser marker.
- Chromium baseline: 75 PASS, 6 SKIPPED, 3 FAIL (about horizontal overflow; homepage navigation timeouts during 768/1024 route loops). WebKit baseline: 78 PASS, 6 SKIPPED. Authenticated hunter/owner/outfitter/admin login checks executed; the outfitter messaging recovery test is a mocked browser harness, NOT real participant messaging.
- Species filter reproduced in browser: Deer exposed empty species and Dove-only records. Focused deployed regression failed before correction; candidate Chromium passed.
- Pointer map defect reproduced twice with actual closed mouse strokes: Save reported Area needs 3–100 unique, non-crossing corners. Candidate fix passed actual authenticated hunting, entry and parking area draw/save/reload/delete. Initial cleanup harness raced async refresh; three exact retained QA rows were independently identified and removed, then corrected cleanup passed. Independent final cleanup query required.
- Fresh TEST success booking 47e5863b-3987-48ba-8067-b1d39a1e12aa completed authorization, approval/capture, 72h full refund preview and cancellation. Fresh 3DS booking 98acf785-ee5b-4b58-8341-63f9fc6ef83b completed keyboard challenge and reached pending_approval without reconcile recovery. Both cancelled. Independent Stripe reconciliation pending.
- Five first-attempt checkout cases had independently verified fresh cs_test sessions on acct_1TOJ2rAO40Rp32aF, sandbox=true, exact synthetic customer/booking and total 10650 cents. Decline/retry locator and mobile card-input harness failures are not product PASS. Two cleanup calls used an expired session; fresh authenticated cleanup cancelled the exact two remaining requests. Fresh corrected cases in progress.
- Expanded 27-route, ten-width and axe accessibility audit in progress. Serious accessibility findings are launch blockers until addressed and retested.

Status remains NO-GO. No main/live domain, production Supabase or live Stripe operations performed. Local runner credentials remain outside Git and artifacts exclude traces/video containing authentication fields.

## Expanded corrections and latest evidence

- Coordinated scope expanded to canonical light-system CSS, two calculator labels, reset-password contrast, cancel error contrast and brand text contrast. No legal-policy text changed. Homepage cards now have separate native detail and save buttons, removing nested interactive controls.
- Expanded audit: all 27 top-level HTML routes rendered without document overflow at all ten requested widths (270 route-width checks). Initial axe 4.11 scan found serious/critical findings on 18 routes. Candidate corrections passed the 21 initially corrected routes, five additional targeted retests, and final landowner-protection retest. Full deployed rescan pending.
- Species candidate regression: 2 PASS across Chromium and mobile WebKit using native keyboard activation. Touch/pointer species filtering is a separate interaction case.
- TEST payment corrected rerun: decline booking 7fd18f1d-731f-43ef-9d11-9d8985b1ea3d PASS; decline-to-success retry c7f51d23-df3a-4660-8b87-2899d3e651a7 PASS; Windows mobile WebKit 97b542d2-d7e6-4afe-83d9-f91ade6bd948 PASS. Independent Stripe account-scoped reads confirm TEST only. This does not erase the historical Linux CI WebKit failure. New local harness found per-character card entry losing characters during Stripe input replacement; payments.spec.mjs receives the same atomic fill correction, keeping the exact card-value assertion.
- Success PaymentIntent pi_3Ud9n2AO40Rp32aF1uHDa2WS received 10650 cents and its charge ch_3Ud9n2AO40Rp32aF1uSd1pfz was fully refunded 10650. 3DS pi_3Ud9ofAO40Rp32aF1sAEpHrc has authenticated 3DS; authorization released. Retry pi_3Ud9z0AO40Rp32aF2qxxzjS2 and mobile pi_3Ud9zXAO40Rp32aF0VIhfwiu were released after pending_approval. First-attempt and corrected fixtures all cancelled.
- IMPORTANT OPEN FINANCIAL GAP: actual landowner PaymentIntent had application_fee_amount=null and transfer_data=null. A 20% fee/Connect transfer is NOT proved for the landowner flow. Placeholder 6.5% is included in total, not tax compliance approval.
- Fresh outfitter TEST request 7141f05b-a2ce-4f16-8eee-204b00f2b5fe completed $200 hosted card checkout, full-refund preview/cancellation and fixture cleanup to inactive with zero unsettled paid fixtures. Intent pi_3UdA9fAO40Rp32aF0tdvSRqP. Independent fee/transfer/refund reconciliation pending.
- Completed-booking review positive path BLOCKED: no eligible historical lease_payments row exists for verified payment owner 7546f675-03be-42a6-9294-aeaf27b9c558. Do not fabricate a paid record or label simulated payment as actual Stripe activity.
- Email delivery and second-landowner browser identity remain BLOCKED on controlled QA inbox and securely provisioned second login. User supplied Florida as a test location; that does not provide those prerequisites.
