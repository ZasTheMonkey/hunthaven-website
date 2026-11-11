# Hunter QA — sandbox synthetic E2E acceptance matrix (2026-11-11)

**Scope:** `staging/leasewild-full-clone` and `leasewild-sandbox.pages.dev` only. No production Supabase, live Stripe, customer sessions, main branch or live website. This is an executable test specification, **not evidence that tests passed**.

## Prerequisites and safety
1. Confirm Cloudflare deployment's Git SHA equals the intended staging commit and sandbox Supabase project identity is separate from production. Never copy production credentials.
2. Use three dedicated disposable sandbox identities: owner A, hunter A and unrelated hunter B (plus owner B for ownership isolation). Use synthetic listings, no real addresses or access points. Verify all keys/payment endpoints are TEST-only before checkout.
3. Record each case as PASS/FAIL/BLOCKED/NOT TESTED with test identity aliases, timestamp, deploy SHA, response/status evidence (redact tokens), and cleanup results. Treat provider deployment success as metadata only.

## Hunter journey / negative tests
| ID | Action | Expected evidence / acceptance |
|---|---|---|
| H01 | Hunter A searches a synthetic published listing by location and filter, opens detail | Real persisted listing returned, filters match; unpublished listing excluded. |
| H02 | Owner A draws boundary, entry, parking and access trail; hunter A views public listing before booking | No private entry/parking coordinates exposed via HTML, JSON, network responses or map tiles; public boundary only if intentionally public. |
| H03 | Hunter A requests booking, owner A accepts; hunter A refreshes | Correct state persists; no duplicate booking; authorization enforced server-side. |
| H04 | Hunter A completes TEST checkout | TEST payment intent/session only; booking amount/tax correct; webhook idempotent; receipt/booking status consistent. |
| H05 | Owner A and hunter A exchange messages, refresh and switch conversations mid-request | Correct participants and order; drafts preserved; no stale error or wrong-thread refresh. |
| H06 | Hunter B attempts GET/POST to A's conversation and spoof sender_id | Server denies or returns zero rows; no message inserted or private data exposed. |
| H07 | Hunter A cancels booking within allowed policy | Booking state, notifications, TEST refund and private access visibility all match policy. |
| H08 | Attempt message, access-zone read and booking mutation after cancellation/expiry | Denied where policy requires; no stale private coordinates accessible. |
| H09 | Owner A reviews hunter A before completion, after completion, then repeats | Before completion denied; exactly one eligible review after completion; duplicate denied; hunter cannot author owner review. |
| H10 | Owner B attempts editing A's zones and viewing A's private access markers | RLS/RPC denial, no mutation or leak. |
| H11 | Webhook replay, refund retry, declined TEST card, interrupted network | No double charge/refund, no phantom confirmed booking, user-facing recoverable errors. |
| H12 | Open booking A then B with A's response delayed/rejected; repeat owner side | B stays selected; stale A error suppressed; current request errors shown. |

## Accessibility/responsive matrix
For H01/H03/H05/H07/H09 and map access display, test 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560 CSS-pixel widths. Capture horizontal overflow, clipping, map controls, modal focus, keyboard-only path, touch targets, 200% zoom, accessible error announcements and reduced motion. Distinguish browser emulation from actual mobile Safari testing.

## Source findings requiring targeted regressions
- `sandbox-messaging-bridge.js` shares one disabled send button per role. Pending send in conversation A disables sending in B until A completes. **Static risk, not browser reproduced.** Test A pending -> switch B -> type -> send, and verify A cannot double-submit; coordinate fix with Developer and Landowner QA.
- Client-side `hunter_id` / `landowner_id` filters and `sender_id` supplied in POST are **not** proof of server-side authorization. H06/H10 must exercise sandbox RLS directly with separate identities.
- Inbox preview requests remain N+1 per conversation; profile performance with 50+ synthetic threads and constrained network.

## Current execution status
**PASS (source inspection):** The staging messaging bridge currently contains captured send-conversation IDs and stale request guards; owner and hunter send handlers both disable a shared button. **NOT TESTED:** all H01–H12 and responsive/device cases in this document. **BLOCKED (environment):** no isolated authenticated browser runner/QA sessions or verified TEST payment fixtures established in this execution. Authorization is granted; no extra approval is needed. **Production gate: NO-GO** pending actual E2E evidence.

**Coordination:** Developer owns RLS/payment and send-state changes; Landowner QA owns owner-side map/review and conversation regression; Designer owns responsive/accessibility; Legal reviews access-coordinate timing and cancellation/refund policy. Hunter QA independently verifies end-to-end and privacy denials.
