# Landowner QA — cross-owner access regression (2026-11-14 02:51 EST)

Scope: GitHub staging/leasewild-full-clone and Cloudflare sandbox only. No production resources.

## Change

Commit e84c9cdf6d015154d7fed74964fbf485fcfadb3a adds a Playwright host browser test: a distinct synthetic landowner signs in, opens the FIRST owner's disposable listing in sandbox-zone-editor, must see the explicit access-denied status, cannot save either one or all zones, and cannot see saved zone rows. It does not write any data. This is a cross-owner negative case, NOT proof of RLS without browser execution.

## Evidence and status

- STATIC-ONLY: Source check confirmed the editor's owner-scoped listing lookup uses owner_id equal to authenticated user ID, and returns 'You do not have access to edit this listing.' on nonownership. The test asserts this UI outcome.
- NOT TESTED: No fresh real-browser run, screenshot, two-account login, sandbox database RLS probe, Stripe TEST payment, or Cloudflare deployment verification in this invocation. Do not call this PASS.
- Execution prerequisite: verified isolated QA_SECOND_LANDOWNER_EMAIL/PASSWORD (distinct from QA_LANDOWNER) and QA_LANDOWNER_LISTING_ID pointing to a disposable listing owned by the first identity, supplied to the staging Playwright runner as secrets/environment. The test explicitly skips if absent. Ensure these accounts cannot access production.
- Coordination: Bot B owns this host test. Bot A owns hunter payment card-entry; Designer/Developer should avoid editing host.spec.mjs concurrently. Once credentials exist, execute the host Chromium and mobile WebKit jobs, attach run URL, trace/screenshot and record pass/fail. Independently confirm sandbox RLS denies second-owner SELECT/INSERT/UPDATE/DELETE, not merely hidden UI.

## Open launch gates

Authenticated boundary/entry/parking persistence; cross-owner denial in actual browser and RLS; property verification and private ID access; completed-booking reviews; bookings and messaging; Stripe TEST capture/refund/receipt/Connect payout, tax registration/classification. Launch NO-GO.

Run accounting: 1 new regression test, 1 source commit, 0 browser routes/flows tested, 0 new payment submissions, 0 application fixes, 0 verified deployments. No main/live/prod changes.
