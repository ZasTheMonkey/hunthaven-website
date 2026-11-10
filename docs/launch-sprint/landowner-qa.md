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
