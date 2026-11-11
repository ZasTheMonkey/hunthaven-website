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
