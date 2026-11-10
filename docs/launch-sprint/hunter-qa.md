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

## 2026-11-09 23:00 ET — Hunter chat scroll preservation and overnight feature review
- **PASS (source):** Hunter `loadMessages` formerly forced `scrollTop=scrollHeight` on every refresh, pulling readers away from older messages. It now auto-scrolls only when already within 80px of the bottom and otherwise preserves the reading position relative to added content. Error text is also guarded against a stale conversation response overwriting a newly selected chat. Only the hunter-specific code path was modified; landowner QA owns its corresponding fix.
- **Code commit:** `da3c7a4dce10142eca75ca3769a3b1c2eed2aaa1`. Re-fetched `sandbox-messaging-bridge.js` and confirmed both guards.
- **PASS (deployment metadata):** Cloudflare Pages deployment `380a9822-2dc4-4dd9-b17c-d2ee296ebfee` reports `active` at exact code commit. This is not a browser or device test.
- **BLOCKED:** Secure QA session unavailable, so hunter booking, Stripe TEST checkout, cross-role messaging, refresh behavior and actual scroll behavior remain unverified E2E. Mobile Safari/viewport testing not executed.
- **Overnight hunting-boundary/entry/parking/review feature coordination:** P0 authorization acceptance criteria: only authenticated listing owner can create/edit boundaries and entry/parking markers; only authorized booked hunters should receive any sensitive access coordinates, only during an appropriate booking access window; deny access after booking cancellation/expiry and prevent unauthenticated API reads. Never expose precise hunting/parking coordinates in public listing metadata or map tiles. Boundary drawing must be labeled informational rather than surveyed property limits; verify geometry validation and mobile touch edit affordances. Hunter reviews must be written only by the landowner on a completed eligible booking, once per booking, with moderation/reporting and privacy protection; do not publish defamatory/private location information. **BLOCKED:** no implemented feature was exercised, no claim of E2E pass. Developer should own schema/feature changes after legal review.
- **GO/NO-GO:** NO-GO for production: auth E2E, Stripe TEST, cancellation/confirmation, RLS authorization and mobile checks still blocked.

## 2026-11-09 23:23 ET — Hunter inbox refresh race and pre-deadline gate
- **PASS (source):** Fixed hunter inbox concurrent refresh race: each `loadThreads()` invocation now receives a monotonically increasing request ID. Late older success/error responses cannot overwrite a newer inbox. Isolated to hunter path in `sandbox-messaging-bridge.js`; no schema, payment or owner logic changed. Commit `07fad409414f081fcb625894e48cc5469befe702`. Re-fetched and checked counter, success guard, and error guard.
- **PASS (previous deployment metadata only):** Cloudflare Pages API latest observed deployment `a360be98-b8d6-47af-a256-15fe8f035482` status `success`, commit `2419661c36433cde73df7b56366aac51201ba6d4` (2026-11-10 04:18:09Z). This predates the above commit; deployment of new fix **NOT YET VERIFIED**. No browser render claim.
- **BLOCKED:** Authenticated QA session unavailable; hunter/owner cross-role messaging, booking/confirmation/cancellation, Stripe TEST checkout, and RLS negative authorization attempts not exercised.
- **NOT TESTED:** Browser widths 320/375/390/430/768/1024/1280/1440/1920, 200% zoom, touch/keyboard interaction, mobile Safari, map-zone drawing create/edit/save/reload, cross-owner privacy, completed-booking review eligibility and moderation. Source checks are not responsive/browser tests.
- **FAIL / P1 known:** Unread badges are intentionally hidden; read-state schema not present. No read receipts. Requires coordinated product/security migration.
- **GO/NO-GO:** **NO-GO** for production. Complete authenticated, payment, authorization, responsive and new-feature acceptance tests before release. Production untouched.

## 2026-11-10 00:19 ET — Cross-role stale-error isolation
- Read existing hunter and landowner QA reports and current bridge source before editing. Owner QA's latest report (`58110bab147d954cd5f57a0aa4be6be9dd87f6c4`) had already fixed owner inbox refresh ordering; avoided modifying that code.
- **PASS (source):** Identified landowner `loadLoMessages` catch block writing an error unconditionally even when the user had switched to another conversation. Guarded the catch with `loCurrentConvId===id`, matching existing hunter behavior. This prevents stale failed requests from replacing the currently selected conversation with an irrelevant error. Code commit `108f7e0af758c326e2bb0440cba234005d314eaa`; re-fetched source and confirmed guard and unchanged hunter guard.
- **PASS (deployment metadata only):** Cloudflare Pages project `leasewild-sandbox` deployment `6fe96262-3438-4c48-8e41-efe1a82d8aed` reports `active`, exact code commit `108f7e0af758c326e2bb0440cba234005d314eaa`, created 2026-11-10T05:19:54Z. No browser behavior assertion.
- **BLOCKED:** Authenticated hunter/landowner E2E messaging, signup, booking, cancellation, RLS negative tests, and Stripe TEST checkout: no securely provisioned automation QA sessions. No personal accounts accessed.
- **NOT TESTED:** Responsive browser widths 320/375/390/430/768/1024/1280/1440/1920, 200% zoom, Safari/touch/keyboard, map-zone create/edit/save/reload, owner isolation, completed-booking review eligibility/moderation, and checkout regression. No browser automation executed.
- **FAIL / known P1:** Unread indicators remain hidden without a read-status schema. No read receipts. Feature implementation and authorization remain to be reviewed by developer/legal before any production gate.
- **GO/NO-GO:** **NO-GO** for production. Sandbox only; no main, production data, personal sessions, or live payments modified.
