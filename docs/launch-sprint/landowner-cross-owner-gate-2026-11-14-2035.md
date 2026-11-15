# Landowner QA — cross-owner fixture gate (2026-11-14 20:35 EST)

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev only. Never main, live domain, production Supabase, live Stripe or real accounts.

## Change
Commit `50bdd3bc5d01435e15735019e7b46b757a409593` tightens the second-landowner browser test prerequisite: require both synthetic account credential sets, different normalized emails, valid listing UUID and `QA_LANDOWNER_FIXTURE_VERIFIED=true`. Previously a second account could accidentally be identical to the first, or target an unverified listing, making denial evidence unreliable. This is a test-harness safeguard, not an application security fix.

## Evidence and status
- STATIC-ONLY: fetched current host Playwright test, shared Stripe launch gate and host/admin report on staging; updated test source on staging. No graphical browser/Actions dispatch available in this invocation.
- REAL BROWSER: BLOCKED (no browser tool); new authenticated cross-owner denial NOT TESTED. No Stripe TEST card payment, deployment or live email confirmation occurred.
- Before enabling write tests, independently confirm sandbox project, first-owner listing ownership, second distinct synthetic account, polygon geographic bounds and reliable server-side cleanup. Boolean flags alone are not proof.
- Existing zone cleanup still depends on a saved UI row and may leave an orphan if the UI fails after server persistence. Do not claim cleanup proven without database reconciliation.
- Completed-booking hunter reviews, owner-side booking and messaging, verification and responsive authenticated flows remain NOT TESTED here.

## Coordination
Bot B owns host/admin and map isolation. Bot A owns hunter checkout and test-card payment fixtures; coordinate booking IDs, don't duplicate charges. Developer owns application defects; Legal owns tax/legal interpretation. Retain NO-GO until actual browser, Stripe TEST, Supabase and test-inbox evidence reconcile. Historical payment runs are not new proof.
