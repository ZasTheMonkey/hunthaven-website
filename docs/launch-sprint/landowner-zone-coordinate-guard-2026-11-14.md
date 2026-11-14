# Landowner QA — fixture-specific coordinate safety guard (2026-11-14 13:15 ET)

Scope: GitHub `staging/leasewild-full-clone` only. No live/main, production Supabase, or Stripe access.

## Change

The existing authenticated entry-area and parking-area Playwright tests no longer insert fixed latitude/longitude points `29.020,-80.930`, `29.021,-80.930`, `29.021,-80.929` into arbitrary fixtures. Both now require `QA_LANDOWNER_ZONE_POINTS` in addition to synthetic landowner credentials and `QA_LANDOWNER_LISTING_ID`. Format: three or more `latitude,longitude` pairs separated by semicolons (e.g. `29.020,-80.930;29.021,-80.930;29.021,-80.929` **only for a verified synthetic fixture at those coordinates**). Values must be finite and inside valid global latitude/longitude ranges. Absent/invalid points cause an explicit test skip before authentication or database writes. This prevents accidental use of the prior hardcoded geographic fixture. Commits `baca8034252317b33b03106f45011e3d9bb98835` and syntax correction `4168bc3c5b80c956e84f2e36335f28b45e7ab82a`.

**Important:** The runner must still independently verify that the ID is disposable, belongs to the configured owner, and that the coordinates are within the property's actual bounds. Range validation alone cannot establish ownership or geographic correctness. Existing finally-cleanup only deletes visible rows; on partial save failures, reconcile uniquely labeled records by verified sandbox listing ID before cleanup. Do not enable write tests without these checks.

## Evidence and open gates

**STATIC-ONLY** GitHub source verification: two authenticated zone tests now consume fixture-specific points. **NOT TESTED:** fresh browser run, Cloudflare deployment, real saved/reloaded polygons, cleanup under failure, database RLS, property verification, completed-booking hunter reviews, owner messages, reservations, Stripe TEST payment and receipt. This change is test harness safety only, not a marketplace application fix.

Coordinate with Hunter QA to reuse an existing disposable booking instead of charging another card, and with the developer to avoid simultaneous edits to `host.spec.mjs`. Do not call launch-ready until the Stripe launch gate and privacy/legal checks are closed. **NO-GO.**
