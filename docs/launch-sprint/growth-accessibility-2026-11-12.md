# Growth Research — 2026-11-12 18:25 ET (sandbox only)

## Change
- PASS (GitHub source commit): `414be086dc6dc2fb2642bbf0647ec980c50d4854` adds visible focus outlines for outfitter directory links/buttons and navigation/footer links, and disables directory hover animation for visitors requesting reduced motion. Reversible, CSS-only, no payment or database changes.
- PASS (source verification): targeted selectors and `prefers-reduced-motion:reduce` rule confirmed in staging source.
- NOT TESTED: actual keyboard focus rendering, screen readers, 200% zoom, touch, and viewport screenshots at 320/375/390/430/768/1024/1280/1440/1920/2560.
- NOT TESTED: Cloudflare deployment for this commit, Stripe TEST cards, tax/promo/add-on totals, webhooks, Connect transfer/refund reconciliation. No test payment was initiated.
- FAIL (pre-existing P1): directory links still use outfitter user IDs rather than unique experience IDs, with a temporary multi-experience booking safety block. A 60-record cap means duplicate detection can miss records outside the result window. Developer/Hunter QA should own the identity migration and regression test.
- NO-GO: Stripe Tax legal/classification gate, Connect payout proof, and full E2E checkout/cancellation evidence remain open. Do not deploy to main or live leasewild.com.

## Coordination
Growth Research owns public discovery and accessibility copy/CSS. Developer/Hunter QA own authenticated booking/payment paths; Landowner QA owns booking/zone/review verification; Legal Risk Review owns tax/policy. Avoid editing `outfitters.html` concurrently without refetching latest SHA.

## 2026-11-12 19:40 ET — Directory malformed-response handling
- **PASS (staging source):** `fa2013acfb17c814cc116574f59a452a8838bb4a` distinguishes a malformed/non-array directory API response from a legitimate empty inventory. Unexpected responses now show a retry control rather than falsely telling hunters that no approved outfitters exist. No database or payment changes.
- **PASS (static verification pending separate read):** This is a narrow response-handling change only; it does not imply backend availability.
- **NOT TESTED:** Browser reproduction of malformed responses, Cloudflare deployment, responsive widths, screen readers, Stripe TEST cards/refunds/Connect reconciliation.
- **OPEN / NO-GO:** Unique listing identity, 60-row cap, Stripe Tax and complete payout/payment proof remain unresolved. Confirm Supabase sandbox identity before any API fixtures.


## 2026-11-12 20:07 ET — Incomplete directory records
- **PASS (staging source change):** Commit `205ed7398656a40a4afe055b622667fd9c457c40` distinguishes all-invalid directory results from genuinely empty inventory and provides retry; mixed valid/invalid responses show a visible note about omitted incomplete records. Previously malformed records were silently skipped and all-invalid responses implied there were no bookable experiences. No payments or database code touched.
- **NOT TESTED:** Actual malformed fixture browser reproduction, Cloudflare deployment, 10-width responsive matrix, authenticated inventory, Stripe TEST payments/webhooks/refunds/Connect reconciliation. Source change alone is not E2E proof.
- **P1 / NO-GO:** Unique listing identity remains unresolved; 60-row directory cap can miss duplicate outfitter experiences. Sandbox Supabase identity needs verification before synthetic database testing. Stripe Tax, Connect payout and payment/refund reconciliation gates remain open. Developer/Hunter QA own identity/payment remediation; Growth Research owns directory regression.

## 2026-11-12 21:37 ET — Directory card media privacy/accessibility
- **PASS (source commit):** `948e8a35c5c2e9b03e2e24352afe84ae0d74e857` sets directory experience images to `referrerPolicy='no-referrer'` to avoid sending the directory URL as an HTTP Referer to third-party photo hosts; adds asynchronous decoding; and uses decorative `alt=''` because the wrapping link already has an accessible experience name. Existing broken-image placeholder remains unchanged. Scoped to `outfitters.html` only; no payments or database modifications.
- **NOT TESTED:** Network-header verification in browser, screen-reader behavior, Cloudflare deployment, 10 responsive widths, or Stripe TEST E2E reconciliation.
- **OPEN / NO-GO:** Multi-experience listing identity, 60-record cap, Stripe Tax registrations, Connect payouts and full checkout/refund evidence remain unresolved. Developer/Hunter QA own booking and payment gates; Growth Research owns directory presentation. Sandbox Supabase project identity must be confirmed before using API fixtures.

## 2026-11-12 22:44 ET — Directory result count
- **PASS (staging source commit):** `53478ddca7eb20f3040c74c7d517a98a37125eff` adds a visible, screen-reader-readable count of valid outfitter experience cards. This avoids leaving visitors guessing whether the directory loaded all results; existing capped-inventory warning remains. No database, payment, or production changes.
- **NOT TESTED:** Browser screen reader, actual responsive viewport matrix, Cloudflare deployment, Stripe TEST reconciliation. No claim of E2E success.
- **P1 / NO-GO:** Unique listing identity remains unresolved, 60-row cap can omit additional experiences, Stripe Tax and Connect payout plus full checkout/refund proof remain open. Developer/Hunter QA retain booking/payment responsibility. Verify sandbox database identity before fixtures.


## 2026-11-12 23:09 ET — Ambiguous experience cards are no longer fake links
- **PASS (staging source):** Commit `df46d73b0c59b1b35da138047d21be1df0355bfe` changes the directory's multi-experience safety state to render noninteractive media/title/CTA elements instead of anchor elements with removed `href` and `aria-disabled`. This removes misleading link semantics from a deliberately unavailable booking path while preserving the explanation. Single-experience cards still use normal links. Source re-fetched and conditionals confirmed.
- **NOT TESTED:** Deployed Cloudflare browser behavior, keyboard/screen-reader semantics, ten viewport widths, and Stripe TEST reconciliation. No database, checkout, or payment changes.
- **OPEN / NO-GO:** Stable unique listing IDs, complete inventory beyond 60 records, sandbox Supabase identity verification, Stripe Tax/Connect payouts, and end-to-end checkout/refund evidence. Developer/Hunter QA own booking/payment changes; Growth owns directory presentation. No main/live changes.


## 2026-11-13 00:47 ET — Growth Research SEO and directory source audit
- **PASS (source inspection):** `outfitters.html` includes a descriptive page title, meta description, Open Graph/Twitter metadata, and a canonical URL targeting `leasewild-sandbox.pages.dev`. It also declares `robots=noindex,nofollow`, appropriate for keeping the sandbox out of public search results; do not remove this on sandbox.
- **PASS (source inspection):** Dynamic directory listing text is assigned with `textContent`, and outbound experience detail links validate UUID-shaped outfitter IDs before construction. The directory has an explicit 12-second timeout, retry state, invalid-record warning, and capped-results disclosure.
- **FAIL (pre-existing P1):** Experience navigation still uses `user_id`, not a unique listing ID, and duplicate detection sees only the first 60 returned records. This remains a booking-identity risk. No attempt to bypass the fail-closed multi-experience guard.
- **NOT TESTED:** Live Cloudflare deployment, actual sandbox inventory, viewport screenshots/keyboard/zoom, Stripe TEST payment, webhook, refund, tax or Connect payout reconciliation. The web fetch of the sandbox URL was unavailable in this run; no browser pass claimed. Sandbox Supabase project identity remains unverified, so no database fixtures or direct API calls were made.
- **COORDINATION:** Developer/Hunter QA to own unique listing identity and payment E2E; Landowner QA to verify booking/payout rows; Legal to resolve tax policy. Growth retains public SEO/discovery regression. **NO-GO** pending independent payment/tax/payout and identity evidence. No production/main changes.

## 2026-11-13 01:45 ET — Directory duplicate announcement fix
- **PASS (staging commit):** `9d67c5f7dfcefa0494ceac39a639350fcbd39ef3` removes the redundant `role=status` on the directory result-count paragraph. Its parent `#outfitter-directory` already declares `role=status` and `aria-live=polite`; nested status regions risk duplicate announcements in assistive technology. Visible count and data-loading behavior remain unchanged. No payment, database, or production changes.
- **NOT TESTED:** Real screen reader announcement count, Cloudflare deployment, all ten browser viewport widths, Stripe TEST cards/refunds/webhooks/Connect payout. Static source review is not browser proof.
- **OPEN / NO-GO:** Outfitter multi-experience identity, 60-record cap, Stripe Tax classification/registrations, connected-outfitter transfer/payout and full payment/refund evidence. Coordinate identity/checkout with Developer and Hunter QA; Landowner QA handles payout rows; Legal handles tax policy.


## 2026-11-13 02:19 ET — Limit live announcements to directory status
- **PASS (staging source commit):** `4427da44a2f86f5837c2bc03203754bd44018ac1` removes `role=status`/`aria-live=polite` from the entire outfitter directory container and instead places `role=status` on the result-count or error/empty-state paragraph. This prevents assistive technology from potentially announcing every listing card and image after fetch while preserving a concise loading outcome. `aria-busy` remains on the container. Independently fetched staging source and confirmed the changed selectors.
- **NOT TESTED:** Actual screen-reader announcements, Cloudflare deployed rendering, 320/375/390/430/768/1024/1280/1440/1920/2560 widths, touch/keyboard/zoom, and Stripe TEST transactions/webhooks/refunds/payout reconciliation.
- **OPEN P1 / NO-GO:** Per-experience stable IDs across discovery/detail/booking, 60-row inventory cap, sandbox Supabase project identity, Stripe Tax registration/classification, Connect payout proof, full E2E payment/refund evidence. Developer/Hunter QA own booking/payment identity; Growth owns directory regression. No production/main or payment changes.

## 2026-11-13 — Responsive directory grid status fix
- **PASS (staging source):** `5f6d7d7b5363a69b75d4c49f08e8e6dc139d7a37` adds `grid-column:1/-1` to the dynamically inserted result-count paragraph and incomplete/capped inventory warnings. Previously these non-card grid children occupied single listing columns, leaving misleading empty card positions at desktop widths and awkward placement. This is a reversible inline-style-only fix; no checkout, Supabase or Stripe code changed.
- **NOT TESTED:** Browser screenshots at 320/375/390/430/768/1024/1280/1440/1920/2560, keyboard/zoom, Cloudflare deployment, live sandbox inventory, and Stripe TEST transactions/refunds/Connect reconciliation.
- **OPEN / NO-GO:** Unique experience IDs and 60-record limit remain; Stripe Tax classification and full payment/payout evidence remain unresolved. Developer/Hunter QA own booking identity and payments; Growth owns discovery presentation.

## 2026-11-13 05:24 ET — Long metadata responsive overflow hardening
- **PASS (staging source):** commit `71c7dd0ac2049ad948f73825c84c948d5369c6c6` adds scoped flex wrapping and `overflow-wrap:anywhere` for long outfitter titles, locations, species and prices. Prevents unbroken user-supplied strings from demanding more than the available card width. Re-fetched source after commit and verified exact selectors. No payment, booking, database or production changes.
- **NOT TESTED:** Actual browser layout at 320/375/390/430/768/1024/1280/1440/1920/2560, keyboard/zoom, Cloudflare deployment, live inventory, Stripe TEST payments, refunds, webhook and Connect payout reconciliation. Source-level validation does not establish deployed browser PASS.
- **OPEN / NO-GO:** Unique experience identity and 60-record cap, Stripe Tax classification/registrations, Connect payout and end-to-end payment/refund evidence. Developer/Hunter QA own booking identity/payment; Growth owns directory presentation. Avoid concurrent edits without refetching SHA.

## 2026-11-13 06:29 ET — Keyboard skip navigation
- **PASS (source):** Commit `32e6870643b9ebaac7ea6df7a8b584cdc8db6271` adds a focus-visible "Skip to main content" link and a semantic, programmatically focusable `<main>` landmark to `outfitters.html`. This gives keyboard users a route around repeated navigation and leaves checkout, inventory fetching and payments unchanged. Independent staging re-fetch verified the link target, landmark, closing tag and focus styling.
- **NOT TESTED:** Real browser Tab/Enter behavior, screen reader, Cloudflare deployment, viewport matrix (320/375/390/430/768/1024/1280/1440/1920/2560), sandbox inventory and Stripe TEST payment/refund/Connect reconciliation.
- **NO-GO:** Stable experience IDs and full inventory pagination remain outstanding. Stripe Tax and end-to-end financial evidence still require verified cross-system tests; historical launch-gate counts may have changed and must be re-read before reporting as current.
- **Coordination:** Growth Research modified only the public outfitter directory; other roles retain payment, booking, map/review and legal ownership. No main/live changes.


## 2026-11-13 07:55 ET — Directory unavailable count transparency
- **PASS (source commit):** `008f6c9e513a060d46014ecacf88e8a553e8c2ff` adds a separate count of temporarily unbookable outfitter experiences to the directory result summary. Before this, a visitor could see “N experiences shown” without knowing that some cards cannot be opened because the same outfitter owns multiple active experiences. The fail-closed booking guard remains unchanged. No payment, API, database, main, or production changes.
- **NOT TESTED:** Deployed Cloudflare browser rendering, real sandbox inventory, screen-reader behavior, ten responsive viewport widths, Stripe TEST cards/refunds/webhooks/Connect payout reconciliation. Static code verification is not browser evidence.
- **FAIL / P1:** Directory still queries a maximum of 60 records and routes by outfitter `user_id`, not unique experience ID. Developer/Hunter QA own identity migration and authenticated payment E2E; Growth Research owns discovery presentation. Stripe Tax classification and full payout/refund proof remain launch blockers. **NO-GO.**

## 2026-11-13 08:50 ET — Directory pagination safety
- PASS (source commit `f80b21cc84c3db1a769f66015e477541cd8b84b8`): Fetches sequential 60-row pages up to 600 before checking duplicate outfitter user IDs. Partial/failed fetch or exceeding cap fails closed, preventing ambiguous booking links based on incomplete inventory. No payment code touched.
- PASS (independent re-fetch): Confirmed pagination, fail-closed cap and removed obsolete 60-row warning.
- NOT TESTED: Cloudflare deployment, actual inventory, ten viewport widths, accessibility browser tests, Stripe TEST payments/refunds/webhooks/Connect payouts.
- NO-GO: Unique experience IDs still needed. Tax and end-to-end payment/payout evidence remain open. Developer/Hunter QA own identity and checkout; Growth owns discovery.

## 2026-11-13 09:09 ET — Directory currency display hardening
- **PASS (staging source):** `9c2ffd0c040f7d128b700b33d72a6ba50cf943c0` changes directory price labels to explicit USD currency formatting (up to two decimal places), preventing fractional trip prices from appearing as unlabelled three-digit decimals, and rejects empty-string prices that previously appeared as `$0`. Missing/invalid prices now retain `Price on request`. Source independently re-fetched after commit.
- **NOT TESTED:** Actual browser display, ten responsive widths, Cloudflare deployment, live inventory, Stripe TEST checkout/tax/promo/add-on/refund/Connect reconciliation. This is display-only, not a change to server-side pricing or payments.
- **OPEN / NO-GO:** Stable per-experience IDs, complete inventory beyond temporary 600-record ceiling, verified Stripe Tax and Connect payout, complete UI payment/refund proof. Developer/Hunter QA own checkout/identity, Landowner QA owns payout reconciliation, Legal owns tax policy. No main/live changes.

## 2026-11-13 10:41 ET — Exact pagination boundary
- **PASS (staging source):** Commit `c9f8e923854c68cb89c242daa992b37ded326397` fixes the false failure when directory inventory contains exactly 600 rows. Previously six full pages of 60 always threw an overflow error, even if the 600th row was the last. A one-row probe at offset 600 now distinguishes exact-cap completion from a genuine overflow; malformed/error probe still fails closed. No booking or payment code changed.
- **NOT TESTED:** Browser-backed 600/601-row fixtures, actual sandbox inventory, Cloudflare deployment, ten viewport widths, Stripe TEST checkout/refunds/tax/webhooks/Connect reconciliation. Static source inspection only; do not count as E2E PASS.
- **OPEN / NO-GO:** Stable experience IDs, scalable pagination beyond 600, Stripe Tax classification, and complete payout/payment/refund evidence. Developer/Hunter QA own checkout and identity; Growth owns directory UX. No main/live changes.


## 2026-11-13 11:44 ET — Paginated discovery timeout budget
- **PASS (source commit `0b40c24154507b34d698920b21843b341a39bc72`):** Increased the outfitter directory's overall abort budget from 12 to 30 seconds after pagination expanded to as many as 11 sequential HTTP requests (ten 60-row pages plus a one-row probe). This avoids prematurely aborting otherwise valid complete-inventory requests on slower mobile networks. Timeout still fails closed and offers retry. No payment, booking, API, database or production changes.
- **PASS (independent GitHub source re-fetch):** Verified `controller.abort(),30000` in staging source after commit.
- **NOT TESTED:** Real slow-network timing, Cloudflare deployment, sandbox inventory, ten viewport widths, keyboard/screen reader, Stripe TEST cards/webhooks/refunds/Connect reconciliation. This is a source fix, not deployed E2E evidence.
- **OPEN / NO-GO:** Pagination remains capped at 600, and directory navigation still uses outfitter user IDs rather than unique experience IDs. Developer/Hunter QA own identity and payment flows; Growth owns discovery. Stripe Tax and Connect payout plus financial reconciliation remain unverified.

## 2026-11-13 12:25 ET — Directory pagination tie ordering
- **PASS (source commit):** `41feb3adebc7ddc3952963e18dcb56afc5232ead` adds `user_id.asc` as a secondary sort after `updated_at.desc` for directory pagination. This reduces nondeterministic page ordering when multiple outfitters have the same update timestamp. Scoped to the public directory query; no payment or database changes.
- **LIMITATION:** `user_id` is not unique per experience; multiple experiences from one outfitter with identical `updated_at` remain tied. A stable unique experience ID and keyset pagination are still required. This change is not proof of complete inventory or correct booking identity.
- **NOT TESTED:** Actual inventory with timestamp ties, deployed Cloudflare response, 10 viewport sizes, Stripe TEST payments/refunds/webhooks/payout reconciliation.
- **NO-GO:** Keep existing booking ambiguity safeguards. Developer/Hunter QA own unique experience identity and payments; Legal owns Stripe Tax classification. No main/live deployment.


## 2026-11-13 13:00 ET — Full-width directory error and retry states
- **PASS (staging source):** Commit `b94872bf91f7ff4ed6ca4c79980510bcc1662270` makes directory error/empty/status paragraphs span all grid columns and aligns the retry button to the beginning of its own full-width grid row. Previously the error paragraph and retry button each occupied a listing-card column, making a failed load resemble broken listing cards at desktop widths. Independently re-fetched staging source and verified both CSS declarations. Reversible change confined to `outfitters.html`; no checkout or database changes.
- **NOT TESTED:** Cloudflare deployment, real failed-network fixture, browser screenshots at 320/375/390/430/768/1024/1280/1440/1920/2560, keyboard/zoom, Stripe TEST charges/refunds/webhooks/Connect payout reconciliation. Source verification is not a deployed browser PASS.
- **OPEN / NO-GO:** Unique outfitter experience identity, 600-record discovery ceiling, Stripe Tax registration/classification, Connect payout proof and complete E2E checkout/refund evidence. Developer/Hunter QA own booking and payment fixes; Growth owns public discovery UI. No main/live changes.


## 2026-11-13 14:55 ET — Directory live-region deduplication
- PASS (GitHub source): commit `2b267bd4c2e3becaad0566647a469a83f4688fb7` removes a nested `role=status` from the dynamic experience-count paragraph. The directory's existing parent live region continues to announce changes. Source independently re-fetched; no booking/payment logic touched.
- NOT TESTED: screen-reader announcements in a real browser, responsive widths, Cloudflare deployment, actual sandbox inventory, Stripe TEST transactions/refunds/payouts.
- NO-GO: unique experience identifiers, scalable discovery, Stripe Tax review and full checkout/Connect reconciliation remain open. Developer/Hunter QA own booking identity and payments; Growth owns public directory accessibility.


## 2026-11-13 14:59 ET — Directory first-image loading priority
- **PASS (staging source):** `8776979433913160e30add08b297e2176ec81a0a` changes the first rendered outfitter card image from lazy to eager loading and sets `fetchPriority=high`, while subsequent card images remain lazy. This addresses a potential above-the-fold largest-contentful-paint delay on mobile; no payment, booking, database, or production code changed.
- **NOT TESTED:** Cloudflare deployment, real browser LCP/network timing, 320–2560 viewport matrix, real sandbox inventory, Stripe TEST E2E and reconciliation. Performance benefit is a hypothesis until browser metrics are captured.
- **OPEN / NO-GO:** Unique experience identifiers, stable inventory pagination above 600, Stripe Tax validation, connected payout E2E and full checkout/refund reconciliation. Developer/Hunter QA own payment gates; Growth owns directory performance. Review current Stripe launch gate before changing payment flows.

## 2026-11-13 16:23 ET — First available directory image priority
- **PASS (staging source):** Commit `803ceee1615ed287bb80009087992608f732220d` prioritizes the first **actual image** rather than the first valid card. If the first experience has no photo, the next card's image now gets eager loading/high fetch priority. Subsequent images remain lazy. Independently re-fetched source and verified conditional logic. Reversible directory-only change; no payments, Supabase, production or main changes.
- **NOT TESTED:** Cloudflare deployed browser behavior, mobile network LCP metrics, actual sandbox inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, keyboard/zoom and Stripe TEST reconciliation. The sandbox page was not accessible via the available web fetch, so deployment cannot be claimed PASS.
- **NO-GO:** Unique experience identity and >600 inventory pagination, Stripe Tax classification, complete checkout/refund/webhook and Connect payout proof remain open. Developer/Hunter QA own payment E2E; Growth owns directory discovery and presentation.


## 2026-11-13 17:31 ET — Directory result announcement accessibility
- **PASS (staging source):** Commit `cde9a22e970c522cf44b7dc1e2b1279710485bd4` gives the populated directory's final result-count paragraph `role=status` and `aria-live=polite`. The loading/error notice already has `role=status`, but the successful count lacked an announcement after asynchronous rendering. This makes the count and temporarily-unavailable count available as a concise live update without marking every card as live. No booking, payment, database, main or production changes.
- **NOT TESTED:** Screen reader/browser announcement, Cloudflare deployment, ten viewport widths, actual sandbox inventory, Stripe TEST reconciliation. Source change alone is not an E2E PASS.
- **Current launch-gate evidence (read from shared Stripe report):** 2026-11-13 workflow `43514846824` reported 6 payment passes, 3 explicit skips, zero failures. Receipt delivery, paid bank payout, partial refund, Stripe Tax registration, promo/add-on/deposit economics and concurrency/replay evidence remain open. **NO-GO.** Developer/Hunter QA own booking/payment; Growth owns public discovery accessibility.

## 2026-11-13 18:41 ET — Directory keyboard focus and reduced motion
- **PASS (source commit):** `b86ff9467a703bd6b4eb38d66c283a4a0c521d1f` adds a high-visibility `:focus-visible` outline to the directory retry button and disables card/image hover transitions and movement for visitors requesting reduced motion. Scoped to `outfitters.html` CSS; no checkout, booking, payment, database, production or main changes.
- **NOT TESTED:** Real keyboard focus, OS reduced-motion browser preference, 320/375/390/430/768/1024/1280/1440/1920/2560 widths, Cloudflare deployed version, actual inventory, and Stripe TEST transactions/reconciliation. Static source verification is not browser proof.
- **NO-GO:** The latest shared payment gate reports 6 passed, 3 explicit skips for run `43514846824`; receipt delivery, external bank payout, partial refund and Stripe Tax registration remain open. Unique experience identifiers and complete inventory beyond 600 records remain P1 discovery blockers. Developer/Hunter QA own booking identity and payments; Growth Research owns directory UX.


## 2026-11-13 19:43 ET — Distinct outfitter directory action names
- **PASS (staging source):** Commit `335c2d9f018584d78ba83b2ff5a8e963975a5426` adds an experience-specific accessible label to each available card's otherwise repeated `View experience` action. This helps keyboard/screen-reader users distinguish multiple identical action texts in a links list. Ambiguous listings remain unlinked and disabled pending stable experience IDs. No booking, payment, Supabase, main or live changes.
- **NOT TESTED:** Screen-reader/browser confirmation, Cloudflare deployment, ten responsive widths, actual inventory, Stripe TEST reconciliation. Source-level change only; do not claim E2E PASS.
- **Launch NO-GO:** Latest documented payment run `43514846824` reports six passes, three skips. Receipt delivery, external bank payout, partial refund, Stripe Tax registration, promo/add-on/deposit economics, concurrency/replay and stable unique experience IDs remain open. Growth owns directory; Developer/Hunter QA own identity/payment; Landowner QA owns payout; Legal owns tax/legal gate.


## 2026-11-13 20:27 ET — Outfitter loading-state announcement
- **PASS (source change):** `eb636fb9f04d0dfcecffc1e98f1322e31ca69f58` adds `role=status` and `aria-live=polite` to the initial directory loading message, making the asynchronous state discoverable to assistive technology. Scoped to public `outfitters.html` markup; no payment, booking, database, main, or production changes.
- **NOT TESTED:** Browser screen-reader announcements, deployed Cloudflare artifact, actual sandbox inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, keyboard/touch/zoom, and fresh Stripe TEST reconciliation. Source verification is not E2E evidence.
- **NO-GO:** Shared Stripe launch gate last reports run `43514846824` with 6 passes, 3 skips; delivered receipt, paid bank payout, partial refund, Stripe Tax registrations, promo/add-on/deposit economics, concurrency/replay, and unique outfitter experience identity remain open. Developer/Hunter QA own identity/payment, Landowner QA payout, Legal tax, Growth discovery UX.


## 2026-11-13 21:13 ET — Blank experience-title fallback consistency
- **PASS (staging source):** Commit `db27d2b4ba37b8298d11703340fa61e501c3bfd7` normalizes missing/whitespace-only outfitter experience titles to `Florida Outfitter` consistently in card headings, photo-link accessible names, and CTA accessible names. Previously whitespace-only titles rendered visually blank and could yield meaningless accessible link names. Directory presentation only; no payment, booking, database, main or production changes.
- **NOT TESTED:** Deployed Cloudflare browser rendering, synthetic blank-title fixture, actual inventory, ten viewport widths, touch/keyboard/screen-reader/zoom, and fresh Stripe TEST reconciliation. Source verification does not establish E2E PASS.
- **NO-GO:** Unique experience IDs, scalable inventory beyond 600, Stripe Tax registration, delivered receipt, paid bank payout, partial refunds, promo/add-on/deposit economics and concurrency/replay remain open. Developer/Hunter QA own identity/payment, Landowner QA payouts, Legal tax/legal gate, Growth directory.


## 2026-11-13 22:46 ET — Outfitter price-unit fallback
- **PASS (staging source):** `19c4644e7955d6d55f5ce89f8e1378b4cfcd3ad2` now trims nonempty string `price_label` values and falls back to `per trip` for blank, null or malformed units, avoiding empty units or `[object Object]` in directory cards. Scope: public `outfitters.html` only; no payment or booking changes.
- **NOT TESTED:** Cloudflare deployment, synthetic malformed-label browser fixture, responsive widths, actual sandbox inventory and fresh Stripe TEST reconciliation.
- **Current payment evidence:** `docs/launch-sprint/stripe-launch-gate-2026-11-11.md` reports 2026-11-13 22:01 ET duplicate-checkout PASS in run `43549078806` (6 payment passes, 3 explicit skips), but receipt delivery, external bank payout, partial refund, Stripe Tax, promo/add-on/deposit economics and webhook replay remain open. **Launch NO-GO.** Growth owns discovery presentation; Developer/Hunter QA own booking/payment, Landowner QA payout and Legal tax/legal gate. No main/live changes.


## 2026-11-13 23:05 ET — Outfitter county-label normalization
- **PASS (staging source):** `b02081e8ca42bb9cc6d68b91c8a8775c1df1bdad` normalizes `counties` as either a string or string array, trims entries, and falls back to `Florida` when no usable county is present. Previously an array was silently replaced with `Florida`, obscuring useful listing geography. Directory display only; no checkout/payment/DB changes.
- **NOT TESTED:** Actual sandbox fixture with array counties, deployed Cloudflare response, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, keyboard/touch/zoom, Stripe TEST reconciliation. Source-level fix only.
- **NO-GO:** Shared launch gate most recently documents workflow `43549078806` (6 payment passes, 3 skips); receipt delivery, bank payout, partial refund, Stripe Tax, promo/add-on/deposit accounting, webhook replay and stable experience identity remain open. Developer/Hunter QA own booking/payment, Landowner QA payout, Legal tax, Growth directory. No main/live changes.


## 2026-11-14 — Narrow-card long-label overflow hardening
- **PASS (staging source):** commit `a3ab1de511a2bcfd62a3ace0b074f0076f853eae` adds scoped wrap/min-width rules for outfitter title, price, county/species, and action text. Protects 320px mobile cards against long unbroken or user-supplied labels without changing payment/booking logic. Re-fetched source to verify.
- **NOT TESTED:** actual browser viewport matrix (320/375/390/430/768/1024/1280/1440/1920/2560), synthetic long-label fixture, Cloudflare deployment, touch/keyboard/zoom, Stripe TEST reconciliation. Do not call this a browser PASS.
- **NO-GO:** latest shared Stripe gate records 6 PASS / 3 SKIP in run `43549078806`; delivered receipts, external-bank payout, partial refunds, Stripe Tax registration, promo/add-on/deposit accounting, webhook replay and stable outfitter experience IDs remain open. Growth owns public directory presentation; Developer/Hunter QA payment/booking; Landowner QA payout; Legal tax/legal release. No production/main changes.


## 2026-11-14 — Outfitter species metadata normalization
- **PASS (source):** commit `04257a7f6fed4b51f2c2f7ad99068c2c93369d1c` renders trimmed species labels from either a scalar string or array in the public outfitter directory. Previously only arrays displayed; valid string values were silently hidden. Text-only DOM insertion preserves escaping. Independently re-fetched staging source to verify. No booking, checkout, payment, database, main or production change.
- **NOT TESTED:** actual sandbox scalar-species fixture, Cloudflare deployed browser, 320/375/390/430/768/1024/1280/1440/1920/2560 widths, touch/keyboard/zoom, and fresh Stripe TEST E2E.
- **NO-GO:** latest shared Stripe gate (workflow `43549078806`) reports 6 payment passes / 3 skips; delivered receipts, external-bank payout, partial refunds, Stripe Tax, promo/add-on/deposit accounting, webhook replay, and stable unique experience IDs remain open. Growth owns public discovery; Developer/Hunter QA own payment/identity; Landowner QA payout; Legal tax/legal gate.


## 2026-11-14 02:29 ET — Outfitter scalar photo fallback
- **PASS (staging source):** commit `28b2a78c834b1186c54e3ea3d07b408203b0809e` accepts a single HTTPS image URL as well as an array of URLs in `outfitter_listings.photos`, trimming whitespace and rejecting whitespace-containing/missing or non-HTTPS candidates. Previously scalar photos always fell back to the generic placeholder, even when a valid photo was present. Scope is public `outfitters.html`; no payment, booking, Supabase, production or main changes.
- **NOT TESTED:** Browser fixture for scalar photos, deployed Cloudflare artifact, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, screen reader/keyboard/touch/zoom, real sandbox inventory and new Stripe TEST transactions. Source verification alone does not establish browser or deployment PASS.
- **NO-GO:** Stripe launch gate last documents workflow `43549078806` with six payment passes and three explicit skips. Receipt delivery, bank payout, partial refund, Stripe Tax, promo/add-on/deposit reconciliation, webhook replay and stable outfitter experience IDs remain open. Growth owns public directory; Developer/Hunter QA payment/identity; Landowner QA payout; Legal tax/release. Do not duplicate payment evidence entries.


## 2026-11-14 03:40 ET — Outfitter image failover
- **PASS (staging source):** `7d9d94eeb6b9df4ca7abf7029ef1e13e841e55fc` retries up to five distinct HTTPS photo URLs in order when an outfitter directory image fails to load. Previously the first broken image immediately replaced the card photo with a placeholder even if later photos were valid. Scalar and array inputs remain supported; invalid/non-HTTPS candidates are excluded. Source was re-fetched and checked. No checkout, payments, database, main, or live change.
- **NOT TESTED:** Browser fixture with broken first URL and working second URL, Cloudflare deployment, 320/375/390/430/768/1024/1280/1440/1920/2560 widths, screen reader/keyboard/touch/zoom, actual sandbox inventory, and fresh Stripe TEST reconciliation. Source PASS does not imply browser PASS.
- **NO-GO:** Shared payment gate last documents workflow `43549078806` with six passes and three skips; delivered receipt, bank payout, partial refund, Stripe Tax, promo/add-on/deposit accounting, webhook replay, stable experience IDs and attorney release remain open. Growth owns public discovery; Developer/Hunter QA own payment/identity, Landowner QA payout, Legal tax/release. Avoid duplicate payment evidence entries.

## 2026-11-14 03:55 ET — Directory image URL hardening
- **PASS (staging source):** Commit `aee8a515216411b5db3ee962d4cda027c3147b1f` replaces permissive regex-only photo URL filtering with URL parsing, allowing HTTPS URLs with a hostname but rejecting malformed URLs and URLs containing embedded username/password credentials. This prevents credential-bearing external image addresses from being loaded by the public directory. Existing five-photo fallback remains. Re-fetched `outfitters.html` on staging and confirmed the guard. No payment, booking, database, main or live changes.
- **SOURCE REVIEW:** Directory now pages through up to 600 records, with a 601st-record probe and fail-closed behavior if the limit is exceeded; earlier notes describing a 60-record *total* cap are outdated. Unique experience identity remains unresolved because detail links still use outfitter `user_id` rather than listing ID.
- **NOT TESTED:** Browser fixtures for malformed/credential URLs, deployed Cloudflare behavior, responsive 320/375/390/430/768/1024/1280/1440/1920/2560, keyboard/zoom, authenticated Stripe TEST card flow and Stripe/Supabase reconciliation. No test payment initiated.
- **NO-GO:** Continue withholding launch readiness pending tax classification/registrations, receipt/refund/payout evidence and authenticated booking E2E. Developer/Hunter QA own payment and unique identity; Landowner QA owns reconciliation; Legal owns tax policy.


## 2026-11-14 05:11 ET — Outfitter image URL normalization guard
- **PASS (staging source):** `5342f3a9eb21627fe6a572277ab61f57dcf6a01b` rejects whitespace, embedded line breaks and ASCII control characters in external image URLs before WHATWG URL parsing. Browsers may normalize line breaks in otherwise HTTPS URLs, so this prevents surprising outbound image requests and preserves the existing five-image failover and no-credentials policy. Independently re-fetched the staging source and verified the guard. No checkout, payment, database, production or main changes.
- **NOT TESTED:** Cloudflare deployment, browser fixtures with embedded CR/LF/control characters, actual sandbox inventory, ten responsive widths, keyboard/touch/zoom, and fresh Stripe TEST reconciliation. Source verification is not an E2E pass.
- **NO-GO:** Latest shared Stripe report `43549078806` shows 6 PASS / 3 SKIP. Receipt inbox, bank payout, partial refund, Stripe Tax, promo/add-on/deposit economics, webhook replay and stable experience IDs remain open. Developer/Hunter QA own payment/identity, Landowner QA payout, Legal tax/release; Growth owns discovery. Do not duplicate payment evidence entries.


## 2026-11-14 06:40 ET — Cloudflare staging deployment verification (Growth)
- **PASS — Cloudflare deployment metadata:** Independently queried the `leasewild-sandbox` Pages project. Deployment `72effe93-6bbc-41f2-9c2d-a49540d9df9d` succeeded at 2026-11-14 10:11:50 UTC for branch `staging/leasewild-full-clone`, commit `504b8064cafe251ed48d3993c7b1e48460e35054` (the prior Growth documentation commit). Deployment `05586951-c2da-4076-816d-5338e4b92601` succeeded at 10:11:42 UTC for Growth image-URL guard commit `5342f3a9eb21627fe6a572277ab61f57dcf6a01b`. Both are under the *sandbox* Pages project; Cloudflare calls label its deployment environment `production` because that is the Pages project's primary environment, **not** the live `leasewild.com` website.
- **PASS — latest sandbox Pages metadata at inspection:** deployment `8b75afe3-20fa-419f-844c-f092ae9bf80e`, branch `staging/leasewild-full-clone`, commit `bcfebb08d24b69d246497c71d24a23e64423c2eb`, status `success`, completed 2026-11-14 10:44:23 UTC. This is a newer team commit; no Growth claim about its code or E2E behavior.
- **NOT TESTED:** deployed HTML bytes, browser execution, actual inventory, ten viewport sizes, touch/keyboard/zoom, screen reader, and fresh Stripe TEST reconciliation. Cloudflare deployment success is **not** proof that the directory works in-browser. No synthetic fixtures were created in this check.
- **NO-GO:** preserve payment gate ownership; receipt delivery, bank payout, partial refunds, Stripe Tax and other documented release gates remain open. No changes to checkout, production Supabase, live Stripe, GitHub main, or live leasewild.com.


## 2026-11-14 07:13 ET — Reject padded external photo URLs before normalization
- **PASS (staging source):** `cf6b65491121ea5960a951f0ba96e058e440014f` removes the `.trim()` normalization that previously occurred *before* the whitespace/control-character guard in public `outfitters.html`. Previously a photo URL with leading/trailing spaces was silently accepted despite the stated rejection policy; it now fails validation before `new URL(...)`. Valid HTTPS images and five-image failover are unchanged. This is a minimal reversible directory-only fix; no checkout, booking, Stripe, database, main, or production changes.
- **NOT TESTED:** Browser malformed-photo fixture, deployed Cloudflare artifact, actual sandbox inventory, responsive 320/375/390/430/768/1024/1280/1440/1920/2560 widths, touch/keyboard/zoom and new Stripe TEST transactions. Source-level fix must not be reported as browser PASS.
- **NO-GO:** Payment gate still documents delivered receipt, external-bank payout, partial refund, Stripe Tax registration, promo/add-on/deposit economics, webhook replay and stable outfitter experience identity as open. Growth owns directory presentation; Developer/Hunter QA booking/identity; Landowner QA payout; Legal tax/release. Do not duplicate the other teams' payment evidence.
