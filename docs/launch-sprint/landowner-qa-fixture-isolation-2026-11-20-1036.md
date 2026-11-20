# Landowner QA — fixture isolation, 2026-11-20 10:36 ET

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev ONLY. No production access.

## Safety fix

Workflow commit `94d702ac6bf3e57426b0e038d712edb89bbb8f33` removes the fallback from `QA_LANDOWNER_LISTING_ID` to `QA_PAYMENT_LISTING_ID` in the host browser job. The host Playwright zone cases save and delete hunting/entry/parking zones, so payment-test listings must not be silently reused as destructive fixtures. Host QA now requires a separately configured `QA_LANDOWNER_LISTING_ID` (repository variable or secret), with independent owner/listing and cleanup verification flags. The payments job retains its separate payment listing. This is a staging workflow configuration change, not an application runtime fix.

## Required setup and execution evidence

- Verify dedicated sandbox-only landowner A/B identities, an A-owned disposable listing, and in-bounds map coordinates. Configure `QA_LANDOWNER_LISTING_ID`, `QA_LANDOWNER_ZONE_POINTS`, `QA_LANDOWNER_FIXTURE_VERIFIED=true`, and `QA_LANDOWNER_ZONE_CLEANUP_VERIFIED=true` only after validating ownership and cleanup.
- Confirm the GitHub workflow ran against the new commit and inspect six matrix job conclusions, skips, screenshot/video/trace artifacts. A push trigger is configured for workflow edits but is not evidence that a run completed.
- Execute authenticated pointer/touch drawing, save/reload/delete, second-owner denial, verification, completed-booking reviews, messaging, and owner-side booking approval. Coordinate with Hunter QA to avoid duplicate test payments.
- Preserve open financial gates: real TEST card Checkout/browser reconciliation, receipt inbox delivery, partial refunds, Connect bank payouts, tax registration/classification, and authorization/capture idempotency.

## Evidence and counts

STATIC-ONLY source and workflow configuration audit; GitHub staging workflow configuration fix committed. Real graphical-browser routes **0**, E2E flows **0**, Stripe TEST card submissions **0**, reproduced runtime defects **0**, verified application fixes **0**, Cloudflare deployments **0**. CI run outcome and sandbox deployed SHA **NOT VERIFIED**. Browser access and independently verified disposable identities/fixtures are unavailable in this execution environment. **NO-GO**. No main/live changes.
