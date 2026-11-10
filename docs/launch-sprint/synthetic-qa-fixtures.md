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

## Landowner QA — 2026-11-10 15:06 EST
- **FAIL (source review, fixed):** Clicking Draw boundary with a partial manually entered hunting polygon or existing trail points allowed the next pointer trace to replace those unsaved points silently. The earlier zone-type and Clear safeguards did not cover this path.
- **FIX:** Draw boundary now asks for confirmation before starting a new trace that would replace partial boundary or trail points; cancellation retains the draft. Complete hunting polygons still follow the existing named-draft queue flow. Staging commit `04fdb11d1c2d4a5be6e98c6a27092c013fe65db1`.
- **PASS (Cloudflare deployment metadata):** Queried Cloudflare Pages project `leasewild-sandbox` directly. Its configured production branch is `staging/leasewild-full-clone` (the Pages environment name does **not** mean live leasewild.com). Deployment `90442d56-b998-48ac-ab79-60588df140c0` reports `deploy: success` at 2026-11-10T20:06:09Z, with exact Git commit `04fdb11d1c2d4a5be6e98c6a27092c013fe65db1`; URL `https://90442d56.leasewild-sandbox.pages.dev`. This confirms the sandbox build reports the fix deployed, **not** browser-level functionality.
- **NOT TESTED:** Browser response content and actual authenticated mouse/touch tracing, confirmation/cancel, save/reload, viewport matrix, property verification, reviews, messaging, booking and Stripe TEST-mode. These need browser E2E, not merely API metadata.
- **Coordination:** Design bot should assess confirmation language and mobile usability; developer bot should test pointer capture and interrupted traces; hunter QA should ensure private map zones never appear in public listing payloads. Do not touch GitHub main, live leasewild.com, or production payment/data.

## Landowner QA — 2026-11-10 16:04 EST
- **FAIL (source inspection, fixed):** On `pointercancel` during touch/pointer drawing, the map editor unconditionally set `points=[]`, silently discarding every sampled point from the interrupted trace. This contradicted other newly added unsaved-draft protections.
- **FIX:** Preserve sampled points on cancellation, exit drawing mode, rerender the draft, and explain how to continue with map taps, Undo or explicit Clear. Commit `ab1f7a9d8e1f6d5159ca1640c1f7974f06cde100` on staging only.
- **PASS:** Targeted source replacement committed. Cloudflare Pages deployment listing confirms a build for that exact SHA started at `2026-11-10T21:04:06Z` on `leasewild-sandbox` branch `staging/leasewild-full-clone`.
- **PENDING:** At initial check the Cloudflare build was **active**, not successful. Do not report this commit as deployed until the deploy stage succeeds.
- **NOT TESTED:** Authenticated browser pointer cancellation, polygon save/reload, viewport matrix, verification, bookings, messaging, completed-booking reviews, Stripe TEST-mode payments. Existing payments untouched.
- **Coordination:** Design bot to validate mobile cancellation messaging and touch UX; developer bot to validate pointercancel on iOS Safari and Android Chrome; hunter QA to continue owner/hunter isolation tests. No live domain, GitHub main or production resources touched.

## Landowner QA — 2026-11-10 17:41 EST
- **PASS (Cloudflare API, deployment metadata):** The previously pending `ab1f7a9d8e1f6d5159ca1640c1f7974f06cde100` pointercancel fix deployed successfully as Pages deployment `89e2f891-452d-469b-83ed-430ce8f13b4e` (deploy completed `2026-11-10T21:04:17.397347Z`), URL `https://89e2f891.leasewild-sandbox.pages.dev`. Latest inspected successful sandbox deployment is `aa9b5540-353e-4fb8-b9c1-c78cacfbf172`, commit `8f00413407ff0cfd3f85aa607acc8d7e0552a48c`, completed `2026-11-10T22:18:13.805634Z`. Both are on the staging branch; Cloudflare metadata does not prove interactive UI behavior.
- **PASS (sandbox RLS simulation):** Separate rollback-only authenticated role queries for synthetic Owner A `103c4605-f279-4f87-a677-1ac2b46df373` and Owner B `856cfc35-9589-44e1-987c-e2fbb619dd9b` on the synthetic Owner A draft listing `d626d2e9-d9a0-47a1-8433-fd04a3948b4e` returned respectively 3 and 0 accessible `listing_access_zones` rows. This confirms this read-isolation case, not all write policies or browser identities.
- **NOT TESTED:** Actual browser HTTP content, authenticated map draw/save/reload, viewport/touch/keyboard/zoom matrix, property verification, bookings, messaging, hunter reviews, Stripe TEST mode. Do not imply E2E success from database RLS or deployment status.
- **Coordination:** Hunter QA: validate public/booking payloads do not expose private access coordinates. Design/developer: prioritize browser pointercancel and small-screen map editing. Legal: assess access-map visibility timing. Payments remain untouched. No production resources or main branch accessed.

## Landowner QA — 2026-11-10 18:29 EST
- **FAIL (source review, fixed):** Leaflet map `click` handler could run after pointerup/pointercancel of a completed pointer trace and append an unintended extra polygon/trail corner. The pointer handler finished drawing before the browser's synthesized click, so `add()` no longer saw `drawing=true`.
- **FIX:** Suppress map click events for 500ms after ending/canceling a pointer trace; normal subsequent map taps still work. Staging commit `881630ee64e280ef8f4c1f6bcfea88b96fd6130a`. No payment or production code touched.
- **PASS:** Targeted source edit committed to staging; reread required to confirm exact deployed source.
- **NOT TESTED:** Actual touch/mouse synthesized-click behavior, authenticated save/reload, deployment completion, viewport matrix, property verification, booking, messaging, reviews, Stripe TEST payments.
- **Coordination:** Developer/design bot: verify pointerup/click ordering on iOS Safari and Android Chrome; hunter QA: ensure boundary geometry is never exposed prebooking. Run touch and keyboard matrix before treating fix as E2E passed.

## Landowner QA — 2026-11-10 18:43 EST
- **FAIL (source-level UX):** Trail coordinate taps incorrectly announced `Boundary corner added ... of at least 3`, although trails require only two points. Completed trail traces also announced `Boundary traced` and `outline`, which misled landowners using live status messages and assistive technology.
- **FIX:** Trail-specific status guidance now says `Trail point added ... of at least 2` and `Trail traced ... Review the route`; hunting polygon messages remain unchanged. Staging commit `ede6bae2486c679e1193f8013f13eebfeb0dc8ec`.
- **PASS:** Staging source replacement committed. **NOT TESTED:** Browser/assistive-technology announcement, responsive widths, real authenticated drawing/save/reload, Cloudflare deployment of this commit, property verification, reviews, bookings, messaging, Stripe TEST mode.
- **Coordination:** Design bot to review mobile/live-region clarity; developer bot to verify no other trail UI assumes 3 points; hunter QA to verify private zones remain hidden from hunters. No production or main access.
