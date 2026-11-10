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
