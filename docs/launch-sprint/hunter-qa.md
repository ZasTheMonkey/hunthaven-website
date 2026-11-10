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

## 2026-11-10 01:25 ET — Hunter active-conversation refresh ordering
- Read current hunter and landowner QA reports and messaging bridge before editing; owner active-message ordering had already been fixed in commit `f2a7736024a611152329f4d8f9118a4dec43723b`. Avoided changing owner code.
- **PASS (source):** Reproduced from code inspection that overlapping `loadMessages(id)` calls for the same hunter conversation had no request-sequence guard. Older responses/errors could overwrite newer messages. Added hunter-only monotonically increasing `hunterMessageRequest` and guards on success/error, mirroring owner fix. Commit `aee5e28de138fcf28a30494eea59ba550f692efa`. Re-fetched committed bridge and confirmed counter, success/error guards, and owner guard unchanged. This is static verification, not an authenticated functional test.
- **PASS (deployment metadata):** Cloudflare Pages deployment `dc7685f3-6f89-4821-8a32-59229df3e2d7` reports `active` at exact code commit `aee5e28de138fcf28a30494eea59ba550f692efa`, created 2026-11-10T06:25:40Z. Does not prove browser behavior.
- **BLOCKED:** Authenticated hunter/landowner send/receive, refresh persistence, booking/confirmation/cancellation, Stripe TEST checkout, cross-owner RLS negative tests, map-zone save/reload, review eligibility and moderation: no securely provisioned QA sessions; no personal sessions accessed.
- **NOT TESTED:** Browser rendering widths 320/375/390/430/768/1024/1280/1440/1920, zoom 200%, touch/keyboard, landscape, real-device Safari, map and reviews UI. No browser harness available in this run.
- **FAIL / existing P1:** Unread badges still intentionally hidden; read-state schema and read receipts remain absent. Coordinate schema and RLS design before enabling.
- **GO/NO-GO:** **NO-GO** for production. Sandbox only; no main, production systems, real user data, or live payments modified.

## 2026-11-10 01:50 ET — Send completion isolated from conversation switching
- **PASS (source):** Inspected current hunter and landowner QA reports and messaging bridge. Found that `sendMessage` and `sendLoMessage` used the mutable active conversation ID again after awaiting network send. If the user switched threads during the request, the completion could refresh the wrong thread. Captured `sendingConvId` before the send and refresh only when the active conversation still matches. Both role paths updated; no backend/schema/payment changes. Code commit `1a145489c99ec94fc21e3083eaf59687b47b6fcb`. Re-fetched the source and confirmed two captured IDs, two sends with captured IDs, and two conditional refresh guards.
- **PASS (deployment metadata only):** Cloudflare Pages deployment `2732c60c-0b47-4043-8b60-e13199e262db` reported `active` at exact code commit `1a145489c99ec94fc21e3083eaf59687b47b6fcb`, created 2026-11-10T06:50:51Z. No browser execution claimed.
- **BLOCKED:** Authenticated hunter/owner E2E messaging, persistence, booking/cancellation, Stripe TEST checkout, and RLS negative tests: no securely provisioned QA session. Personal accounts not accessed.
- **NOT TESTED:** Browser widths 320/375/390/430/768/1024/1280/1440/1920, zoom 200%, Safari/touch/keyboard, map-zone save/reload, cross-owner isolation, review eligibility/moderation. Browser automation unavailable in this run.
- **FAIL / existing P1:** Unread badges remain disabled pending authorized read-state design and migration.
- **GO/NO-GO:** **NO-GO** production. Sandbox branch only, no production or live payment changes.

## 2026-11-10 03:34 ET — Hunter composer draft isolation
- **PASS (static/source):** Reviewed existing hunter and owner QA reports and shared messaging bridge before edit. Reproduced by code inspection: hunter `sendMessage` cleared the shared composer after an awaited send even if the hunter had switched to another conversation and entered an identical draft. Owner path had already been protected in `632086094086b50cc98c5d684a1d80df87306f88`. Added `currentConvId===sendingConvId` guard around draft clearing and refresh. Code commit `31e1f340da59575cfa03a0bb89eeb646163a9d3b`. Re-fetched staging source: hunter guard present, owner guard preserved. No authenticated browser execution.
- **PASS (deployment metadata only):** Cloudflare Pages API reports deployment `64ff638b-b013-4e29-bcaa-bca722e89f66` `active` for exact code commit `31e1f340da59575cfa03a0bb89eeb646163a9d3b`, created `2026-11-10T08:34:30Z`. This does not verify browser behavior.
- **BLOCKED:** Authenticated messaging send/receive, persistence, cross-role/RLS negative tests, booking/confirmation/cancellation, Stripe TEST checkout, map zone save/reload and review eligibility: secure QA sessions unavailable; no personal accounts accessed.
- **NOT TESTED:** Browser rendering at 320/375/390/430/768/1024/1280/1440/1920, zoom 200%, touch/keyboard/landscape, Safari real device, map editor/reviews. No browser harness executed.
- **FAIL / known P1:** Unread badges remain disabled pending secure read-status schema and RLS design.
- **GO/NO-GO:** **NO-GO** production. No production, main, real users, or live payments touched.

## 2026-11-10 04:06 ET — Hunter message load error accessibility
- **PASS (source inspection):** Hunter message-load failure now sets `role=alert` and provides a retry-oriented error message, matching the existing landowner error treatment. Stale-conversation and stale-request guards remain intact. Re-fetched committed source; assertion: PASS.
- **Code commit:** `04c1604f115788062a60ce5f43d5b8edc4cd6901` (`sandbox-messaging-bridge.js`). No production files changed.
- **NOT VERIFIED (deployment):** No independent Cloudflare deployment status was obtained in this run. Commit does not establish deployment.
- **BLOCKED:** No securely provisioned QA sessions for hunter/owner authenticated E2E, messaging/RLS, bookings, cancellation, reviews, map-zone save/reload or Stripe TEST. No real data or payments touched.
- **NOT TESTED:** Browser rendering at 320/375/390/430/768/1024/1280/1440/1920px, zoom, touch/keyboard, and real-device Safari; no browser evidence available.
- **NO-GO:** Production release remains blocked on verified critical workflows and authorization. This is source-only accessibility improvement, not functional E2E evidence.

## 2026-11-10 04:46 ET — Hunter draft recipient isolation
- **PASS (static source):** Compared latest hunter/landowner QA notes and bridge; hunter composer retained text across conversation switches, risking accidental delivery to the wrong landowner. Mirrored the existing owner per-conversation draft map, saving/restoring drafts on thread selection and clearing only the successful sending thread's unchanged draft. Code commit `beec180fc5651e8f4c070821dfa0e7756e2e888e`. Re-fetched source and checked hunter map, restore, successful-send clearing and owner protection. This is code inspection, not browser E2E.
- **NOT VERIFIED (deployment):** No independent Cloudflare deployment result obtained for this code commit; GitHub commit alone does not prove deployment.
- **BLOCKED:** Authenticated hunter/owner send/receive, RLS, booking/cancellation, Stripe TEST, map create/edit/reload and review eligibility/moderation lack securely provisioned QA sessions.
- **NOT TESTED:** Responsive browser widths 320/375/390/430/768/1024/1280/1440/1920, 200% zoom, touch/keyboard, Safari and real-device checks. No browser harness executed.
- **NO-GO:** Production launch remains blocked; sandbox branch only.

## 2026-11-10 06:37 ET — Pre-7AM hunter QA evidence handoff
- **PASS (coordination):** Read latest branch commits through `339cbaff0957f87408eb8f997748db401b10298e`, current landowner QA, launch readiness and shared rules before writing. Designer's `2756c02a5dd93a9802e8068fb6deca4647412473` removes dead listing filters and records a single 1363px browser check; `a2abe68cd8d3e855d7e7c17e2d5b9d687c01342a` revises the catalog SQL draft. These are other agents' results, **not** independently reproduced in this hunter run.
- **PASS (report review):** Landowner QA identifies an attempted review moderation bypass in draft INSERT RLS and a public catalog permission hazard; the draft was corrected, but **no migration applied**. The draft's unique booking constraint is only a proposal; do not call review eligibility or cross-owner isolation verified.
- **BLOCKED / NOT IMPLEMENTED:** Landowner-drawn boundaries, entry/parking zones, save/reload, cross-owner denial, hunter review creation, one-per-completed-booking, moderation, and hunter visibility cannot pass E2E: the current shared readiness report explicitly says the feature schema is unapplied and runtime UI is not implemented. Do not imply these features were delivered by 7 AM.
- **BLOCKED:** Secure synthetic authenticated hunter/owner sessions absent; booking/confirmation/cancellation, messaging send/receive and authorization, Stripe TEST lifecycle and RLS negative tests cannot be run. No credentials or real users accessed.
- **NOT TESTED (this hunter run):** Browser/device widths 320/375/390/430/768/1024/1280/1440/1920, 200% zoom, touch/keyboard, orientation, Safari, screen reader, map and checkout. A separate developer's 1363px filter check is not a full responsive matrix.
- **NOT VERIFIED (this hunter run):** No independent Cloudflare Pages deployment API verification was performed. GitHub branch head and previous deployment metadata cannot establish current live deployment. No application code changed in this run.
- **FAIL / existing P1:** Unread messaging badges remain disabled; secure read-status persistence and policy design are required.
- **GO/NO-GO: NO-GO for production.** Preserve sandbox-only constraints and defer schema changes pending review, secure test sessions and runtime negative tests.
