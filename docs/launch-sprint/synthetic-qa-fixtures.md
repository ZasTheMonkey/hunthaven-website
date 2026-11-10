# LeaseWild synthetic QA fixtures — staging only

**Environment:** Supabase project `kbkdfpmlyggfijkyjxoi`. Never run against production.

## Accounts to provision through Supabase Auth (not raw SQL)
- `qa-owner-a`: dedicated synthetic landowner A
- `qa-owner-b`: dedicated synthetic landowner B
- `qa-hunter`: dedicated synthetic hunter

Use three distinct, controlled test inboxes (aliases are fine if deliverable). Create via supported Supabase Auth Admin API or normal sign-up flow, verify email as configured, and store credentials only in an approved secret manager. Do **not** insert directly into `auth.users`, use real customer accounts, commit passwords, or expose service-role keys in the browser.

## Required synthetic records
1. Owner A creates a clearly labeled `QA ONLY — Owner A` inactive/draft listing; owner B creates a separate `QA ONLY — Owner B` inactive/draft listing. Keep fixtures nonbookable publicly.
2. Owner A draws one valid hunting polygon, one entry point, one parking point. Owner B must not read/update/delete A's zones.
3. Hunter makes a sandbox booking through the actual test checkout flow (Stripe TEST only) for a temporarily bookable **sandbox-only** listing. Do not fake paid status or invent a successful charge.
4. Check owner A approval, hunter notification, message access, cancellation/expiry, and owner B cross-booking denial.
5. For review testing, create an explicitly labeled historical test booking/payment fixture with authenticated QA identities and known eligible state **only after** validating the booking/payment constraints and separating it from Stripe accounting. Never mark a fabricated payment as an actual Stripe charge.
6. Submit one review as owner A; ensure duplicate review rejected, hunter sees only published reviews, owner B cannot submit for A's booking, and hunter cannot review themselves.

## Execution and evidence
- Record Auth user UUIDs and fixture UUIDs in private QA tracking, never credentials in Git.
- For each case capture HTTP status, relevant RLS error code, screenshot at desktop/tablet/mobile, and cleanup confirmation.
- Delete QA bookings, payment fixtures, reviews, zones, listings and synthetic Auth accounts in dependency order after tests. Never delete actual user data.
- **Go-live gate:** no production merge/deploy until the user explicitly says `Go Live!!`.

## Current status
The available Supabase connector exposes SQL, migrations and project inspection, but not Auth Admin create-user operations. Therefore these three **real sign-in accounts have not been provisioned**. Previous RLS tests simulated a JWT subject within a rolled-back SQL transaction; they are not authenticated browser tests.

## Authorized test inbox aliases (2026-11-10)
The user approved using Gmail inbox `roamquestlx@gmail.com` for these dedicated **sandbox-only** signup aliases:
- Owner A: `roamquestlx+leasewild-owner-a@gmail.com`
- Owner B: `roamquestlx+leasewild-owner-b@gmail.com`
- Hunter: `roamquestlx+leasewild-hunter@gmail.com`

These are proposed identifiers, **not verified Auth users**. Gmail plus-addressing generally routes to the base inbox. Supabase Auth signups, email verification and actual sessions must still be completed through supported Auth flows. Never store passwords, OTPs, or service-role keys in Git.

## Created sandbox fixtures — 2026-11-10
- All three Gmail alias Auth users verified and email-confirmed:
  - Owner A `103c4605-f279-4f87-a677-1ac2b46df373`
  - Owner B `856cfc35-9589-44e1-987c-e2fbb619dd9b`
  - Hunter `58356c6f-35b7-42c1-b9da-164863ea0cbb`
- Owner A listing `d626d2e9-d9a0-47a1-8433-fd04a3948b4e`, status `draft`
- Owner B listing `89eda82e-9b1e-460e-9946-b33f3eaa8057`, status `draft`
- Owner A test booking `fbcae70b-a4dc-41fd-ac9a-af47176b170b`, status `pre_reserved`, 2026-12-01 to 2026-12-02
- Owner B test booking `b04757c3-a801-4557-a765-44b213586db5`, status `pre_reserved`, 2026-12-03 to 2026-12-04
- Both bookings explicitly labeled QA ONLY; both listings are draft and must not be publicly bookable. These bookings are database fixtures, **not** proof of end-to-end booking flow or Stripe payment.
- Verification query: two draft listings, two pre_reserved bookings, **zero** `lease_payments` linked to test bookings.
- Cleanup: delete these booking IDs first, then these listing IDs, only after tests and dependency inspection. Do not delete unrelated records.

## Owner A versus Owner B zone RLS test — 2026-11-10
- Transactional SQL test with `SET LOCAL ROLE authenticated` and simulated `request.jwt.claim.sub` for the real synthetic QA Auth user IDs.
- Owner A INSERT of a temporary `entry` Point into Owner A draft listing succeeded.
- Switched JWT sub to Owner B in same transaction: Owner B SELECT of Owner A zones returned `0` rows.
- `ROLLBACK` performed; independent follow-up count confirmed `0` saved zones for Owner A fixture.
- **PASS:** Owner A INSERT authorization; Owner B cross-owner SELECT isolation; cleanup.
- **NOT TESTED:** Browser login, cross-owner UPDATE/DELETE, positive persistent map save/reload, payments, bookings through UI.

## Cross-owner UPDATE/DELETE and map code inspection — 2026-11-10
- Within a rolled-back transaction, simulated Owner A inserted an entry point on Owner A's draft listing. Switched to Owner B: UPDATE and DELETE targeting Owner A's zone returned zero affected rows. Switched back to Owner A: original label remained unchanged.
- Follow-up query after rollback confirmed no persistent test zone.
- **PASS:** cross-owner UPDATE/DELETE isolation at database RLS layer (simulated JWT, not browser sessions).
- **FIX:** `sandbox-zone-editor.html` initialized `savedLayers=L.layerGroup()` then called `savedLayers.getBounds()`, which Leaflet LayerGroup does not implement. Changed to `L.featureGroup()`, which supports getBounds, in staging commit `e5cea173fbc7b383054980ca1c61e1f71d90694b`.
- **PENDING:** actual browser map save/reload, mobile responsiveness and deployment verification; do not mark these passed based on source inspection.

## Persistent sample map fixtures — 2026-11-10
- Owner A draft listing `d626d2e9-d9a0-47a1-8433-fd04a3948b4e` now has three **QA ONLY** synthetic features (not real property boundaries):
  - polygon `46c222f7-979a-406a-8986-12d35fa6e627`
  - entry `e196625e-12b1-4429-876b-cf8d92908032`
  - parking `4d5dae58-c353-4f03-9d6f-54f6805dff85`
- Simulated authenticated Owner A SELECT saw all 3 features; simulated Owner B SELECT saw 0.
- Staging `supabase-config.js` references sandbox project `kbkdfpmlyggfijkyjxoi` (public anon client; no secret value recorded).
- Map editor Leaflet `L.featureGroup` bounds fix committed previously, but browser rendering and deployment still **unverified**.
- Cleanup: remove the above three feature UUIDs before deleting the Owner A draft listing. Do not remove unrelated zones.

## Landowner QA — 2026-11-10 13:14 EST
- **FAIL (source review, fixed):** In `sandbox-zone-editor.html`, selecting Draw boundary after a completed polygon silently auto-queued a draft without requiring its name. This conflicted with `save-all` validation and left a user with an un-saveable unnamed queued boundary.
- **FIX committed:** `8eb00793b0e343081dec85c5440728a1b0a313c5` now requires a nonempty label before the auto-queue transition, focuses the label input, and preserves the polygon for correction.
- **PASS:** exact source path located and targeted replacement committed on staging branch.
- **NOT TESTED:** browser drawing/keyboard/touch, mobile widths, Cloudflare deployment, property verification, completed-booking reviews, bookings/messaging, Stripe TEST-mode flow. No live or main changes.
- **Coordination:** Map-editor UX defect and fix recorded here for design/developer, hunter QA, legal and market research bot review. Follow-up: confirm drawn polygon persists after reload and verify 320/375/390/430/768/1024/1280/1440/1920/2560 widths with authenticated sandbox browser.

## Landowner QA — 2026-11-10 14:10 EST
- **FAIL (source review, fixed):** Clear draft erased all queued hunting boundaries without confirmation; switching zone type silently erased the active unsaved drawing.
- **FIX:** `sandbox-zone-editor.html` now confirms destructive Clear when there is any active/queued draft; zone-type switching confirms loss of active drawing and restores the previous selection if canceled. Queued drafts are preserved on zone-type switch. Commit `b39aad7c396dbdb80c929a4ec03203ead31478d5`.
- **PASS:** GitHub staging file reread verified both changes and removal of the previous unconditional clear handler.
- **NOT TESTED:** actual browser confirm/cancel interactions, keyboard/screen-reader behavior, map reload, all requested viewport widths, deployment, booking/messaging/reviews and Stripe test flows. No production or main branch changes.
- **Coordination:** Design and hunter QA should validate confirmation copy and mobile tap flows; developer should assess pending-draft persistence when navigating away.
