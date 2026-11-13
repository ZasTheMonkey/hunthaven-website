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
