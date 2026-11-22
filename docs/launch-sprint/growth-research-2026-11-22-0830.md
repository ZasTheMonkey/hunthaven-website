# Growth Research — 2026-11-22 08:30 ET — staging only

Scope: `staging/leasewild-full-clone`, public outfitter discovery and cross-role conversion. Source-only audit; no production resources.

## Reproducible source-level conversion defect

**FAIL (source-level routing, not a browser reproduction):** `outfitters.html` builds each experience link using `outfitter-experience.html?id=` plus `item.user_id`, rather than unique `item.id`. It intentionally disables cards for outfitters with more than one active listing (`counts.get(item.user_id)>1`). `outfitter-experience.html` then queries `outfitter_listings` with `user_id=eq.<id>` and refuses more than one result. Thus an outfitter with two distinct approved trips cannot expose either detail page or convert through the directory. This is a deterministic source-level limitation; actual sandbox inventory was NOT queried, so prevalence is unknown.

**Recommended reversible fix, coordination required with outfitter/payment owner:** Introduce a unique listing-ID route parameter, fetch the exact approved listing by `id`, preserve existing single-outfitter URLs as compatibility aliases only when unambiguous, and propagate the listing ID through request, approval, checkout, and webhook records with server-side authorization checks. Do not simply switch the directory link before verifying all downstream request/checkout functions: this would break existing flows or risk charging the wrong listing.

## Evidence

- `outfitters.html` staging blob `32f7df1ef1ad21b897283959c0e318bcefb607bf`: directory selects `id,user_id`, computes `ambiguous=(counts.get(item.user_id)||0)>1`, and links using `encodeURIComponent(item.user_id)`.
- `outfitter-experience.html` staging blob `045cad62340da384bb153d6a87d6031b2a8a6363`: reads `?id`, queries active listings by `user_id`, and rejects `data.length>1`.
- Stripe gate `docs/launch-sprint/stripe-launch-gate-2026-11-11.md` blob `211cbf2939e3ca45ec10f462b8450ece836ee088`: historical seven passed / three skipped; delivered receipt, partial refund and external bank payout not proven. Tax and promo/add-on/deposit economics still need validation.

## Test disposition

- PASS: Read current staging sources and launch-gate evidence.
- FAIL (source logic): Multi-experience discovery-to-details conversion is intentionally disabled.
- NOT TESTED: Actual sandbox inventory, all ten viewport widths, touch/keyboard/zoom, live Cloudflare deployment, authenticated booking, fresh Stripe TEST/Supabase reconciliation.
- OPEN: Stripe Tax jurisdiction/classification, delivered receipts, partial refunds, external bank payouts, promo/add-on/deposit reconciliation, and end-to-end authorization/messaging.
- NO-GO. No application edit, deploy, payment, account, or DB mutation. Main/live/production untouched.

Growth Research owns directory presentation and SEO. Coordinate unique listing-ID routing with the outfitter and payment owners before changing shared booking contracts.
