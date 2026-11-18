# Comprehensive sandbox QA — November 18, 2026

Status: NO-GO — audit checkpoint completed November 18, 2026, 10:09 AM ET. Requested scope is not fully proven; blocked and untested cases remain explicit below.

## Final checkpoint (supersedes interim snapshots below)

- **PASS:** final deployed expansion: **56 passed, 0 failed, 0 skipped**, Chromium plus Windows mobile WebKit, 2026-11-18T15:06:30Z, 147.5 seconds. Twenty-seven HTML routes per engine each passed ten document-overflow widths: 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560 (**540 route-width assertions**). Axe 4.11 serious/critical checks ran after transitions finished at each route's final 2560px viewport. This is NOT accessibility certification at every width, screen-reader, native zoom or physical-device evidence. Signed-out listing creation coverage is the explicit redirect gate only.
- **PASS:** species-filter semantics and matching desktop/mobile map pin counts in both engines. Native detail buttons remove nested controls. About navigation and palette/label fixes deployed.
- **PASS:** final deployed authenticated real pointer hunting/entry/parking draw, save, reload and delete: 1 browser scenario, 23.5 seconds. Independent final SQL confirmed zero retained run zones. Earlier cleanup failures are retained below; they are not silently relabeled.
- **PASS:** actual hunter-owner message/reply/reload and nonparticipant read/insert denial (zero rows/403). Six exact run messages removed; empty run-created conversation removed. Real hunter-outfitter messaging and all unread/draft/retention permutations remain NOT TESTED.
- **PASS:** success/capture/full refund; decline; completed 3DS; decline/retry; Windows mobile WebKit checkout. All eight land-booking attempts are cancelled. Independent Stripe reads confirm TEST only; successful charge received/refunded 10650 cents. Outfitter $200 charge reconciles $40 fee, transfer, full refund, full transfer reversal and full $40 application-fee refund. Outfitter fixture inactive; request cancelled/refunded.
- **PASS (limited webhook observation):** five matched TEST checkout.session.completed events have pending_webhooks=0. 3DS event evt_1Ud9omAO40Rp32aFQi4tl4YF; success evt_1Ud9n4AO40Rp32aFQqF0Nnyi; retry evt_1Ud9z8AO40Rp32aFV20we6aJ; Windows mobile evt_1Ud9zYAO40Rp32aF4Xmlwcm3; Connect evt_1UdA9gAO40Rp32aF0Cv2jrXT. This does not establish exact endpoint delivery identity or replay/idempotency.
- **PASS (configuration inspection only):** identity-verification bucket is private; owner/admin SELECT and owner-path INSERT policies inspected. Valid synthetic document upload/download/admin-review lifecycle remains NOT TESTED.
- **FAIL:** Linux CI mobile WebKit hosted Stripe form still shows Something went wrong before card entry. Fresh payment job 134887800640: 7 passed / 1 failed / 3 skipped. Windows WebKit success does not close Linux CI failure.
- **FAIL / financial launch gap:** landowner charge application_fee_amount=null and transfer_data=null. No 20% landowner commission/Connect payout evidence. Outfitter fee success does not close landowner economics.
- **BLOCKED:** deliverable controlled test inbox, second-landowner secure login, eligible historical completed-booking review fixture; applicable tax and release approvals from responsible reviewers. Florida supplied by the user is the test location, not those missing resources.
- **NOT TESTED:** full property-ownership verification; valid guest-ID lifecycle/privacy/retention; full role/booking-state permission matrix and booked-coordinate disclosure/revocation; positive review/moderation/publication/duplicate submission; real hunter-outfitter messaging; full UI booking approval/cancellation journey; exact webhook endpoint/replay; external-bank payout; native zoom, screen reader, physical Safari/device checks. Promo/add-on/deposit/group totals and cutoff/DST edge cases were not newly executed. These remain launch gates.

**Tested app code:** 4184699967e4076993f12b53c91e6b54151007cb. Sandbox deployment ecd50e47-7080-4c2b-ad57-551a515c34cc succeeded at 2026-11-18T15:02:35Z: https://ecd50e47.leasewild-sandbox.pages.dev. All ten changed served app files matched normalized SHA-256 against checkout. Later report/test-assertion-only commits do not change app assets.

**CI snapshot at 10:09 AM ET:** [44328954618](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/44328954618) remains overall in progress with payment FAIL, host Chromium and hunter WebKit success; remaining host WebKit/hunter Chromium jobs are still installing Playwright. [44330965266](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/44330965266) is pending for 4184699. Neither overall run is represented as PASS. The final report/test-assertion commit may supersede that pending run under configured GitHub concurrency.

**Evidence package delivered with this audit:** deployed-browser-results.json, map-persistence-results.json, messaging-results.json, stripe-reconciliation.json, connect-stripe-reconciliation.json, application-fee-refund.json, webhook-events.json, deployment-content-verification.json, baseline/first-attempt reports and screenshots. Credentials, service keys, signed URLs and authenticated traces are excluded. Launch remains NO-GO; main, live domain, production Supabase and live Stripe were not accessed or modified.

**Data-handling exception:** the repository payment harness's legacy pinned expired TEST Checkout Session was read once as an identity probe and returned a non-synthetic-looking customer email. That legacy artifact was excluded from fresh testing; no login, card submission or mutation used that identity. The email is omitted from deliverables. All fresh account logins, writes, messages, card submissions and cleanup used the independently verified synthetic identities listed here.

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

## Deployment and further regression

- Commits: 01962c39a42773a2324b80477458dd8d523eac08 (discovery/accessibility/test-card input); 35c2a61ee174c819b11e9f3c1f6df49bfb19b770 (closed pointer ring).
- Sandbox deployment 38f5aac2-ffc6-45a8-993b-004ab5f04c87 succeeded for 35c2a61 at 2026-11-18T14:52:23Z: https://38f5aac2.leasewild-sandbox.pages.dev. Independent SHA-256 comparison matched all ten changed served app assets to the checkout.
- Initial full deployed expansion: 53 PASS, 3 FAIL. Remaining map header/legend contrast was reproduced and corrected. WebKit protection-page contrast sampled a fade transition; scanner now waits for finite animations to finish. Anonymous list-your-land redirect is now explicitly asserted and annotated, not misreported as authenticated form coverage. Targeted candidate retest: 3 PASS. Public pin/card mismatch found during browser review: map rendering now uses visible listing IDs after category or search changes. Candidate map/card count test passes in both Chromium and mobile WebKit.
- Actual two-participant messaging PASS: hunter sends, owner receives/replies, hunter reload sees reply; synthetic outfitter nonparticipant reads zero rows and gets 403 on insertion. Conversation d63ebf8a-df43-4321-aefd-ee65709410c6 on our exact booking. This exercises retention on a cancelled future booking; full active-booking/unread/draft/thread-switch and hunter-outfitter journeys remain separate. Six exact QA messages from test attempts were identified and removed after evidence capture.
- Connect independently reconciled: charge ch_3UdA9fAO40Rp32aF023gHbmZ, fee fee_1UdA9iAO408zPcFQBOKsSJFd ($40), transfer tr_3UdA9fAO40Rp32aF0KGVB98x ($200), refund re_3UdA9fAO40Rp32aF0uV4rpvh ($200 succeeded), reversal trr_1UdA9kAO40Rp32aFy66dwG4v. Transfer read shows amount_reversed=20000 and reversed=true. Connected bank payout is NOT established by this transfer.
- Fresh CI run https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/44328954618 at test commit 01962c3: payment job 134887800640 reports 7 PASS / 1 FAIL / 3 SKIPPED. Linux mobile WebKit still displays Stripe Something went wrong before card entry; Session remains open. Atomic card fill does not fix this separate upstream browser-rendering failure. Windows local WebKit passed, so retain platform-specific FAIL and do not declare checkout universally ready.
- A deployed authenticated map rerun saved/reloaded areas but its cleanup session was signed out while the same synthetic owner was used by concurrent CI. One exact retained parking row 53661616-78cc-454f-a812-4ad661efcc6e was removed independently. Treat that run as FAIL, not PASS. Final isolated rerun must wait until shared-account CI is quiescent.

## Required scope ledger

| Requested area | Current evidence status |
|---|---|
| Public routes / 320–2560 | PASS: final two-engine 540 width assertions; auth-gated route is redirect-only |
| Hunter / owner / outfitter / admin login | PASS in Chromium and Windows mobile WebKit baseline; owner reload/logout PASS; all permission permutations NOT TESTED |
| Discovery / maps | PASS: corrected species filtering and desktop/mobile pin consistency on deployed sandbox |
| Drawing / save / reload | PASS: final deployed real pointer persistence and cleanup for hunting, entry, parking |
| Property verification | NOT TESTED end-to-end; owner ID verification is not proof of property ownership |
| Completed-booking hunter reviews | Negative cases PASS; positive, duplicate, moderation and publication BLOCKED on eligible owned fixture |
| Messaging | Hunter-owner exchange/reload and nonparticipant denial PASS; outfitter real exchange, unread, drafts and thread-switch NOT TESTED |
| Booking / cancellation | Fresh TEST API lifecycle plus hosted browser checkout, approval/capture/full-refund PASS; full UI request/approval/cancel navigation, cutoff/DST races NOT TESTED this run |
| Synthetic ID privacy | Invalid invite rejection PASS; valid upload/private-download/admin-review/retention lifecycle NOT TESTED |
| Success / decline / 3DS / retry | Local hosted browser cases PASS with independent TEST reconciliation; Linux WebKit CI FAIL |
| Webhook | Pending-approval transition observed without recovery; exact endpoint event and replay/idempotency NOT TESTED this run |
| Fee / tax | Outfitter 20% fee/transfer PASS; landowner fee/transfer absent; $106.50 total includes placeholder 6.5%, tax compliance BLOCKED |
| Refund / payout | Landowner and outfitter full refunds PASS; connected transfer reversed; external bank payout NOT TESTED; partial-refund policy has no guest partial tier |
| Email | BLOCKED on controlled deliverable synthetic inbox; current fixture addresses use example.com |
| Accessibility | PASS for bounded automated final scans at 2560px; screen reader/physical device/native zoom and all-width accessibility NOT TESTED |

These are bounded results, not a complete launch certificate. Launch remains NO-GO.
