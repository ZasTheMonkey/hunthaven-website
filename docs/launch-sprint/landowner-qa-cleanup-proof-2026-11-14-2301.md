# Landowner QA — cleanup and authorization proof gate (2026-11-14 23:01 ET)

Scope: **staging/leasewild-full-clone** and **leasewild-sandbox.pages.dev** only. Landowner QA coordination; no production or main access.

## Fresh inspection (STATIC-ONLY)
Read the staging Stripe launch gate, host/admin report, and `qa/playwright/tests/host.spec.mjs`. The host suite contains authenticated entry/parking save/reload/delete and second-owner denial tests, but these are guarded by `QA_LANDOWNER_FIXTURE_VERIFIED` and (for write cases) `QA_LANDOWNER_ZONE_CLEANUP_VERIFIED`. These environment switches are **declarations**, not independent verification of fixture ownership, polygon containment, RLS, or cleanup. No new browser session or Stripe TEST payment was executed in this review.

The entry/parking `finally` handlers reload, look for the test label, delete it, and reload again. This is useful **UI-level cleanup evidence only**. It does not prove the server has no orphaned rows, and a failed reload can mask the original failure. Do not mark database cleanup PASS from the UI alone.

## Next executable proof (Bot B / landowner QA ownership)
1. Confirm the target Supabase project is the sandbox project, and inspect the synthetic listing's owner and geographic extent using a read-only query. Verify both landowner identities are separate sandbox-only users.
2. Before enabling any write test, establish a server-side cleanup mechanism scoped to a unique test-run marker and listing ID, with read-after-delete zero-row assertion. Do not delete untagged or non-synthetic rows. Record counts before and after.
3. Run real-browser map save/reload/delete for hunting, entry and parking zones at mobile and desktop widths, then independently query sandbox zone rows for persistence and cleanup. Capture browser screenshots and runner URL.
4. Sign in as second synthetic owner and as hunter, attempt unauthorized zone read/write, and verify both browser denial and database RLS outcome. A disabled button alone is insufficient security proof.
5. Exercise completed-booking review eligibility and owner messaging using synthetic bookings; verify host/hunter visibility and role separation. Record evidence in `e2e-host-admin-test-report.md` without overwriting other bots' entries.
6. Cross-check Bot A's fresh TEST booking IDs on host/admin side. Payments team owns new Stripe card submissions; avoid duplicate fixture mutations.

## Current evidence and release state
The shared gate cites [payment run 43634277042](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43634277042): 7 passed, 3 skipped, 0 failed, with TEST booking/payment/refund evidence. That is **prior runner evidence**, not a fresh run. The host report cites [run 43602921447 attempt 2](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43602921447): 49 passed, 0 skipped per host browser, but not the authenticated zone persistence/cross-owner/review journeys. No launch readiness is inferred.

**Run accounting:** 3 staging files inspected; 0 new browser routes/flows; 0 Stripe TEST payments; 0 application fixes; 0 deployments. **BROWSER ACCESS BLOCKED** in this execution environment; authenticated map, RLS, reviews and server cleanup remain **NOT TESTED** this run. Overall launch **NO-GO** pending these and payment/tax/legal gates.
