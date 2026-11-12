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
