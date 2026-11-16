# Growth Research — outfitter mobile navigation, 2026-11-16

Owner: Growth Research. Scope: sandbox staging only. Coordinate with Hunter/Landowner/Payments/Legal owners; no payment files changed.

## Reproduced source-level defect — FAIL before fix

`outfitters.html` hid `.nav-links a:not(.nav-mob-cta)` at widths <=768px, while `.nav-mob-cta` was also `display:none`; `.mobile-menu-btn` was styled but no actual button existed in the nav markup. This made Browse Land, Fishing, Outfitters, About and login navigation inaccessible on narrow screens. Evidence: staging source inspected 2026-11-16, pre-fix blob `8b923a8fa8921f4ececa71c5dce729f5de23a79a`.

## Implemented staging fix — PASS source inspection, deployed/browser NOT TESTED

Commit `1ea6e56e2f1c29637bcf0b81670ae1eaa6ab3c6c` adds a 44px minimum mobile menu toggle, accessible name/expanded state, keyboard Escape dismissal/focus restoration, outside-click dismissal, and a mobile dropdown with 44px link targets. Desktop nav unchanged. No Stripe, Supabase, checkout or production code changed. The fix was committed to `staging/leasewild-full-clone` only.

## Verification remaining

- NOT TESTED: independent Cloudflare deployment and DOM interaction at 320,375,390,430,768,1024,1280,1440,1920,2560 widths; keyboard, touch, zoom, browser screenshot, Lighthouse and screen reader.
- NOT TESTED: actual sandbox listing inventory, authenticated conversion and Stripe TEST reconciliation.
- Retest mobile toggle opening, link visibility, Escape focus, outside click, login links, desktop menu, and absence of overflow once browser access is available.
- Stripe launch gate remains NO-GO per `stripe-launch-gate-2026-11-11.md` until outstanding payment/tax/refund/payout/legal gates have evidence. No claim of launch readiness.

## 2026-11-16 follow-up — mobile cascade regression corrected

- **FAIL (source cascade):** A later `#lw-growth-directory-nav-fix` style block forced `.nav .nav-links{display:flex!important}` even at <=768px, overriding the initial mobile `.nav-links{display:none}` and showing the dropdown before the toggle was activated. The same block forced login links visible on narrow screens. This contradicted the mobile toggle's `aria-expanded=false` state.
- **PASS (source fix):** Commit `59de231df44d531be59ae7f0adda552954cff23c` adds a narrow-screen override *after* the tablet/light-theme rules. The dropdown is hidden by default and shown only with `.is-open`; menu links retain 44px targets, and the 72px mobile header remains single-row. Re-fetched the staging file and confirmed the new rules and existing toggle/Escape handlers are present. No payment or Supabase files changed.
- **NOT TESTED:** Browser CSS computed styles, real touch/keyboard interactions, screenshots at the ten widths, and Cloudflare deployment. This is source-level verification only, not a browser PASS.
- **NO-GO:** Stripe receipt delivery, external-bank payout, partial refunds, Stripe Tax, legal and authenticated end-to-end gates remain open. Keep production untouched.
