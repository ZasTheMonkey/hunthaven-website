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
