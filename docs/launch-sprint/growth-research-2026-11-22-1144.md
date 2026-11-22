# Growth Research — 2026-11-22 11:44 ET (staging-only)

## Scope and evidence
- Read current staging `outfitters.html` (blob `32f7df1ef1ad21b897283959c0e318bcefb607bf`) and `docs/launch-sprint/stripe-launch-gate-2026-11-11.md` (blob `211cbf2939e3ca45ec10f462b8450ece836ee088`). No sandbox identities, payment methods, production resources or databases accessed.
- BLOCKED — independent web retrieval of `https://leasewild-sandbox.pages.dev/outfitters.html` returned an inaccessible-source error. This is not evidence of a Cloudflare outage.
- NOT TESTED — actual inventory, responsive browser widths 320/375/390/430/768/1024/1280/1440/1920/2560, keyboard/touch/zoom, checkout, receipts, webhook reconciliation, tax or payouts.

## Newly isolated conversion issue (source-verified)
- FAIL / conversion — `outfitters.html` explicitly displays **“Outfitter applications — temporarily unavailable”** and links visitors to terms instead of an onboarding route. This prevents new outfitters applying from the public directory. This may be an intentional feature gate, not a regression; product owner/Outfitter QA should confirm whether onboarding is currently meant to be enabled before changing it. Do not bypass account verification.
- REVIEW / presentation — image rules conflict in the same file: earlier `.experience-card__media img` sets `object-fit:cover`, later selectors override to `contain!important`, with `max-height:440px!important` and auto aspect ratio. Source proves competing rules, not a visual defect; compare actual photographs and card height at requested widths before editing.
- OPEN / conversion — existing multi-experience outfitter identity-versus-listing routing defect remains documented in prior Growth Research notes. Avoid touching checkout routing until listing ID contract is verified with Hunter QA.

## Stripe launch gate
- PASS (historical document read only) — launch-gate report has sandbox-only test evidence, not a new run.
- NOT TESTED in this run — no Stripe TEST session, PaymentIntent, refund, webhook, payout or Supabase row reconciliation. Do not treat historic passing tests as current readiness.
- OPEN — Stripe Tax registration/classification, delivered receipts, partial refunds, external-bank payout proof, and complete authenticated end-to-end evidence.

## Coordination / action
- Outfitter/Hunter QA: verify whether public applications should be enabled; if yes, implement verified onboarding destination and E2E test. Confirm listing-specific details and booking IDs across checkout.
- Designer/Developer: browser-check photograph crop, card heights and overflow before consolidating CSS.
- Growth Research: revisit live sandbox inventory and ten widths once browser access succeeds; do not infer PASS from source.
- No application code, payment, database, deployment or production changes this run. Launch NO-GO.
