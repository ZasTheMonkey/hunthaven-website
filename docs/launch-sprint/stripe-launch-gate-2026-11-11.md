# LeaseWild Stripe launch gate — 2026-11-11 (SANDBOX ONLY)

Scope: GitHub `ZasTheMonkey/hunthaven-website` branch `staging/leasewild-full-clone`, Cloudflare `leasewild-sandbox.pages.dev`, sandbox Supabase `kbkdfpmlyggfijkyjxoi`, Stripe sandbox `acct_1TOJ2rAO40Rp32aF` ONLY. Never push/merge/deploy to main or live leasewild.com. Never use Stripe livemode or real cards. Owner's explicit **Go Live!!** required before any production deployment.

## Initial independent audit (read-only)

- PASS — Stripe sandbox connector selected; not live account. 10 test Checkout Sessions, including completed paid and completed unpaid/manual-capture/canceled scenarios. 14 PaymentIntents, successful, canceled and released/declined simulation. 7 Stripe test refunds with status succeeded.
- PASS — One enabled webhook endpoint `/functions/v1/sandbox-booking-webhook`; subscribed events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
- PASS — Verified relevant Supabase Edge Functions ACTIVE: `sandbox-booking-checkout`, `sandbox-booking-webhook`, `sandbox-booking-approval`, `sandbox-booking-expiry`, `sandbox-booking-cancel`.
- REVIEW — Current landowner checkout uses manual-capture authorization: user authorizes card, owner approves within 24 hours, capture on approval. Checkout and approval functions enforce test-mode keys. Webhook validates signature and Stripe state. Actual browser E2E tests are NOT VERIFIED by this audit.
- REVIEW — 6 of 13 sandbox bookings are cancelled, 2 confirmed, 1 declined, 2 expired, 2 pre_reserved. 6 cancelled booking records have test payment-intent IDs; one full refund >48h before checkin was found, while later cancellations match the sandbox's no-refund-within-48h policy. Check all cancellation economics, business approval and date/timezone logic.
- BLOCKER — Stripe Tax settings status **pending** (head office missing); 0 tax registrations. Sandbox checkout/policy code applies a flat 6.5% to lease amounts. This is NOT a validated tax treatment; do not assume it applies to all rentals, guided services or jurisdictions. Owner/tax advisor must confirm tax obligations before live charges. Do not add fake registrations or enable Stripe Tax without them.
- BLOCKER — `public.outfitter_stripe_accounts` has 0 rows, hence 0 payout-ready outfitters. Stripe sandbox has 2 connected test accounts, but they are not linked to outfitters through the LeaseWild sandbox data. Need test outfitter onboarding and destination payout using synthetic identities.
- REVIEW — Outfitter booking requests currently include a declined/unpaid test. No end-to-end paid outfitter reservation is proven.
- REVIEW — Webhook handler only handles booking checkout completed, async success, expired and ignores payment-intent capturable; no async-failed, refund/dispute lifecycle evidence. Confirm actual requirements for enabled payment methods and expected financial reconciliation.
- REVIEW — Supabase security advisor flags anon callable `public.enqueue_pending_listing_notification()` security-definer function; verify revoke externally callable EXECUTE. Other function warnings may be intentionally authorization-gated. Leaked-password protection disabled.
- REVIEW — Existing `stripe-checkout` / `cleaning-deposit` legacy or alternative functions use Stripe SDK v14.25.0 and Stripe API 2023-10-16. Confirm which flows are deployed and called; don't confuse legacy paths with active booking checkout. Some carry an older production-origin CORS setting despite being present in sandbox; inspect carefully.
- NOT TESTED — New test-card Checkout UI flow run, declined card retry, 3DS authentication, double-submit/concurrent bookings, price and discount/add-on verification, cleaning deposit hold/capture/release, voucher/promo, chargebacks, settlement, webhook delivery retry, failure recovery, payout reconciliation, mobile checkout.

## Bots: mandatory immediate launch-day Stripe QA

- Designer/Developer: isolate exact active browser checkout routes, inspect deployed sandbox vs staging commits, test manual capture > decline/approve > webhook, reconcile Stripe + Supabase statuses, locate and fix errors. Test simultaneous requests / booking collision. Investigate security and mixed-origin/legacy Stripe functions.
- Hunter QA: real browser Stripe TEST card flow, success, declines, 3DS, retries, two-click duplicate attempt, guest cancellation before/after 48-hour deadline, booking status and receipt/confirmation; collect evidence.
- Landowner QA: owner approval within deadline triggers exactly one capture, decline releases auth, expired approval returns inventory and releases holds, property payout/connect readiness, cleaning damage-deposit lifecycle (hold, release, allowed claim) test mode.
- Legal Risk Review: verify cancellation language, tax treatment and chargeback/dispute policies vs actual UI/handlers; note legal/tax uncertainties, privacy of payment data, no misrepresenting capture/refund outcomes.
- Growth Research: test checkout fee/total transparency, tax line display, promo code, hog-hunting add-ons, confirmation messages; prioritize conversion-safe fixes, avoid paid campaigns/launch announcements before gate passes.

## Required proof before calling Stripe launch-ready

1. Actual UI tests using Stripe official TEST cards only, report Test IDs and screenshot/visible result with PASS/FAIL/BLOCKED, no real PAN.
2. For each payment: verify Stripe Checkout Session, PaymentIntent, Supabase booking/request state, webhook delivery and expected messages.
3. Approval/decline/refund/expiry/deposit/duplicate/Connect paths verified; failure cases do not charge unexpectedly and never overbook.
4. Complete policy and tax review; real registration and correct tax class handled outside sandbox only with owner's explicit approval.
5. No security/privacy regressions and no production secrets in client code. Never modify Stripe live mode or GitHub main.
6. Report individual blockers clearly. Do not declare launch ready solely from registered endpoints or historic test records.

Findings are read-only observations, not proof of today's new E2E test execution. Continue scheduled QA and fix issues in staging/sandbox only; report reproducible evidence and commit SHA.
