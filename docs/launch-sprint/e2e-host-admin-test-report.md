# LeaseWild Bot B — Host/Admin E2E evidence report

## 2026-11-12 01:32 EST — automated review, staging only

**Environment:** `ZasTheMonkey/hunthaven-website`, `staging/leasewild-full-clone`, `https://leasewild-sandbox.pages.dev`. No production resources accessed.

**Evidence classification:** STATIC-ONLY. This execution environment exposes GitHub repository reads/writes but no real graphical browser or computer interaction. **BROWSER ACCESS BLOCKED**. No UI interaction, synthetic login, checkout, email inbox, or actual Stripe test-card run occurred. No fabricated PASS.

### Verified source observations
- STATIC-ONLY: `.github/workflows/leasewild-real-browser-qa.yml` exists on staging. It defines five Playwright jobs: hunter chromium/mobile-webkit, host chromium/mobile-webkit, payments chromium. It checks out staging and targets the sandbox URL.
- STATIC-ONLY: workflow contains `schedule: 17 * * * *`, but GitHub scheduled workflows run from the default branch; this staging-only workflow is **not evidence of hourly execution**. Its job also guards `github.ref == 'refs/heads/staging/leasewild-full-clone'`. Require actual workflow-dispatch run IDs, job logs, screenshots and artifacts before marking a real-browser PASS.
- STATIC-ONLY: the shared Stripe launch gate documents pending tax configuration, unresolved Connect payout proof, and incomplete payment browser evidence. Historical test PaymentIntents and database observations are not new browser test results.
- STATIC-ONLY: `qa/playwright/package.json` defines Playwright dependency and host test command. Test runner presence does not prove execution.

### Run accounting
- Real browser routes tested: **0**
- Real browser host/admin flows tested: **0**
- Real browser passes: **0**
- Real browser failures: **0** (not equivalent to passing)
- Verified fixes/deployments in this run: **0**
- Browser-required flows blocked by unavailable graphical browser: **all**
- Source files reviewed: **3** (launch gate, workflow, package manifest); additionally reviewed existing landowner QA notes.

### Priority outstanding host/admin scenarios (NOT TESTED)
1. Synthetic landowner and outfitter registration; email confirmation; listing create/edit, images, videos and moderation.
2. Draw hunting boundary, entry and parking polygons; save, refresh, reopen, cross-owner denial, invalid geometry.
3. Property verification, private ID review and access controls; guest upload must remain submitted until approved.
4. Booking approval/decline, cancellation, inventory release, live messaging, owner notification and completed-booking hunter reviews.
5. Stripe TEST browser checkout/3DS/decline/retry, manual authorization and capture, webhook idempotency, tax/6.5% placeholder, 20% commission, promos, add-ons, cleaning deposits, refunds, connected outfitter transfer and payout.
6. Widths 320/375/390/430/768/1024/1280/1440/1920/2560, keyboard, touch, zoom and accessibility.

### Launch-blocker register
- **P0 — Browser evidence absent:** Run authenticated real Playwright or graphical-browser tests against deployed sandbox; attach video, screenshots, traces, synthetic identities and GitHub run IDs.
- **P0 — Stripe gate unproven:** Match TEST Checkout/PaymentIntent/refund/transfer objects to sandbox booking and webhook records and browser-visible state.
- **P0 — Tax classification:** 6.5% placeholder is not proof of lawful tax treatment; confirm registrations and product taxability before live charges.
- **P0 — Host/admin access security:** Verify cross-owner and cross-role RLS and private ID access in actual authenticated negative tests.
- **P1 — Workflow scheduling:** GitHub Actions schedule on nondefault staging branch cannot be relied on for hourly execution. Use an explicitly authorized dispatcher or other supported staging-only orchestration and verify run evidence.

**Coordination:** Bot B owns host/admin journeys; Bot A owns hunter checkout. Avoid overlapping edits. This report adds evidence classification only, with no changes to checkout or shared app files.

**Release decision: NO-GO.** No production/main changes. No Stripe charges or synthetic records created this run.


## 2026-11-12 02:15 EST — source evidence and QA documentation correction

**Scope:** staging-only GitHub source review; no browser, authenticated synthetic accounts, Stripe TEST checkout or live inbox was available in this run. No production resources touched. **Evidence type: STATIC-ONLY.**

- Reviewed current `qa/playwright/tests/host.spec.mjs`: eight host/admin route render-and-screenshot cases plus three authenticated login/tab scenarios (landowner, outfitter, admin). Authenticated cases require `QA_LANDOWNER_*`, `QA_OUTFITTER_*`, `QA_ADMIN_*` synthetic secrets; no map save/reload, cross-owner denial, hunter review, reservation approval, email receipt, payout or refund assertions are implemented here. **NOT TESTED** in browser.
- Reviewed `qa/playwright/tests/payments.spec.mjs`: four hosted Stripe TEST card scenarios require fresh per-case `QA_STRIPE_TEST_CHECKOUTS_JSON` fixtures; ten financial scenarios (refunds, cancellation, duplicate, promo, tax, outfitter add-on, cleaning deposit, payout) are explicitly skipped. **No new payment executed.**
- Reviewed `sandbox-zone-editor.html`: markup contains hunting-area polygon, entry point, parking point and trail controls, coordinate entry and mobile layout rules. This confirms **source presence only**, not that a synthetic owner can save, refresh and reload geometry or that authorization is secure.
- Corrected misleading `qa/playwright/README.md` statement that testers already run hourly and inaccurate four-job count. Actual workflow defines **five jobs** and staging-only schedule is not evidence of execution. Documentation correction commit: `f3c76cb99a45a990cf7a8c4a6c6a93e7f5088d30`.
- Historical Stripe launch-gate initial claim of **zero** linked outfitter payout accounts is superseded by its later 2026-11-11 16:38 ET sandbox database observation of **one** linked synthetic test outfitter. Do not repeat zero as a current verified count; re-query sandbox before a new assertion. A linked account alone is not a tested payout.

**This run:** real browser routes 0; real browser E2E flows 0; test-card payments 0; verified runtime bug fixes 0; documentation corrections 1; deployment verification NOT TESTED; critical financial/identity/security flows BLOCKED or NOT TESTED pending real execution. **NO-GO** until browser, Stripe TEST, sandbox database and email evidence are reconciled.


## 2026-11-12 03:34 EST — geometry validation fix and fresh sandbox database audit

**Fix committed/deployed (source-level test + Cloudflare deploy):** `sandbox-zone-editor.html` previously validated a hunting boundary using only vertex count, coordinate range and nonzero shoelace area, allowing self-crossing polygons or repeated corners to be submitted. Updated `validBoundary()` to reject repeated vertices and intersections between nonadjacent edges, preserving valid concave polygons. Commit `b168b192560e81cbe4409427e799628708139261` on staging. Direct JavaScript function checks: valid square PASS, valid concave polygon PASS, crossing bowtie REJECTED, duplicate vertex REJECTED. Cloudflare Pages project `leasewild-sandbox` deployment `e2249703-1590-496a-aefd-2f2351e5881e` for exact commit reported deploy status **success** at 2026-11-12 08:33:10 UTC. This is deployment verification, **not** authenticated UI/browser verification.

**Fresh sandbox Supabase read-only observations (not browser E2E):** `public.bookings` statuses: 2 authorization_pending, 10 cancelled, 3 confirmed, 1 declined, 2 expired, 2 pre_reserved (20 total). `public.outfitter_booking_requests`: 2 accepted, 1 cancelled, 1 declined. `public.sandbox_booking_email_outbox`: 3 sent and 1 pending; two sent owner_booking_request messages and one sent adult_guest_id_invite, all attempts=1; pending adult_guest_id_invite attempts=0. Sent status indicates sender processing, **not proof of recipient inbox delivery**. Two authorization_pending bookings were created at 2026-11-12 04:57:19 and 04:58:30 UTC; inspect Stripe TEST authorization/session/webhook state before changing them. No payment/booking mutations made.

**RLS policy inspection (database metadata only):** `listing_access_zones` SELECT/INSERT/UPDATE/DELETE policies restrict authenticated users to listings where `owner_id=auth.uid()`; UPDATE has both USING and WITH CHECK. This is positive policy configuration evidence, not a real cross-account denial test. Authenticated map drawing/save/reload, role isolation and payments remain **NOT TESTED** in a real browser this run.

**This run:** real-browser routes 0; real-browser flows 0; Stripe test-card payments 0; source-level geometry fix 1; four direct JS validation checks; Cloudflare sandbox deployment 1 successful; database aggregate/read-only checks 3; live inbox delivery unverified. **NO-GO** until actual browser payment, booking, email and authorization E2E evidence exists. Do not touch GitHub main, live domain, production database or live Stripe.


## 2026-11-12 06:33 EST — host QA execution gate recheck

**Evidence type: STATIC-ONLY; browser and Stripe TEST UI NOT TESTED.** Re-fetched the current staging host Playwright spec, zone editor and real-browser workflow. The workflow has five jobs (hunter Chromium/WebKit, host Chromium/WebKit, payments Chromium), and the host spec has eight unauthenticated route screenshots plus three credential-gated login/tab cases. It does **not** contain executable assertions for owner-drawn polygon save/reload, owner isolation, completed-booking hunter reviews, booking approval or email delivery. The sandbox zone editor source includes hunting polygon, entry, parking and trail controls; presence is not proof of functional persistence or security.

**Execution blocker:** The workflow's `schedule` trigger cannot run hourly solely from a workflow file on nondefault staging; its `if: github.ref == 'refs/heads/staging/leasewild-full-clone'` also prevents default-branch scheduled jobs from running. Manual `workflow_dispatch` against the staging ref or a separate authorized staging dispatcher is required. No supported GitHub Actions dispatch/run-list capability or graphical browser was available to this run, so no actual workflow run ID or browser trace could be obtained. Do not count the YAML configuration as a completed test.

**Priority next work:** Obtain a real staging-ref workflow-dispatch run with synthetic QA secrets and fresh TEST Checkout fixtures; verify checkout/session/PaymentIntent/webhook/booking/email reconciliation; add host authenticated assertions for polygon save/reload and cross-owner denial; then test review eligibility and booking messaging. Coordinate fixture IDs with Hunter QA. Never introduce production secrets or push workflow fixes to main without authorization.

**Accounting:** 3 current staging source files reviewed; 0 real-browser routes; 0 completed E2E flows; 0 Stripe TEST payments; 0 verified runtime fixes; 0 sandbox deployments in this run. No live or production resources accessed. **NO-GO.**


## 2026-11-12 07:48 EST — Stripe TEST refund / Connect payout reconciliation (API-ONLY)

**Scope:** Stripe account `acct_1TOJ2rAO40Rp32aF`, `livemode=false` exclusively; GitHub staging report. No production account accessed, no new payment, refund, transfer or payout created. **BROWSER ACCESS BLOCKED** in this run; no human-like Checkout or host/admin UI execution.

- **API-ONLY PASS (historical objects):** `GET /v1/refunds` returned **10** succeeded test refunds, `has_more=false`. These are Stripe-side results, not proof of LeaseWild booking/email lifecycle.
- **API-ONLY PASS (historical objects):** `GET /v1/transfers` returned **4** Stripe Connect transfers to synthetic account `acct_1TOJMRAO408zPcFQ`, totaling **35,410 cents ($354.10)**, `has_more=false`. IDs: `tr_3UZrcCAO40Rp32aF1uRujzrX`, `tr_3UZrc6AO40Rp32aF1ltHmCGO`, `tr_3UZrc4AO40Rp32aF2UX6XPyT`, `tr_3UZrQ6AO40Rp32aF1zbrlG1K`.
- **API-ONLY (not a payout pass):** `GET /v1/payouts` on the **platform** account returned **0**. This endpoint does **not** establish the connected account's payout history. Connected-account scoped read using `acct_1TOJMRAO408zPcFQ` was denied because that account is not directly available as a Stripe connector context. The connected account's actual bank payout remains **BLOCKED / NOT VERIFIED**.
- **P0 reconciliation review:** Test refund `re_3UZrc6AO40Rp32aF1pxwqh39` is for 2,500 cents on charge `ch_3UZrc6AO40Rp32aF1zWVkaFO`; a 2,500-cent transfer `tr_3UZrc6AO40Rp32aF1ltHmCGO` references the same source charge. The refund reports `source_transfer_reversal=null` and `transfer_reversal=null`; the transfer reports `amount_reversed=0`. **Potential unreversed host transfer on refunded booking** — inspect cancellation policy, whether refund intentionally leaves host proceeds, connected-account balance, and transfer reversal ledger before declaring a defect. Do not reverse historic funds blindly.
- **Blocker:** Current Stripe tool access has no directly authorized connected-account context and no usable payout-creation operation. Owner was provided Stripe authorization flow; do not assume authorization completed. Real browser runner and synthetic login/test Checkout fixtures also absent.

**This run accounting:** real browser routes **0**, real browser flows **0**, fresh Stripe TEST card payments **0**, new payouts **0**, reproducible app defects fixed **0**, deployments **0**; API-only lists **3**, staging QA report update **1**. Next: gain sandbox-only connected-account authorization, execute fresh synthetic booking/refund, verify transfer reversal rules and connected-bank payout via authenticated browser or authorized test runner; reconcile sandbox booking, webhook, Stripe and test inbox. **Launch NO-GO**.


## 2026-11-12 10:32 EST — responsive map browser coverage added (STATIC-ONLY)

- **Code improvement:** Added ten independent Playwright viewport smoke cases to `qa/playwright/tests/host.spec.mjs` for the deployed sandbox zone editor at widths 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 and 2560. Each checks visibility of zone type, boundary drawing, save control and map; checks for raw-script rendering and horizontal overflow; and captures a screenshot. Commit `b338eb50b0fca6691ca1d050bfc1658a6f65a447` on staging only. No application checkout or payment code changed.
- **Evidence:** STATIC-ONLY for source update. The new tests are **NOT TESTED** in a real browser: no graphical browser or GitHub Actions workflow-dispatch operation available in this execution environment. Browser pass/fail counts remain zero; no run URL, screenshots, traces or deployment result claimed. The tests do not yet cover authenticated polygon persistence or cross-owner isolation.
- **Scheduling blocker:** The workflow remains on nondefault staging and its cron is not evidence of a staging execution. A staging-ref workflow_dispatch run with synthetic credentials is required; actual run logs must be checked before claiming pass.
- **Accounting:** source test cases added 10; browser routes executed 0; browser E2E flows 0; payments/refunds/payouts initiated 0; runtime defects reproduced 0; runtime fixes verified 0; staging commits 1; production/main changes 0. **NO-GO** until authenticated host, financial, identity and security critical paths are proven.
