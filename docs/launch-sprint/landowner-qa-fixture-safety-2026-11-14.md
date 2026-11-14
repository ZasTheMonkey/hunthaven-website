# Landowner QA fixture safety and coverage handoff — 2026-11-14 11:24 ET

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev ONLY. This note is STATIC-ONLY; no new browser execution, test payment, migration, or deployment was performed.

## Confirmed from current staging host.spec.mjs

- Authenticated entry-area and parking-area tests require QA_LANDOWNER credentials and QA_LANDOWNER_LISTING_ID; both use fixed points (29.020,-80.930), (29.021,-80.930), (29.021,-80.929). These coordinates are not derived from the verified synthetic listing's location or boundary. Before enabling these writes, validate that the listing fixture is in this geographic area or parameterize coordinates from a fixture-specific bounding box. Do not use a real listing.
- Each persistence test saves a unique labeled zone, reloads, checks one saved row, and attempts deletion in finally. Cleanup only runs when the row is visible; a failed save with a persisted backend record but missing UI row could leave a synthetic zone. Reconcile by unique QA label and listing ID after any failure, and clean up only confirmed synthetic records.
- The second-landowner negative case requires QA_SECOND_LANDOWNER credentials. A browser denial is not proof of Supabase RLS; independently test read/write restrictions using the separate synthetic identity and verified sandbox project.
- The host spec currently has no authenticated hunting_area save/reload/delete case and no completed-booking hunter review, verification upload/approval, owner messaging or host reservation lifecycle assertion. Existing green dashboard and anonymous editor checks cannot close those gates.

## Next-run execution sequence

1. Verify the exact sandbox Supabase project and synthetic listing ownership, coordinates, and disposable status; provision missing QA_LANDOWNER_LISTING_ID and QA_SECOND_LANDOWNER runner secrets without logging values.
2. Run existing entry/parking and second-owner Playwright tests against the deployed sandbox with screenshots, job URL and artifact IDs; inspect fixture cleanup after both pass and fail.
3. Add authenticated hunting boundary persistence and completed-booking hunter-review permissions after verifying actual UI selectors; coordinate with Hunter QA on the synthetic completed booking and avoid duplicate card charges.
4. Independently reconcile owner reservation, messages, receipt outbox, Connect TEST accounting, tax and refunds against the payment team's latest test-only IDs.

Statuses: STATIC-ONLY inspection PASS; new real-browser executions NOT TESTED; fixture geographic safety NOT VERIFIED; authenticated owner zone persistence NOT VERIFIED; database RLS NOT TESTED; payment and payout NOT TESTED in this invocation. Overall launch NO-GO. No production/main/live access.
