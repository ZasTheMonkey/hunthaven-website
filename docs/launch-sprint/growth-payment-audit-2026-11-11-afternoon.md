# Growth Research sandbox QA — 2026-11-11 afternoon

Scope: staging/leasewild-full-clone, sandbox only. No production access or live charges.

## Evidence and statuses
- PASS — Read shared Stripe launch gate and confirmed sandbox project IDs before testing. Stripe account list explicitly shows leasewild sandbox as livemode=false. No operations against live Stripe.
- PASS — Read current staging outfitter-pay.html and outfitter-experience.html. Outfitter flow now includes request-first and separate accepted-request Stripe TEST checkout; prior report claiming no payment UI is stale. This is source inspection only, NOT E2E proof.
- PASS — Read-only sandbox Supabase query: outfitter_stripe_accounts count = 1; bookings count = 13; outfitter_booking_requests statuses accepted=1, declined=1. Earlier launch report's zero linked accounts is stale; payout readiness of that row NOT VERIFIED.
- PASS — Read Stripe TEST Checkout Sessions (GetCheckoutSessions, limit=5). Historical sessions include paid and unpaid statuses; not evidence of a fresh end-to-end run.
- PASS — Conversion fix: accepted outfitter checkout now displays recorded request amount when valid, with a reminder to verify final total and taxes at Stripe. Source commit ec211ea41a6537abf416ba6aa854a37924472732; independently refetched file and confirmed changed text. No payment handler changed.
- NOT TESTED — Fresh test-card checkout, refunds, captures, webhook delivery, deposits, promo/add-on math, browser visual screenshots, mobile viewport matrix, authenticated role permissions. No disposable authenticated sandbox browser identity/session was available in this execution.
- NOT VERIFIED — Cloudflare deployment of the conversion fix; do not claim it is live in sandbox until verified.
- BLOCKER — Stripe Tax configuration still listed pending/no registrations in shared gate; not rechecked in this pass. Tax treatment requires actual business registration information and legal review, not fabricated settings.

## Handoffs
- Hunter QA: use dedicated synthetic hunter to complete accepted outfitter request -> TEST card checkout -> verify payment_status and webhook; test 3DS/decline/duplicate submits and 320–2560px.
- Landowner QA: test capture/decline/cancel/refund/cleaning-deposit economics and database reconciliation.
- Designer/Developer: verify staging deploy SHA, test accepted outfitter checkout amount display and Stripe final total, add-ons and promo; investigate all UI pages.
- Legal Risk: verify tax and cancellation treatment; avoid declaring launch-ready.

**Release gate: NO-GO** until fresh end-to-end evidence is recorded. Never deploy to main or leasewild.com without exact Go Live!! authorization.
