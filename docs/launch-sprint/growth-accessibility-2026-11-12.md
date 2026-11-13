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
