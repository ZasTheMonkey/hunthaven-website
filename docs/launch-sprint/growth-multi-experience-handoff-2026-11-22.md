# Growth Research — outfitter multi-experience conversion handoff (2026-11-22 19:30 ET)

Scope: `staging/leasewild-full-clone` only. This note is source-inspection evidence, **not** a successful browser or payment test. No production access authorized.

## Confirmed source defect (FAIL, static inspection)
- `outfitters.html` directory counts rows by `user_id`; if count > 1 it renders nonclickable title/photo/action with "Booking temporarily unavailable". Otherwise it builds `outfitter-experience.html?id=<user_id>`.
- `outfitter-experience.html` fetches active `outfitter_listings` filtered by `user_id`, rejects >1 matching row, and inserts `outfitter_booking_requests` using `outfitter_id` from the query string. No listing ID is passed through the public booking journey.
- Consequence: an outfitter with multiple active experiences cannot receive a request for a specific trip from public discovery. Do **not** simply enable the links; that would make booking ambiguous.

## Cross-role ownership / implementation sequence
1. **Growth Research (this role):** directory links should carry a unique `outfitter_listings.id` after backend support is confirmed; retain accessible fail-closed state for legacy/ambiguous links; validate empty, one, multiple listings and keyboard/mobile discovery.
2. **Hunter QA:** coordinate a listing-scoped request schema and hunter-side trip identity, including stale/inactive listing and cross-owner negative cases.
3. **Landowner QA / host:** ensure outfitter host approval and reservations resolve the same listing and do not conflate multiple trips under one host.
4. **Payment QA / shared Stripe gate owner:** verify accepted listing identity survives TEST authorization, capture, webhook, cancellation/refund and 20% Connect routing; avoid altering current working payment path until regression evidence is green.
5. **Other growth/design role:** inspect directory photo CSS cascade and image crop at 320,375,390,430,768,1024,1280,1440,1920,2560 widths; static rules alone do not prove visual defects.

Before any migration: verify sandbox Supabase project identity and actual table columns/RLS, add reversible migration and tests, then implement request-detail-routing changes atomically or behind a safe compatibility gate. Preserve existing `outfitter_id` for payout/host identity; add explicit listing ID rather than repurposing the column.

## Verification and release status
- PASS: inspected staging source and existing launch-gate report (GitHub blob SHAs: directory `32f7df1ef1ad21b897283959c0e318bcefb607bf`; detail `045cad62340da384bb153d6a87d6031b2a8a6363`; launch gate `211cbf2939e3ca45ec10f462b8450ece836ee088`).
- FAIL: multi-experience conversion path as described.
- NOT TESTED in this run: live sandbox inventory, rendered viewport matrix, authenticated request, Stripe TEST transaction, database reconciliation, independent deployment.
- Existing gate (historical only): 2026-11-14 workflow 43634277042 had 7 passed / 3 skipped. Receipt inbox, external-bank payout, partial refund, Stripe Tax registration/classification and other gates remain open. **NO-GO**.

This is a coordination-only commit; no application, database, payment, or deployment changes.
