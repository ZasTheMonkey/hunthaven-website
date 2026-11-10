# Landowner QA — 2026-11-09 22:17 ET

Scope: sandbox staging only. No real-user login, no production changes.

## PASS (code/static evidence)
- The landowner portal includes a mobile viewport declaration and a sandbox messaging bridge script.
- The bridge uses authenticated session bearer tokens for booking conversation reads/writes and escapes message body/preview HTML.
- Database inspection confirmed `booking_conversations` (id, booking_id, hunter_id, landowner_id, created_at) and `booking_messages` (id, conversation_id, sender_id, body, created_at). No read/unread column exists in either table.
- Fixed duplicate inbox polling: `showDashboard()` formerly created a new 10-second interval on every entry; now clears the prior interval and skips hidden tabs. Commit `9795f1aaf562b63294b13174d1694332c7fba464`. Verified source replacement and Cloudflare Pages deployment status active for that exact commit at 2026-11-10T03:17:25Z.

## FAIL / P1
- Bridge hides landowner unread badge rather than tracking read state; database has no read timestamp. Do not advertise unread counts/read receipts as functional.
- Legacy `conversations`/`messages` REST endpoints remain in the portal source but are superseded at runtime by the loaded bridge. Consolidation is needed to prevent fallback regressions.
- Polling the active conversation reloads the entire chat and forces scroll to bottom every 10 seconds, interrupting reading earlier messages. Requires UX fix with scroll preservation and race guards.

## BLOCKED
- Authenticated hunter-to-landowner E2E (thread creation, sender/recipient authorization, delivery, persistence, refresh, mobile Safari) blocked: QA accounts exist, but securely provisioned automation sessions are not available. No personal accounts used.
- Ownership verification, property editing, pricing/availability, booking approval/decline, Stripe TEST, and actual touch/mobile rendering not exercised this run.
- No real-device or browser automation results; only code and schema inspection.

## Release recommendation
NO-GO for claims of complete messaging reliability until authenticated cross-role tests, authorization checks and unread behavior are verified. No production deployment authorized.

## 2026-11-09 23:02 ET — Landowner inbox refresh correction
- **PASS (static/source):** Fixed landowner conversation refresh forcing scroll to the bottom. The owner now follows the existing hunter implementation: if near the bottom, remain at bottom; otherwise preserve scroll offset relative to content height. Commit `53b184a1cf0fedf177fa91f0ec93bc34e96e021d`. Retrieved the committed bridge source and verified both owner and hunter branches contain the scroll preservation logic.
- **PASS (deployment metadata):** Cloudflare Pages API independently reported `active` for exact commit `53b184a1cf0fedf177fa91f0ec93bc34e96e021d` (deployment created `2026-11-10T04:01:51Z`). This verifies deployment metadata, **not** actual rendered browser behavior.
- **BLOCKED:** Authenticated owner/hunter messaging E2E, message delivery, unread/read receipts, RLS access attempts, and mobile touch/keyboard testing still require securely provisioned QA sessions and browser access. No personal accounts used.
- **NOT TESTED:** Owner-drawn hunting boundaries, entry/parking map zones, hunter reviews, ownership verification, listing edit, pricing, availability, booking decisions, Stripe TEST regression, actual widths 320/375/390/430/768/1024/1280/1440/1920, and 200% zoom. No claims of launch readiness.
- **GO/NO-GO:** **NO-GO** for production; sandbox-only improvement. Follow up on map-zone authorization (owner-only mutation and cross-owner isolation), zone persistence/reload, and one-review-per-completed-booking eligibility once feature implementation lands.

## 2026-11-10 00:05 ET — Landowner inbox request ordering
- **PASS (source):** Landowner inbox could race concurrent polling/navigation loads: a slower older response could overwrite a newer conversation list or error. Added owner-only monotonically increasing request counter and success/error stale-result guards in `sandbox-messaging-bridge.js`. Commit `58110bab147d954cd5f57a0aa4be6be9dd87f6c4`. Re-fetched source and verified owner counter, both guards and unchanged hunter request counter.
- **PASS (deployment metadata):** Cloudflare Pages API reported deployment `5fdde4fc-f101-4fd9-9b5a-0b3a31415a2c` **active** at exact fix commit `58110bab147d954cd5f57a0aa4be6be9dd87f6c4`, created `2026-11-10T05:05:37Z`. This is deployment metadata, not browser verification.
- **BLOCKED:** Authenticated owner/hunter E2E, cross-owner RLS negative tests, map zones save/reload, review eligibility/moderation, booking and Stripe TEST regressions require securely provisioned QA sessions and/or feature completion. No personal sessions used.
- **NOT TESTED:** Real browser widths 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, ultrawide, 200% zoom, touch, keyboard, landscape/portrait. No browser automation was available this run.
- **NO-GO:** Sandbox code improvement only; no production release authorized.

## 2026-11-10 01:22 ET — Owner active-chat refresh ordering
- **PASS (source):** Found another race separate from inbox list ordering: two concurrent `loadLoMessages(id)` calls for the same conversation could complete out of order, letting older content overwrite newer messages or show stale errors. Added owner-only `ownerMessageRequest` sequence guards to both success and error paths. Commit `f2a7736024a611152329f4d8f9118a4dec43723b`. Re-fetched the bridge and verified both guards, with hunter inbox path still present.
- **PASS (deployment metadata):** Cloudflare Pages API returned `active` for exact code commit `f2a7736024a611152329f4d8f9118a4dec43723b`, deployment `5e05c857-5998-45da-a67f-f390d992e79c`, created `2026-11-10T06:21:45Z`. This does not verify browser execution.
- **BLOCKED:** Authenticated cross-role messaging, actual send/receive/persistence, map zone ownership/geometry save-reload, hunter-review eligibility and moderation, Stripe TEST checkout and RLS negative testing remain unverified without safely provisioned sessions and/or implemented features.
- **NOT TESTED:** Browser responsive widths 320,375,390,430,768,1024,1280,1440,1920, 200% zoom, real-device touch/keyboard and landscape. No automated browser evidence gathered this run.
- **NO-GO:** Production launch is not approved. No production, personal sessions, real users or live payment operations touched.

## 2026-11-10 02:23 ET — Preserve owner draft on mid-send conversation switch
- **PASS (source):** Found an owner-specific asynchronous send race: `sendLoMessage` captured the sending conversation ID for the network request, but still cleared the shared composer after send completion even when the landowner had switched to a different conversation and typed an identical draft. Scoped draft clearing and refresh to `loCurrentConvId===sendingConvId`. Code commit `632086094086b50cc98c5d684a1d80df87306f88`. Re-fetched the exact staging file and verified the new guard. This is source verification, not runtime browser testing.
- **PASS (deployment metadata):** Cloudflare Pages returned deployment `4076969c-4c1d-4f3a-b578-d6c65fd1d092` `active` at exact commit `632086094086b50cc98c5d684a1d80df87306f88`, created `2026-11-10T07:23:40Z`. Does not prove browser functionality.
- **BLOCKED:** Authenticated cross-role messaging, send/receive/persistence, owner-specific RLS, map zone save/reload and cross-owner isolation, reviews eligibility/moderation, Stripe TEST checkout regression: secure QA sessions unavailable; no personal login or real user data accessed.
- **NOT TESTED:** Responsive widths 320,375,390,430,768,1024,1280,1440,1920; zoom 200%; actual touch, keyboard and landscape browser checks. No browser harness used in this run.
- **NO-GO:** New map zones/reviews remain unverified; no automatic production launch. Sandbox only.

## 2026-11-10 03:26 ET — Accessible owner messaging error states
- **PASS (source):** Inspected current owner and hunter QA notes and the shared messaging bridge. Owner inbox/message load failures previously replaced text without an alert role, leaving screen-reader users without an explicit error announcement. Added `role=alert` and actionable load-failure copy on owner-only error paths, removing the alert role after a successful render. Code commit `d184658ada76cc9aec352d128e39ba1a4863f704`. Re-fetched staging bridge: both error messages and two alert-role assignments present; hunter send function retained. Static source inspection only, not a browser accessibility audit.
- **PASS (deployment metadata):** Cloudflare Pages API reports `active` deployment `a6c9a1e2-355b-405d-a0fd-ed6040df83b5` at exact code commit `d184658ada76cc9aec352d128e39ba1a4863f704`, created `2026-11-10T08:26:10Z`. No browser execution asserted.
- **BLOCKED:** Authenticated landowner/hunter send/receive, RLS negative checks, ownership verification, property map save/reload and cross-owner access, reviews eligibility/moderation, booking and Stripe TEST regression: no securely provisioned QA sessions; personal accounts untouched.
- **NOT TESTED:** Browser widths 320,375,390,430,768,1024,1280,1440,1920, ultrawide, 200% zoom, touch/keyboard/landscape, actual screen-reader announcement; browser harness unavailable.
- **NO-GO:** Premium redesign and new map/reviews features remain unverified. Production unchanged.

## 2026-11-10 03:45 ET — Owner inbox draft isolation
- **PASS (static):** Found owner composer shared across threads; switching conversations retained the prior recipient's draft, creating a wrong-recipient sending risk. Added per-conversation draft storage/restoration, plus clearing the saved draft only when that conversation's send succeeds and its content is unchanged. Code commit `92b7cc2fb381d178aa93cc81f5e1a2c314b38aa8`. Re-fetched the updated staging bridge and confirmed guards. No authenticated account accessed.
- **PASS (deployment metadata):** Cloudflare Pages returned `active` deployment `ed67f744-7a15-46f6-bed2-499e88fa9721` at exact code commit `92b7cc2fb381d178aa93cc81f5e1a2c314b38aa8`, created `2026-11-10T08:45:43Z`. This confirms deployment metadata, not runtime functionality.
- **BLOCKED:** Authenticated owner/hunter message sending, conversation switching E2E, map boundary/entry/parking persistence and cross-owner authorization, reviews eligibility/moderation, property onboarding/booking and Stripe TEST regression lack securely provisioned synthetic QA sessions. No personal or real user data accessed.
- **NOT TESTED:** Browser widths 320,375,390,430,768,1024,1280,1440,1920; 200% zoom; mobile touch, desktop keyboard, actual screen-reader behavior. No browser harness was available this run.
- **NO-GO:** Security and end-to-end acceptance remain unverified; production release prohibited.

## 2026-11-10 05:22 ET — Optional landowner unread badge guard
- **PASS (source inspection):** The owner inbox refresh unconditionally accessed `document.getElementById('lo-unread-badge').style`, which throws if the optional badge is absent, causing a successfully loaded inbox to be replaced by an error. Added a null guard, leaving unread counts explicitly disabled until a secure read-state schema exists. Code commit `175ac42585b35f311301bec36667f3c7c9b55d44`. Re-fetched staging source: new guard present, unsafe direct access absent, owner/hunter send functions retained. This is source verification only.
- **PASS (deployment metadata):** Cloudflare Pages project `leasewild-sandbox` reported deployment `e57a469a-d5d6-4d75-85e7-a3448b1ea600` active for exact code commit `175ac42585b35f311301bec36667f3c7c9b55d44`, created `2026-11-10T10:22:26Z`, branch `staging/leasewild-full-clone`. Cloudflare's `environment=production` describes the sandbox Pages project's deployment environment, **not** leasewild.com. No live site touched. Deployment metadata does not prove browser execution.
- **BLOCKED:** Authenticated owner/hunter messaging, cross-owner RLS, map create/edit/save/reload, reviews one-per-completed-booking and moderation, ownership verification, booking and Stripe TEST checkout regression: no securely provisioned QA sessions. No personal login or real user data accessed.
- **NOT TESTED:** Browser widths 320/375/390/430/768/1024/1280/1440/1920, 200% zoom, touch/keyboard/landscape, actual screen-reader announcements; no browser harness executed.
- **NO-GO:** New features and security critical paths remain unverified. Sandbox-only fix, no production launch authorized.

## 2026-11-10 05:49 ET — Pre-7AM hunter-review security review
- **FAIL (static, P0 if draft deployed):** The proposed `hunter_reviews` INSERT RLS policy checked booking completion and reviewer identity but did not constrain `moderation_status`. A client could explicitly insert `moderation_status='published'` despite its default of `pending`, bypassing the moderation queue. Corrected the **review-only, guarded, non-executable draft** to require `moderation_status='pending'` in the INSERT WITH CHECK policy. Draft commit `fe4fe19558ee68a03235f1d1d22aa6e423cbd2f0`. This is a static contract fix, not a database migration or deployed application fix.
- **FAIL / DESIGN BLOCKER (static):** The draft public catalog uses a `security_invoker=true` view and then revokes base `public.listings` SELECT from `anon`; under invoker rights this may break anonymous catalog reads. Requires coordinated grants/RLS design and synthetic read tests before any migration. Do **not** apply the draft unchanged.
- **PASS (source inspection only):** The guarded SQL draft contains an intentional exception and rollback; no schema execution was performed. Existing unique booking constraint proposes one review per booking; actual enforcement untested.
- **BLOCKED:** No secure owner/hunter QA sessions; authenticated review insertion, moderation, owner isolation, map zone create/edit/save/reload, listing and booking workflows, messaging, Stripe TEST and RLS negative cases cannot be declared passed.
- **NOT TESTED:** Browser widths 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, ultrawide, 200% zoom, touch/keyboard/landscape. No browser test evidence gathered.
- **Deployment:** Documentation-only changes; Cloudflare deployment for these commits has **not** been independently verified. No production release or database change authorized.
- **NO-GO:** Moderation and catalog permission design require review before implementation; cross-role E2E and responsive acceptance remain unverified.

## 2026-11-10 06:55 ET — Pre-7AM landowner security and deployment handoff
- **PASS (coordination):** Read current landowner/hunter QA, launch-readiness, README and access-zone/review draft on staging. Latest independently observed GitHub branch head before this report: `608354934b273826c694084033144d7d2fbffb4a` (team content change). No conflicting application file edited.
- **FAIL / P1 DESIGN (static, unapplied):** The draft zone SELECT policy includes `b.status in ('confirmed', 'paid', 'completed')` without a time-window/expiration restriction. A hunter with a historical completed booking could continue reading exact entry/parking/hunting coordinates indefinitely. Require a reviewed post-booking access cutoff, cancellation/refund semantics, and server-side authorization before applying the draft. This is a **potential policy defect in an unapplied design**, not a demonstrated production exposure.
- **PASS (static):** Reviewed hunter-review INSERT RLS: `moderation_status='pending'`, completed booking identity match, and unique booking constraint are present in the current guarded draft. No actual RLS or moderation runtime was tested.
- **PASS (independent deployment metadata):** Cloudflare Pages `leasewild-sandbox` most recent observed deployment `597985c5-9755-413c-ba79-68c95e107d23` reports `success`, branch `staging/leasewild-full-clone`, exact commit `608354934b273826c694084033144d7d2fbffb4a`, created `2026-11-10T11:38:14Z`. Cloudflare calls this sandbox project's `production` environment; this is **not** leasewild.com. No rendered browser evidence in this run. This report commit's deployment is not verified by that earlier deployment.
- **BLOCKED / NOT IMPLEMENTED:** Map-zone create/edit/save/reload, owner B denial, hunter zone visibility cutoff, hunter review one-per-completed-booking, moderation and reports: draft SQL is unapplied and runtime features absent according to shared readiness. Sandbox database identity/schema and secure synthetic QA sessions remain unverified. Do not claim E2E PASS.
- **BLOCKED:** Ownership verification, listing create/edit, pricing/availability, booking approval/decline/cancellation, messaging cross-role send/receive, and Stripe TEST payment/refund/webhook regression require secure QA sessions and verified sandbox environment; no personal sessions or payments accessed.
- **NOT TESTED:** Browser widths 320/375/390/430/768/1024/1280/1440/1920/2560, zoom 200%, touch, keyboard, landscape, screen reader. No browser harness used in this run.
- **NO-GO:** Do not launch to production. Obtain explicit sandbox project mapping and secure synthetic QA accounts, resolve zone-retention policy and private catalog design, implement UI and schema, then run authorization and responsive E2E.

## 2026-11-10 — P0 access-zone privacy guard (current interactive session)
- **PASS (static/source):** Read latest staging commits and shared landowner/hunter QA and launch sprint coordination notes. Found draft zone SELECT policy granting exact coordinates to hunters on booking status alone, including completed bookings with no expiry. Replaced the draft's hunter SELECT policy with a fail-closed `using (false)` hold until booking time-window and cancellation/refund rules can be safely derived from the actual sandbox schema. Source commit `f6c456e4ad2473b339866bf3a6a4f8dfb42f7b79`; independently re-fetched staging file and confirmed the unsafe status-only clause is absent and the hold is present.
- **NOT TESTED:** SQL execution, database RLS, zone save/reload, owner/hunter E2E, booking, messaging, payments, responsive browser widths. Draft still contains an intentional exception and rollback and **was not migrated**. This change is documentation/design protection only, not a runtime fix.
- **BLOCKED:** Precise hunter-zone access requires actual sandbox booking time columns/status semantics, owner/hunter synthetic sessions and security/legal review before enabling; do not claim functional map feature.
- **NOT VERIFIED:** Cloudflare deployment for this change; GitHub commit is not deployment evidence.
- **NO-GO:** No production release or live-system changes.
