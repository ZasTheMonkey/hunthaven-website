# LeaseWild Legal Risk Review — sandbox staging

_Last reviewed: 2026-11-10 (America/New_York)_

## Decision: NO-GO for production

Scope: repository `ZasTheMonkey/hunthaven-website`, branch `staging/leasewild-full-clone`. No production resources or real identities accessed. This report is issue spotting, not legal advice or attorney approval.

## Evidence and status

| Area | Status | Evidence / next action |
|---|---|---|
| Coordination | PASS | Read `docs/launch-sprint/README.md`, `launch-readiness.md`, `access-zones-reviews-schema-draft.sql`, and `docs/legal/website-compliance-design-status.md` from staging. |
| Access-zone precise location privacy | FAIL (design gate) | Draft SQL itself documents publicly selectable listing rows containing street address and geometry. Client-side hiding cannot enforce privacy. Replace broad public listing reads with a reviewed safe-column public projection and enforce booking-scoped precise-geometry RLS; do not run draft migration. |
| Access-zone hunter authorization | BLOCKED | Draft policy intentionally denies all hunter reads pending verified payment/booking lifecycle and bounded access period. Require cross-owner, anonymous, expired, cancelled and refunded negative tests with sandbox identities. |
| Hunter review eligibility | FAIL (draft compatibility) | Draft refers to `bookings.owner_id`, `hunter_id`, `completed_at` that its own read-only schema notes say are absent. Join authoritative sandbox `lease_payments` and booking lifecycle before any migration. |
| Hunter review moderation | NOT TESTED | Draft defaults to pending and requires pending on insert; verify no browser path can publish/edit/delete, one review per completed booking, reporting and appeal workflow. No real-user review tested. |
| Terms/waiver disclosure | NOT TESTED | Homepage currently says 'Digital liability waiver signed at checkout' (index.html around line 1501). Verify actual checkout gate, version, affirmative acceptance, accessible link, receipt and durable consent audit before asserting. Attorney approval required. |
| Terms/privacy links | NOT TESTED | Homepage footer links `terms.html`, `privacy.html`, and reuses `terms.html` for 'Landowner Agreement'. Verify page existence, content, agreement differentiation, effective dates and consent evidence; do not treat a link as valid acceptance. |
| Booking/message deletion and retention | BLOCKED | Establish retention schedule, legal hold, user deletion rights, and moderation/incident needs before deleting threads after checkout. Test cross-role isolation and cancelled/refunded access. |
| Payments, refunds, coverage claims | BLOCKED | Reconcile Stripe TEST transaction lifecycle and refund/cancellation terms; substantiate any insurance/coverage promises with actual policy and exclusions. Do not promise immunity from lawsuits. |
| Responsive, keyboard, zoom, cross-role E2E | NOT TESTED | No controlled browser sessions or device-width evidence in this legal run. Do not infer PASS from source review. |
| Production | PASS (scope restriction) | No action taken against `main`, leasewild.com, production Supabase, live Stripe, or customer accounts. |

## P0 handoff for other bots

**Designer/Developer:** remove or qualify the checkout waiver assertion unless implemented and evidenced; do not expose exact addresses or polygon geometry in public listing payloads. Verify footer terms/privacy and distinct landowner agreement. Keep payment code unchanged.

**Landowner QA:** test owner/other-owner authorization for zones, parking/entry points and uploaded proof of ownership; verify no sensitive coordinates or documents leak to anonymous requests.

**Hunter QA:** verify location disclosure only for eligible booking windows, revoke on cancellation/refund/expiry, test review visibility and abuse reporting with synthetic identities.

**Growth:** avoid categorical 'verified', 'insured', 'risk-free', 'waiver included' and regulatory-compliance guarantees without documented evidence and legal approval.

## Release requirements

Florida-licensed attorney review of terms, waiver, privacy, host agreement, insurance, cancellation/refund, user-generated reviews and relevant hunting/fishing rules; authenticated negative-case RLS tests; real sandbox-only Stripe TEST reconciliation; accessible acceptance flows; and documented responsive QA. Until these are evidenced, NO-GO. This report does not authorize applying the guarded SQL draft.
