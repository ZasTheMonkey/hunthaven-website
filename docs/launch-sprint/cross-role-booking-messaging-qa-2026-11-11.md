# Immediate owner directive: booking and messaging cross-role sandbox QA

Owner requested bots test bookings and messaging across EVERY account role. Sandbox only; no real users, live site/main or live Stripe.

## Test assignments
- Hunter QA: create/use dedicated synthetic hunter; request landowner and outfitter bookings; send and receive messages with both; test refresh, unread indicators, ordering, sender labels, notifications, cancel/decline/expired cases, mobile/keyboard, cross-account isolation.
- Landowner QA: use dedicated synthetic landowner and property; verify hunter message arrives, reply delivered, booking accept/decline/approval, availability conflict, date expiry, cancellation and conversation lifecycle; no unauthorized message access.
- Designer/Developer: inspect/fix cross-role messaging and booking code, test outfitter identity on both sides (hunter↔outfitter), listing/editing/reservations navigation, notifications, mobile rendering, concurrency and permissions; deploy and independently retest sandbox.
- Growth Research: verify browse→listing→request→messages→confirmation conversion and accessible navigation, no demo inventory passed as real.
- Legal: confirm post-booking message deletion/retention, privacy and cancellation policy alignment.

## Mandatory matrix
Hunter→Landowner; Landowner→Hunter; Hunter→Outfitter; Outfitter→Hunter; booking requested/accepted/declined/cancelled/expired/completed; duplicate submissions; access denial across unrelated users. Verify actual DB rows and UI delivery with synthetic IDs. Use unique test fixture prefixes per role to prevent collisions. Record PASS/FAIL/BLOCKED/NOT TESTED, steps, evidence, IDs, commits, deployment SHA, and cleanup. Fix bugs autonomously on staging only. Payment testing remains TEST mode and is not waived.

## Current status
NOT TESTED in this coordination pass: authenticated cross-role UI messaging and booking journeys. This document is a task assignment, not evidence of passing tests.

## Immediate execution — fresh read-only sandbox checks
- PASS: All four existing QA automation run-now requests were accepted, but returned `Ready to run in this conversation` / inline execution, **not** independently completed background bot runs.
- PASS: Verified project `kbkdfpmlyggfijkyjxoi` sandbox tables: `booking_conversations` 4 rows, `booking_messages` 6 rows, `outfitter_booking_requests` 2 rows, `sandbox_threads` 0 rows, `sandbox_thread_messages` 0 rows. These are historical records, not fresh delivered-message proof.
- PASS (static policy review): `booking_messages` SELECT/INSERT policies restrict to conversation participants, sender ID must equal `auth.uid()`, and require `leasewild_sandbox_conversation_active`. `booking_conversations` SELECT similarly restricts participants; `outfitter_booking_requests` INSERT checks authenticated hunter, valid date and active outfitter; SELECT restricts hunter or outfitter. This is **not** a verified impersonation/negative-case test.
- REVIEW: No `outfitter_id` or `request_id` column exists in the inspected `booking_conversations` or `sandbox_threads` schemas. Outfitter message linkage and its UI path need explicit Designer/Hunter QA verification; do not assume outfitter↔hunter messaging works.
- NOT TESTED: Authenticated synthetic hunter↔landowner and hunter↔outfitter message delivery, booking state transitions, persistence, unread counters, notification dispatch, privacy negative tests, UI mobile rendering, deletion/retention, and cleanup. No synthetic user credentials or browser session were provisioned in this run; no real records were altered.
- Handoff: provision dedicated sandbox-only identities through approved Auth flow and run the complete matrix; record actual fixture IDs, redacted evidence and cleanup before PASS. Avoid test assertions using admin/service-role bypass, which would not exercise RLS.
