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


## 2026-11-11 evening — payment/privacy legal source review (staging)

**Scope/evidence:** Read the current staging versions of `docs/launch-sprint/stripe-launch-gate-2026-11-11.md`, `terms.html`, `privacy.html`, `outfitter-experience.html`, and `outfitter-portal.html` through GitHub. Source inspection only; no authenticated UI, Stripe mutation, or production access.

| Area | Status | Evidence and required action |
|---|---|---|
| Outfitter paid checkout | REVIEW | `outfitter-experience.html` now correctly distinguishes availability request from payment and links to `outfitter-pay.html`; `outfitter-portal.html` marks accepted paid vs awaiting payment. This supersedes earlier blanket claim that the interface cannot offer checkout. No fresh UI payment proof from this legal review. |
| Stripe TEST payment reconciliation | PASS (documented historical cross-system read only) | Shared launch gate records two $250 TEST PaymentIntents succeeded for outfitter bookings; both marked `platform_only_test=true`, without transfer_data/application_fee. They do **not** establish Connect transfer/payout readiness. |
| Connect payout | FAIL (launch gate) | One linked synthetic Connect outfitter is now documented, superseding the earlier zero-linked-accounts finding. Its accepted $200 request was unpaid at the last recorded read. Require paid linked-outfitter test, transfer and payout reconciliation before launch. |
| Cancellation | REVIEW | Shared report records a cancelled paid booking with zero refund under stored `no_refund` policy; Stripe charge remains succeeded. This is internally consistent with the stored decision, but **not** proof that the guest saw and accepted the 48-hour cutoff or that the correct local timezone was used. Preserve decision timestamp, check-in timezone, preview text, and consent evidence. |
| Contractual waiver | FAIL (claim/evidence mismatch) | `terms.html` asserts a “digital liability waiver signed at checkout” and contains sweeping release/non-suit language. No verified affirmative signature/versioned consent audit was presented. Do not assert legally effective waiver or immunity until counsel reviews scope/enforceability and actual signed evidence. |
| Outfitter eligibility | REVIEW | `outfitter-portal.html` signup asks users to confirm they hold an FWC license **or will obtain one before listing goes live**. Do not represent an outfitter as verified merely because this checkbox was checked. Confirm actual applicable licensing requirements with Florida counsel/FWC, then gate publication on appropriate verification. |
| Privacy/retention | REVIEW | `privacy.html` says account-closure data deletion typically occurs within 90 days, subject to legal records; booking/message retention and legal holds need operational confirmation. Do not automatically delete booking messages at trip end without retention and incident-hold controls. |
| Tax | FAIL (launch gate) | Shared Stripe Tax record shows pending configuration and no registrations; flat 6.5% tax logic is not validated across products/jurisdictions. Require real tax classification and registration advice; never fabricate registrations. |
| Responsive/keyboard/zoom/cross-role | NOT TESTED | No browser/device session or authenticated synthetic identities available to this source-only review. Ten viewport widths, RLS negative cases, terms checkbox persistence, and cancellation modal accessibility remain unverified. |

**P0 coordination:** Designer/Developer and Hunter QA: capture immutable checkout consent version/time/identity, verify policy preview before payment/cancellation, and complete linked-Connect Stripe TEST payout. Landowner QA: negative-case owner/other-owner boundary and review authorization. Growth: avoid implying waived liability, guaranteed insurance or completed refund without proof. Legal: require counsel to approve actual terms/waiver and tax classification. **NO-GO** remains; no live/main changes.


## 2026-11-12 — P0 cancellation policy contradiction (source-verified)

**FAIL — material consumer disclosure mismatch:** Current staging `terms.html` Guest Terms §5 (lines 353–358) promises a full refund minus the service fee **more than 72 hours** before a trip and no refund **within 72 hours**. The shared Stripe launch gate documents checkout/cancellation handling based on a **48-hour** cutoff and a stored `no_refund` decision. These are different customer contracts: for cancellations 48–72 hours before check-in, the application could grant a refund while published terms deny one, or vice versa depending on the actual active handler. Do not declare the cutoff legally verified. **Owner/Designer/Developer + Hunter QA:** inspect all live-in-sandbox landowner/outfitter checkout and cancellation handlers, define a single product-specific rule, and reconcile UI, terms, confirmation emails, backend policy and timestamp/timezone tests before launch. Do not silently revise published legal rights without legal review; preserve favorable treatment of affected bookings pending counsel decision.

**FAIL — waiver assent representation:** Current `terms.html` Guest Terms §4 (lines 349–351) says merely agreeing to terms constitutes signing a digital waiver and contains sweeping release language. No verified per-trip versioned assent/signature record is documented. **Developer/Hunter QA:** require affirmative accessible consent, identity/version/timestamp/audit record and receipt, then legal review of enforceability; until verified, remove unsupported marketing promises of signed waivers.

**REVIEW — cancellation test evidence:** Shared launch gate's cancelled $250 synthetic outfitter booking has a recorded no-refund result; this is not proof that 48h or 72h is the intended policy or that the user saw it. Run synthetic check-in-relative boundary cases at 47h59m, 48h01m, 71h59m and 72h01m, including local time zone/DST, refund Stripe TEST reconciliation and duplicate cancellation attempts.

**Status/evidence:** PASS staging source inspection (`terms.html`, `privacy.html`, `outfitter-pay.html`, shared Stripe launch gate); FAIL policy consistency; NOT TESTED authenticated browser checkout/waiver assent, Stripe TEST charge/refund, RLS isolation, viewport matrix. No payments, migrations, or production resources touched. **NO-GO** persists. This is issue spotting, not legal advice.
