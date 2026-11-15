# Landowner QA checkpoint — 2026-11-15 05:09 EST

Scope: staging/leasewild-full-clone only. Source inspection of `qa/playwright/tests/host.spec.mjs`, shared Stripe launch gate and host/admin report. **STATIC-ONLY in this invocation.** No fresh browser session, Stripe TEST transaction, database query, Cloudflare deployment, or production access. Do not count this as a passing E2E test.

## Concrete coverage and risk

- Authenticated entry-area and parking-area tests require `QA_LANDOWNER_LISTING_ID`, `QA_LANDOWNER_ZONE_POINTS`, `QA_LANDOWNER_FIXTURE_VERIFIED=true`, `QA_LANDOWNER_ZONE_CLEANUP_VERIFIED=true` and synthetic credentials. The booleans are operator assertions, not proof of ownership or cleanup.
- Their `finally` blocks reload, locate a uniquely labeled zone, delete through the UI and reload to check disappearance. This is valuable browser-level cleanup but **not an independent sandbox database assertion**. If cleanup cannot authenticate, the test may fail while leaving a fixture; inspect sandbox records before rerunning.
- The second-owner denial test checks distinct email strings, authenticated dashboard, denied zone-editor access and disabled save controls. It does **not** independently establish distinct Supabase user IDs or RLS denial against the data API. Verify both fixture owners and a server-side negative write with isolated synthetic identities.
- Source has authenticated zone tests, but no new evidence in this invocation that hunting polygons, entry/parking areas, completed-booking reviews, property verification or messaging succeeded end to end.
- The shared Stripe gate documents prior genuine TEST-card evidence, but receipt inbox delivery, external-bank payout, partial refunds, Stripe Tax registration/classification, and legal release remain open. Mobile WebKit Stripe failure reported in prior Actions evidence requires independent rerun and root-cause investigation by Hunter/Payments; do not duplicate their test fixtures.

## Next actions by owner

**Landowner/Host QA:** Provision and independently verify two synthetic owner user IDs and ownership of the disposable listing; establish database cleanup check; run authenticated polygon/entry/parking save-reload-delete on Chromium and WebKit; run cross-owner API denial and completed-booking review flow. Save test screenshots, run/job URLs, fixture IDs and actual cleanup results.

**Hunter/Payments QA:** Own fresh mobile WebKit checkout/3DS diagnosis and Stripe TEST reconciliation. Share booking IDs for owner-side status, calendar release, messages and notification verification.

**Developer:** Fix only reproducible staging defects, preserve working checkout, deploy sandbox only and retest exact failures. Coordinate edits before changing shared test/report files.

**Launch status: NO-GO.** Zero routes newly tested; zero flows newly tested; zero fixes; zero deployments in this invocation. No main/live/production access.
