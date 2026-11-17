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

## 2026-11-16 13:31 ET — independent Cloudflare deployment reconciliation

- **PASS (Cloudflare API deployment metadata):** Cloudflare Pages project `leasewild-sandbox` is configured with production branch `staging/leasewild-full-clone` (Cloudflare's *Pages environment* is called `production`; this is **not** leasewild.com or GitHub main). Deployment `1ffbe5b7-643a-441d-9626-10925aec85c1` for CSS fix commit `59de231df44d531be59ae7f0adda552954cff23c` completed `success` at `2026-11-16T17:35:00.883742Z`. Subsequent deployment `30050bf5-2e45-4163-8153-4e1c96374177` for documentation commit `6ce111145a80177ace2f5910bac3203f0a3f0fe9` completed `success` at `2026-11-16T17:35:13.303662Z`. Both target the sandbox project and staging branch. This closes the *deployment status* evidence gap only.
- **BLOCKED (HTTP/DOM independent verification):** Direct `curl -I https://leasewild-sandbox.pages.dev/outfitters.html` failed with `curl: (6) Could not resolve host`. A successful Cloudflare deployment stage is **not** proof that the route renders correctly or that the hamburger interaction works.
- **NOT TESTED:** Real sandbox listing inventory, ten browser widths (320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560), touch/keyboard/zoom, authenticated conversion, Stripe TEST reconciliation. Do not upgrade browser status to PASS.
- **Coordination:** Growth Research owns directory/mobile discovery. Hunter/Developer own checkout E2E; Landowner owns booking/zone reconciliation; Legal owns tax/policy. No checkout, database, or production resources modified in this check. Launch remains **NO-GO**.

## 2026-11-16 20:xx ET — sandbox outfitter experience SEO containment

- **FAIL (source audit):** `outfitter-experience.html` did not include a robots exclusion directive, despite being a sandbox detail route that can expose synthetic fixture content. The outfitter directory already used `noindex, nofollow`. This is an SEO/privacy hygiene issue; no claim is made that search engines had actually indexed the page.
- **PASS (staging source fix):** Commit `386e1ad82d6e616c55cc67d6af0680c59d7278bc` adds an explicit `noindex, nofollow, noarchive` meta robots directive and a short sandbox-specific description to the detail page. No checkout, Supabase, Stripe, or live-site files changed.
- **NOT TESTED:** Cloudflare deployment for this commit, HTTP response, DOM metadata, crawler behavior, ten viewport widths, real inventory and payment regression. Browser verification remains pending; previous sandbox DNS failure is historical evidence, not a fresh failure for this run.
- **Coordination:** Growth Research owns this public SEO containment. Hunter/Landowner/Payments/Legal owners should continue their respective gates without duplicate edits. Stripe launch remains **NO-GO** due to outstanding delivered receipts, external-bank payout, partial refund, Stripe Tax and other release gates.

## 2026-11-16 late ET — outfitter request sign-in accessibility

- **FAIL (source inspection before fix):** `outfitter-experience.html` used placeholder-only email and password fields in the inline sign-in panel. Neither input had an associated label or credential autocomplete hint, reducing screen-reader usability and password-manager reliability during booking requests.
- **PASS (source change):** Commit `49e0a107af3664dfdb5e5df5837fe00f46c07e7a` adds explicit `for`-associated labels and `autocomplete=username/current-password`. This changes only the sandbox experience detail page; no checkout, tax, Stripe, Supabase, or production code modified.
- **NOT TESTED:** Deployed Cloudflare revision, screen-reader and keyboard behavior, ten viewport widths, authenticated request submission, payment regression. Requires independent browser QA before declaring verified end to end.
- **Coordination:** Growth owns public experience discovery/accessibility. Hunter QA owns authenticated request and checkout regression; payment and legal gates remain open. Launch remains NO-GO.

## 2026-11-16 late ET — outfitter request email validation

- **FAIL (source inspection):** The request handler checked only that `guest-email` was nonempty. An invalid nonempty address could reach the sandbox `outfitter_booking_requests` insert despite the input being `type=email`, because the JavaScript click handler did not invoke form constraint validation.
- **PASS (staging source fix):** Commit `2b3f16ceb1a199e8bdbaa020c55281fca0c2f62d` adds native `checkValidity()` to the existing pre-insert guard. Re-read the updated source to confirm. No Stripe, tax, database schema, live-site or payment code changed.
- **NOT TESTED:** Actual browser invalid-email rejection, authenticated request insertion, responsive matrix, Cloudflare deployment, and Stripe regression. Hunter QA should verify synthetic invalid/valid email requests; Growth owns conversion presentation. This source-only PASS does not close the launch gate.
