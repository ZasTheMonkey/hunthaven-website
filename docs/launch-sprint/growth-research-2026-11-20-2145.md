# Growth Research — 2026-11-20 21:45 ET (sandbox staging only)

## Confirmed accessibility defect and fix
- FAIL (source, before): `outfitter-pay.html` login email and password inputs used placeholder text without programmatic labels; screen-reader and speech-input users lacked reliable field names.
- FIXED / PASS (staging source read-back): added explicit `<label for="email">` and `<label for="password">` plus `required` attributes, retaining existing IDs, auth handlers, and Stripe checkout flow.
- Code commit: `483fe353c4b94fb68e36d20eedf5fa119678cd91`. Confirmed fetched blob SHA `d97234f3672f6772ac855bec736e3f597eec0dc0` contains both labels. Reversible one-file change.
- BLOCKED (deployed verification): independent retrieval of `https://leasewild-sandbox.pages.dev/outfitters.html` through web service was inaccessible. This does not prove Cloudflare outage or successful deployment.
- NOT TESTED: screen reader, rendered page, 320/375/390/430/768/1024/1280/1440/1920/2560 widths, touch, keyboard, zoom, authenticated conversion, Stripe TEST card flow, webhook, database reconciliation.
- Existing checkout copy explicitly warns that a synthetic outfitter without Stripe Connect can result in a platform-held TEST charge with no outfitter payout. Do not interpret a platform-only payment as proof of Connect readiness.
- NO-GO: Tax treatment, receipts, partial refunds, payout readiness and E2E reconciliation remain launch-gate items; see `stripe-launch-gate-2026-11-11.md`.

No production access, no real accounts, no test payments or database mutations, no main/live deployment. Other QA roles retain payment and payout ownership.

## 2026-11-20 22:27 ET — Outfitter directory responsive filter fix
- FAIL (source before): both filter labels had `flex-basis:100%` in one wrapping flex row, while inputs were independent flex children. At narrow widths, labels could be visually detached from their respective fields, harming form comprehension and conversion.
- FIXED / PASS (staging source read-back): wrapped each existing label and input in a `.lw-directory-field` column, with `flex:1 1 220px`, `min-width:0`, and full-width inputs. Preserved IDs, accessible `for` associations, filter handlers, pricing rules, booking links and payment logic.
- Code commit `5f5bd86caf6f3cd45fb5cfb71932f31b63aee217`; fetched new blob SHA `906fb050160dff96592addad5dcb03ec5675aa55` and verified expected markup/CSS. One-file reversible staging-only fix.
- NOT TESTED: deployed Cloudflare rendering, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, touch, keyboard/zoom, authenticated conversion, fresh Stripe TEST payment and database reconciliation. Source read-back is not deployed/browser verification.
- Launch NO-GO: maintain existing Stripe Tax, receipt delivery, partial refund, Connect external-bank payout and full E2E evidence gates. Other QA roles retain Stripe/payment test ownership. No main/live/production changes.

## 2026-11-21 01:21 ET — Directory input-height regression (source audit)
- FAIL (CSS source): after the previous label/input grouping change, `.lw-directory-search input{flex:1 1 220px}` applied a **220px flex-basis on the vertical axis** because `.lw-directory-field` uses `flex-direction:column`. This can make search and max-price inputs abnormally tall, particularly on narrow viewports. This is a deterministic CSS layout defect; actual rendered size was not measured.
- FIXED / PASS (staging source): changed the nested input flex declaration to `flex:none` while preserving the parent field's responsive `flex:1 1 220px`, input `width:100%`, 48px minimum height, labels, IDs, event handlers and filtering behavior. Reversible one-file change, commit `4ce8e8d80e1637fc8ae782d6c465362cbb2c7b66`.
- NOT TESTED: deployed Cloudflare behavior, ten requested browser widths, touch/keyboard/zoom, live inventory, conversion, Stripe TEST charge/refund or database reconciliation. Payment code untouched. Do not call deployment or browser PASS based on source.
- Launch remains NO-GO; see shared Stripe launch gate for outstanding tax, receipts, partial refunds, external bank payout and end-to-end reconciliation. No main/live/production changes.

## 2026-11-21 05:49 ET — Outfitter checkout sign-in keyboard and validation
- FAIL (source before): `outfitter-pay.html` had required email/password inputs inside a `section`, with authentication bound only to button `onclick`. Native form constraint validation did not run on click and pressing Enter in a field did not submit reliably.
- FIXED / PASS (staging source): changed the login container to a `form`, set button `type=submit`, and handled form `submit` with `preventDefault()` while retaining the same Supabase auth call and checkout logic. Reversible one-file commit `fd6a761dfe0bcaf730ece2613b55d84ad7186189`.
- BLOCKED (independent sandbox HTTP): public sandbox outfitter URL inaccessible via web retrieval service; not evidence of Cloudflare outage.
- NOT TESTED: rendered Enter-key submission, screen reader, 320/375/390/430/768/1024/1280/1440/1920/2560 viewport matrix, authenticated flow, Stripe TEST payment/refund, database reconciliation.
- Shared Stripe launch gate remains NO-GO: receipt inbox, partial refunds, external-bank payout, tax registration/classification, promo/add-on/deposit economics and webhook replay remain unproven. No production/main/live changes.

## 2026-11-21 12:05 ET — Growth conversion risk: multiple trips per outfitter
- REVIEW / source-confirmed behavior: `outfitters.html` fetches active `outfitter_listings` records but builds experience links as `outfitter-experience.html?id=<user_id>`. It counts listings per `user_id` and intentionally disables all detail/booking links for an outfitter with more than one active experience. This is a fail-closed safeguard against routing a hunter to the wrong trip, **not** evidence of a deployed runtime bug. The behavior can suppress conversion as legitimate outfitters add multiple trips.
- Next scoped implementation: coordinate with outfitter/booking owners to make detail and checkout resolve an immutable **listing ID** end-to-end, enforce authorization against that listing, and add synthetic tests for two active experiences under one outfitter (distinct price, add-ons, dates, and Stripe TEST reconciliation). Do **not** simply remove the ambiguity guard or change the directory URL without matching downstream support.
- PASS (source inspection only): directory pagination includes an extra-row overflow probe; filter controls validate maximum price and use text-only DOM construction for listing fields. Sandbox-specific `noindex, nofollow` metadata is present.
- BLOCKED (independent deployed HTTP): `curl -I -L --max-time 10 https://leasewild-sandbox.pages.dev/outfitters.html` returned `curl: (6) Could not resolve host` from this runtime. This is a retrieval/DNS limitation, **not** proof of Cloudflare outage.
- NOT TESTED: actual approved inventory, 320/375/390/430/768/1024/1280/1440/1920/2560 rendered widths, keyboard/touch/zoom, checkout, TEST Stripe objects, webhook and database reconciliation. No new source code, payment logic, fixtures or production resources changed.
- Launch remains NO-GO per the Stripe launch gate (tax classification/registration, delivered receipts, partial refunds, external-bank payout and full E2E evidence).


## 2026-11-21 14:30 ET — Pagination determinism follow-up (Growth Research)
- REVIEW (source): `outfitters.html` fetches active directory records with `order=updated_at.desc,user_id.asc`, paginated by offset/limit (60 records per page). `user_id` is demonstrably non-unique when an outfitter owns multiple experiences; `updated_at` may also tie. Consequently the ordering is not guaranteed unique across page boundaries. With tied keys or concurrent updates, an offset-paginated snapshot can repeat or omit rows, affecting the per-outfitter ambiguity count and discoverability. This is a source-level risk, **not a reproduced sandbox failure**.
- Suggested coordinated fix: verify `outfitter_listings` has a stable unique listing `id`, append it as the final order key, and ideally use a consistent snapshot/keyset strategy when inventory changes mid-fetch. Test two listings with identical `updated_at` and `user_id` straddling a page boundary; assert no missing/duplicate IDs and correct booking-unavailable behavior. Do not remove the current ambiguity guard without listing-ID checkout routing and Stripe TEST reconciliation.
- PASS (read-only): reviewed current staging directory source and launch gate. BLOCKED (deployed retrieval): web retrieval could not access `https://leasewild-sandbox.pages.dev/outfitters.html`; no outage conclusion. NOT TESTED: rendered widths, authenticated flow, synthetic fixtures, Stripe reconciliation. No application code, production data, live Stripe, or main branch touched.
- Launch remains NO-GO per shared Stripe gate: tax classification/registration, receipt delivery, partial refund, external-bank payout and complete E2E evidence outstanding.
