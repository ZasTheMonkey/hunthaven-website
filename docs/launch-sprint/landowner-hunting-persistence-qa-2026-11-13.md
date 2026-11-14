# Landowner hunting-boundary persistence QA — 2026-11-13 23:xx ET

**Owner:** Bot B (landowner/host QA). **Environment:** staging/leasewild-full-clone and leasewild-sandbox.pages.dev only. **Launch:** NO-GO.

## Change
Commit `03130447eb5866a64693591da6a9cef3ec551cbc` adds `qa/playwright/tests/landowner-hunting-persistence.spec.mjs`. The browser scenario signs in with a synthetic landowner, opens a verified synthetic listing's zone editor, draws a three-point hunting boundary by typing coordinates, saves, reloads, checks the saved row, takes a screenshot, then deletes the synthetic boundary in a finally block. This complements the existing entry-area persistence scenario in `host.spec.mjs`.

## Evidence classification
**STATIC-ONLY for the new test.** GitHub accepted the staging commit; no new workflow execution, screenshot, Cloudflare deployment, or sandbox database persistence was verified in this invocation. Do not count the test as passing. The test skips explicitly if `QA_LANDOWNER_EMAIL`, `QA_LANDOWNER_PASSWORD` or `QA_LANDOWNER_LISTING_ID` is absent. The listing ID must refer to a dedicated disposable sandbox listing owned by that synthetic landowner; verify project identity and ownership before provisioning it. Do not point this test at a real listing.

## Coordination and next verification
Hunter/Payments owns fresh Stripe TEST checkout and payment fixture generation; Bot B owns host-side polygon persistence, verification, cross-owner access and reviews. No shared payment or application files were edited. Dispatch the staging host Playwright workflow and inspect the exact run URL, host Chromium and mobile WebKit logs, screenshot artifact and cleanup. If it fails, inspect the real browser trace and fix only the demonstrated staging defect, then retest. Existing documented payment evidence in `stripe-launch-gate-2026-11-11.md` shows six passes and three skips in run 43549078806; receipt delivery, external bank payout, partial refund, Stripe Tax, and authenticated host authorization/review flows remain NO-GO gates.

**Run accounting:** 1 new test file, 1 staging test commit, 0 browser tests executed, 0 Stripe TEST charges, 0 application fixes, 0 verified deployments. Never push main or deploy leasewild.com.
