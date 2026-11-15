# Landowner QA fixture parsing handoff — 2026-11-14 19:42 ET

Scope: staging/leasewild-full-clone ONLY; no production or live resources.

## Change

Commit b5f260d8444cd81d586ee53b748ab27683f3b7a7 adjusts both authenticated entry-area and parking-area fixture parsers in qa/playwright/tests/host.spec.mjs. Previously JavaScript Number('') converted blank latitude/longitude tokens to zero, so a malformed QA_LANDOWNER_ZONE_POINTS string could accidentally be treated as valid coordinates. Empty tokens now map to NaN and fail the existing Number.isFinite guard. This changes test fixture validation only, not application geometry or payments.

## Evidence

STATIC-ONLY: fetched updated staging source and confirmed both parser occurrences. No Playwright/browser execution, no Stripe TEST payment, no deployment and no authenticated synthetic data writes in this run. No E2E PASS claimed.

## Next tests and blockers

Verify sandbox-only owner credentials, listing ownership and geographic bounds; verify reliable server-side cleanup of synthetic zones (UI-only cleanup can miss partially persisted rows). Then run real-browser entry/parking/hunting polygon save/reload/delete and cross-owner denial, followed by completed-booking reviews, booking/messages and Stripe TEST reconciliation. Browser access to the deployed sandbox and actual workflow dispatch/run evidence remain unverified in this invocation. Coordinate with Hunter QA to avoid duplicate payment fixtures. Launch NO-GO pending payment/tax/security/identity/receipt/payout gates.
