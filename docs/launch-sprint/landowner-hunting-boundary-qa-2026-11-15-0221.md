# Landowner QA handoff — 2026-11-15 02:21 ET (sandbox only)

Commit `bdcc9e03e153eeb16fc8ff3b426f37df4852d575` adds `qa/playwright/tests/landowner-hunting-boundary.spec.mjs`, a dedicated real-browser Playwright test for authenticated synthetic owner hunting-area polygon creation, save, reload persistence, and deletion/reload. This closes a *test-definition gap*, not an application bug or verified E2E gate.

**Evidence: STATIC-ONLY.** GitHub create-file returned a staging commit. No browser session, TEST card payment, sandbox database mutation, Cloudflare deployment or verified runtime PASS in this run. Routes executed 0; E2E flows executed 0; failures reproduced 0; application defects fixed 0; browser test cases added 1.

**Prerequisites:** `QA_LANDOWNER_EMAIL/PASSWORD`, `QA_LANDOWNER_LISTING_ID`, `QA_LANDOWNER_ZONE_POINTS`, `QA_LANDOWNER_FIXTURE_VERIFIED=true`, and `QA_LANDOWNER_ZONE_CLEANUP_VERIFIED=true` must be independently verified, not merely set. Coordinates must be inside the verified disposable property, form a valid simple polygon, and must not touch any real listing. The test's UI cleanup is not proof of server-side deletion: inspect the sandbox `listing_access_zones` table before/after, and remove any orphan synthetic row with authorized sandbox-only tools. Never use production service credentials.

**Coordination:** Host/Admin QA owns fixture provenance, browser run, server-side cleanup and cross-owner denial. Hunter/Payments QA owns fresh Stripe TEST checkout and 3DS/mobile WebKit regressions. Do not duplicate test bookings or edit payment code. Record actual GitHub Actions run URL, test case result, screenshot, sandbox row IDs, cleanup confirmation and exact deployment commit before changing any gate from NOT TESTED to PASS.

**Launch:** NO-GO pending authenticated E2E, RLS, booking/messaging, tax, receipt, refund and payout proof. No main/live deployment authorized.
