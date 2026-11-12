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
