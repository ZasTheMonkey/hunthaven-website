# Hunter QA — 2026-11-09 21:43 ET

Scope: sandbox only, branch `staging/leasewild-full-clone`. No production changes.

## Coordination
Attempted to read `docs/launch-sprint/hunter-qa.md`, `landowner-qa.md`, `developer.md`, and `launch-status.md` before editing; all were absent at read time. This report is the hunter QA handoff; other agents should not edit this file concurrently.

## Verified fix
- **PASS (source):** `sandbox-messaging-bridge.js` previously swallowed errors in `threadPreview`, displaying a false empty-preview state if message retrieval failed. Now failures propagate to the inbox's existing error UI rather than masquerading as no messages.
- **PASS (source):** Added explicit expired-session checks in conversation listing, sending, and both message rendering paths, avoiding undefined-property crashes and providing actionable sign-in errors.
- **PASS (source):** Fixed avatar initials tokenization from a literal-backslash regex to actual whitespace splitting.
- Commit: `85414692376a4676e8ef5143350c11b777d5f937`. Re-fetched bridge file and verified new guard.
- **PASS (deployment metadata):** Cloudflare Pages `leasewild-sandbox` most recent deployment reports `active` at this commit. This is NOT a browser functionality test.

## Blockers / risks
- **BLOCKED:** authenticated E2E for hunter-to-landowner messages, checkout, cancellations and confirmations; dedicated test Auth accounts exist but no secure automation credentials/session available. Never use personal accounts.
- **FAIL / P1 known gap:** `loadUnreadCount` explicitly hides unread badge, and owner inbox also hides badge. Message table has no read-state field; true unread counts/read receipts need a deliberate schema/product design and coordinated security review, not a superficial UI counter.
- **BLOCKED:** mobile Safari real-device tests and viewport emulation were not executed in this run. Source CSS includes a 600px breakpoint; not evidence of working mobile UX.
- **BLOCKED:** Stripe TEST payment and webhook completion unverified; no real payments touched.
- **P1:** `threadPreview` currently makes one message fetch per conversation; could be expensive for large inboxes. Optimize with coordinated backend endpoint after review.

## Next actions
1. Provision sandbox-only secure authenticated sessions for dedicated QA accounts in the automation runtime.
2. Execute hunter-landowner cross-role send/receive, refresh, ordering, error, and RLS tests with synthetic bookings.
3. Coordinate unread/read-state design with developer and landowner QA, test at 375/390/430/768px and desktop, then run Stripe TEST checkout.

## 2026-11-09 21:55 ET — Inbox preview performance
- **PASS (source):** `sandbox-messaging-bridge.js` inbox `threadPreview` previously fetched every message in each conversation (`order=created_at.asc&select=*`) solely to display the last message. Replaced preview query with `order=created_at.desc&limit=1&select=body,created_at`, reducing returned rows to at most one per conversation while preserving full ascending message fetch for open chats. Applies to both hunter and landowner inboxes.
- **PASS (source verification):** Re-fetched branch file and confirmed bounded preview query plus unchanged full chat query.
- **PASS (deployment metadata only):** Cloudflare Pages latest `leasewild-sandbox` deployment `e39beb4b-9912-4cec-8f4a-e68e8e3068e4` reports `active` at commit `37b872fbaa7e4ab0028c790bb5f0b4e9d8930d69`.
- **BLOCKED (runtime):** No secure QA session available, so inbox rendering, message delivery, real mobile layouts, checkout and Stripe TEST are not end-to-end verified. No browser emulation or real-device run conducted.
- **FAIL / P1 remains:** unread badge intentionally hidden; no read-state schema. Coordinate design with developer/landowner before schema changes.
- **Risk:** one HTTP request per conversation remains; future batched preview endpoint can eliminate N+1 requests after backend review. No production changes.
