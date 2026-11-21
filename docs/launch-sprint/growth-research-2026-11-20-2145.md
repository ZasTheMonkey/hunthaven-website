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
