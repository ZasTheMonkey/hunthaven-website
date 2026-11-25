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


## 2026-11-13 — P0 guest refund fee contradiction and updated Stripe evidence

**FAIL — guest fee disclosure contradicts refund clause (source-verified):** Staging `terms.html` Landowner Agreement pricing §3 (around line 273) and Guest Terms pricing (around line 333) explicitly say LeaseWild's 20% commission is deducted from the host payout and **no service fee is charged to guests**. Guest Terms refund §5 (around line 355), however, promises a refund **minus LeaseWild service fee** when cancelled >72 hours before a trip. That deduction has no defined guest-paid fee basis and could lead to undisclosed withholding. Do not deduct a host-side 20% commission from a guest refund without a clearly disclosed, lawful and contractually consistent rule. **Designer/Developer + Hunter QA:** reconcile full amount paid, host-side fee, any separately disclosed nonrefundable amount, taxes, Stripe refunds, confirmation email and cancellation preview for both landowner and outfitter flows. Preserve historical booking terms; counsel must approve policy changes before publication.

**FAIL — 48h/72h mismatch persists:** Terms still say >72h/within 72h while shared launch-gate history describes 48h cancellation logic. Run 47h59m, 48h01m, 71h59m and 72h01m cases in the booking's local time zone, including DST and full/partial/no-refund accounting. Do not treat a passing Stripe refund as proof of correct customer disclosure.

**PASS — documentation reconciliation only:** Latest shared Stripe gate now records synthetic 20% Connect application-fee/transfer tests and successful full refunds (around lines 280, 298–311). This supersedes older assertions that no Connect transfer test existed. **NOT PROVEN:** connected-bank payout, partial refund, delivered receipt inbox, Stripe Tax registration/classification, and complete promo/add-on/deposit/duplicate-replay coverage (gate around lines 301–315). No new payment or sandbox database operation was performed by Legal in this run.

**NOT TESTED:** authenticated terms acceptance and versioned waiver signature, cross-role RLS and precise property-location leakage, moderation, browser screenshots, ten viewport widths, keyboard/touch/zoom. This is a staging source/document audit, not a browser E2E pass. **NO-GO** remains. No production, main, or live payment access.


## 2026-11-14 — P1 minor-guest privacy and duplicated-policy drift

**FAIL (source-level disclosure consistency):** Staging `terms.html` embeds a standalone "Privacy Policy" section that states in §8 "We do not knowingly collect personal information from children." The product's requested guest workflow explicitly collects guest names/emails for multi-person bookings and contemplates minors under 18 traveling with an adult. The actual implemented minor-data behavior has **not** been verified. Treat this as a potential material mismatch, not proof that minor data is currently collected. Developer/Legal: inventory fields, ages, legal guardian authorization, retention and recipients before implementing minors' guest data collection; align actual age gate and privacy language with counsel-approved policy. Do not automatically demand ID from minors.

**REVIEW (multiple public policy surfaces):** `terms.html` embeds a privacy policy while `privacy.html` separately publishes a privacy policy. Both are public-facing; update/version them together and verify footer and signup/checkout links target the authoritative current text. Do not treat either page as proof of affirmative waiver consent.

**PASS:** Read both staging legal files and existing shared launch-gate report. **FAIL:** inconsistent stated minor-data collection policy relative to planned workflow. **NOT TESTED:** authenticated minor guest submission, browser policy links, consent records, RLS, review moderation, responsive matrix, Stripe TEST transactions, Cloudflare deployment. **NO-GO** unchanged; no payment or production changes. This is issue spotting, not legal advice.


## 2026-11-15 — legal page theme and accessibility regression (source-verified)

**FAIL — contradictory light-theme declarations in legal terms:** `terms.html` begins with `<html lang="en" data-theme="light">` and defines light tokens under `:root,[data-theme="light"]`, but a later `[data-theme="light"]` rule overrides the same tokens with dark background (`#111410`), dark surfaces and light foreground. This is a deterministic CSS cascade conflict; the later rule wins absent a stronger external override. Two external theme stylesheets are loaded afterward, so the final computed visual theme requires browser verification. Designer/Developer should consolidate token definitions and verify default, toggled, Safari/Chrome, system dark mode, forced colors and 200% zoom. Do not assume the legal page is visually consistent with the homepage.

**REVIEW — legal accessibility:** The terms mobile menu button has an accessible name but its expanded state and focus behavior are not established from the reviewed markup. Verify keyboard activation, focus return, `aria-expanded`, Escape and visible focus. This is a test request, not a confirmed functional failure.

**PASS:** Read staging `terms.html`, `privacy.html`, the current legal report and Stripe launch-gate document. **FAIL:** source-level CSS theme token contradiction. **NOT TESTED:** browser computed styles across 320–2560px, authenticated terms assent, synthetic RLS, Stripe TEST flows, Cloudflare deployment and payouts. No payments or production resources touched. **NO-GO** remains. Ownership: Designer/Developer for CSS remediation; Legal for policy and consent verification.


## 2026-11-16 — legal terms light-theme source fix

**FIX COMMITTED (staging only):** `terms.html` contained a later `[data-theme="light"]` token block assigning dark backgrounds and pale text, contradicting the initial light tokens. Removed only that duplicate dark-token block in commit `16c2db2331b55b1c623fcb02ea8d5c7fda3155ed`. No legal contract wording, checkout, Stripe, or database code changed. **PASS (source verification):** re-fetched staging terms after commit and confirmed the offending `--color-bg:#111410` light-theme override is absent. **NOT TESTED:** Cloudflare deployment, computed CSS with external stylesheets, Chrome/Safari, ten viewport widths, keyboard/zoom and authenticated assent. Designer/Developer should verify deployment and browser visuals; avoid reverting the light tokens.

**Outstanding P0:** 48h versus 72h cancellation cutoff, guest refund service-fee contradiction, signed-waiver consent evidence, Stripe Tax registration/classification, receipt inbox, partial refund and bank payout proof. No new Stripe TEST transaction, authenticated RLS test, or production action was performed by Legal. **NO-GO** remains pending verified E2E and counsel review.


## 2026-11-17 — privacy deletion deadline discrepancy (staging source)

**FAIL — ambiguous deletion commitment:** In current staging `privacy.html`, Data Retention §4 says non-exempt personal data is deleted **typically within 90 days after account closure**, while Your Rights §5 promises that deletion requests **will be honored within 30 days**, subject to legal holds. The document does not distinguish acknowledging/processing a request from completing erasure, or account closure from an authenticated deletion request. A user who closes an account and requests deletion may reasonably understand two conflicting completion deadlines. This is a source-level disclosure finding, not evidence of actual deletion behavior or a proven legal violation.

**Developer/Legal handoff:** Define a single operational deletion SLA and precisely distinguish request verification, deactivation, deletion of active records, backups, statutory retention and legal holds. Confirm behavior with disposable sandbox identities and data (account, guest details, uploaded ID, messages, polygons, booking/Stripe references) and preserve transaction records required for compliance. Then obtain counsel approval for synchronized edits to `privacy.html` and the embedded privacy section in `terms.html`; do not change promises blindly or delete evidence needed for disputes. Add a documented privacy-request audit without exposing personal data.

**PASS:** Read the current staging `privacy.html` and shared legal/Stripe launch-gate reports. **FAIL:** conflicting/ambiguous 30-day versus 90-day privacy deletion wording. **NOT TESTED:** actual deletion timing, authenticated sandbox accounts, cross-role/RLS, browser viewports and accessibility, Stripe TEST charges/refunds, Cloudflare deployment. **NO-GO** unchanged. No production/main/payment changes.


## 2026-11-18 — legal mobile menu accessibility hardening (staging only)

**FIX COMMITTED:** `terms.html` mobile navigation now initializes and synchronizes `aria-expanded` with its `nav-open` state, resets its accessible label on outside-click close, and closes on Escape with focus restored to the trigger. Source commit `7be07f1e5c6ae4d5a719bb5c4b1c1ec75e36cb22`. This is a reversible, legal-page-only JavaScript change; no payment, backend, contract text or production code was changed.

**PASS (source inspection):** fetched the staging legal page, identified missing expanded-state synchronization and missing Escape handler, committed the scoped fix. **NOT TESTED:** browser keyboard/focus behavior, responsive widths 320/375/390/430/768/1024/1280/1440/1920/2560, touch/zoom, Cloudflare deployment, cross-role authorization, property-location leakage, moderation, and Stripe TEST reconciliation. Do not infer runtime accessibility PASS from static code. Designer/Developer should independently exercise mobile nav in sandbox after deployment. **Outstanding P0:** 48h/72h cancellation policy, guest refund fee, waiver evidence, tax/receipt/partial refund/bank payout gates. **NO-GO** pending E2E and counsel review.


## 2026-11-19 — consent/privacy claims and latest Stripe gate reconciliation

**REVIEW — unsupported categorical privacy representations (source inspection):** Current `privacy.html` states that LeaseWild does not sell, rent, or trade personal information "Ever", does not profile users for third parties, uses aggregated analytics not tied to individual identities, and collects device identifiers in iOS/Android apps. These are broad factual representations that require a current vendor/SDK inventory, deployed app inventory, consent/cookie audit, and data-flow evidence. This review did **not** establish that any statement is false; avoid adding further categorical claims before validating actual processing. **Developer/Legal:** inventory analytics, advertising pixels, crash reporting, email tooling, Stripe/Supabase subprocessors, and deployed mobile applications; update and version both public privacy surfaces with counsel after evidence review. Verify privacy contact/response workflow using synthetic requests.

**PASS — historical payment gate reconciliation (documentation only):** Shared Stripe launch gate now records a 2026-11-14 expanded hunter journey, [run 43634277042](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43634277042), with **7 passed / 3 skipped / 0 failed**, including a refund-concurrency response pair [200,409]. The gate identifies an independently successful sandbox Cloudflare deployment for exact tested commit `c4c667e0f374d76a1397b96ef95443775e5d4b2d`. This supersedes older 6-pass summaries but is not a fresh Stripe or browser test by Legal. **Still NOT PROVEN:** delivered receipt inbox, external-bank payout, partial refund, tax registration/classification, promo/add-on/deposit economics and legal consent evidence.

**Required synthetic legal/privacy negative-case matrix (NOT TESTED this run):** anonymous vs booking-eligible vs other-owner vs cancelled/refunded/expired access to exact street address, drawn polygon and entry/parking coordinates; hunter review eligibility only after completed paid booking, no self/other-booking review, moderation pending by default, report/appeal visibility; terms and waiver version/time/identity receipt at checkout, 48h/72h cancellation preview around DST; privacy deletion request with audit and retained statutory financial records. Run widths 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560, plus keyboard/touch/200% zoom; attach screenshots and test identities stripped of secrets.

**Status:** PASS read current staging legal policy, shared legal report and Stripe gate; REVIEW categorical privacy assertions; NOT TESTED authenticated sandbox permissions, Stripe TEST execution, responsive browsers and new deployment. No migrations, payment changes, or production/main access. **NO-GO** remains pending documented gates and attorney review.


## 2026-11-20 — P1 inconsistent privacy request contact routing (source audit)

**FAIL — conflicting privacy-request destinations:** Staging `terms.html` embedded Privacy Policy §§6–8 and §11 instructs users to send privacy/access/deletion and child-data requests to `privacy@leasewild.com`, while standalone `privacy.html` §§7 and 9 directs child-data/privacy requests to `zach.schmitt@leasewild.com`. The two legal surfaces also differ on the under-18 versus under-13 collection statement (previously reported). No inbox delivery, forwarding, or request-tracking configuration was verified, so this is a **documented inconsistent routing risk**, not proof of lost requests. The personal-address route also creates a continuity and privacy-handling concern as the business scales.

**Developer/Legal handoff:** Confirm a dedicated monitored privacy inbox and request intake ownership using synthetic mail only, test both currently published destinations and bounce/forward behavior without exposing any real correspondence, then align both policy pages, account deletion, signup, footer and booking notices on one approved destination. Document a minimal-access request log with received date, verification, action and response deadline; never put identity documents in public logs. Have counsel review revised minor-data and deletion language together before publication.

**PASS:** Independently fetched current staging `terms.html`, `privacy.html`, shared legal report and Stripe launch gate; compared their contact instructions. **FAIL:** Privacy contact consistency. **NOT TESTED:** Actual mailbox delivery, authenticated privacy request, synthetic cross-role authorization, review moderation, property coordinate access, responsive browser matrix, new Stripe TEST charge/refund or Cloudflare deployment. Payment gate remains **NO-GO** based on unresolved receipt, bank payout, partial refund, tax and waiver/cancellation evidence. No payment code, production resources or main branch touched.


## 2026-11-21 — legal effective-date/version drift (staging source audit)

**FAIL — conflicting effective-date/version surfaces:** Current staging `terms.html` labels the combined Terms & Legal page **“Last updated: April 17, 2026”**, while standalone `privacy.html` labels its privacy policy **“Effective June 11, 2026.”** The terms page also embeds a separate privacy policy, and both policy surfaces have documented substantive differences (minor guest age, contact destination, deletion timing). The differing dates alone do not prove a legal defect, but the duplicated, non-identical privacy text makes it impossible to establish a single authoritative privacy-policy version from the pages alone. Do not silently backdate changes or treat continued use as a substitute for documented affirmative waiver acceptance.

**P0/P1 handoff:** Developer/Legal should inventory every policy link in signup, checkout, account settings and footers; establish an authoritative versioned privacy document and independent Terms/waiver versions with real effective dates; map each acceptance record to a content hash/version and timestamp; obtain counsel approval for materially changed refund/waiver/privacy language; and verify that any promised material-change notification is actually delivered to synthetic inboxes. Preserve historical terms for existing bookings. Hunter QA should test synthetic checkout consent/receipt persistence; Landowner QA should verify host acceptance and sensitive property-coordinate disclosure. Growth must avoid “signed waiver” claims without audit proof.

**PASS:** Fetched and compared current staging `terms.html`, `privacy.html`, shared Stripe launch gate and legal report through GitHub. **FAIL:** duplicated policy text/version consistency (source). **NOT TESTED:** authenticated consent records, email delivery, Cloudflare/browser rendering, responsive width matrix, cross-role RLS, review moderation, Stripe TEST execution and payout reconciliation. No sandbox deployment or payment changes were made; no production/main access. **NO-GO** remains pending existing tax, receipt, partial refund, bank payout, waiver and cancellation gates.


## 2026-11-22 — property geolocation disclosure gap (source-level privacy review)

**REVIEW — location-data disclosure not described with sufficient specificity:** The staging standalone `privacy.html` Section 1 says landowner listing information includes property **address**, acreage, photos, descriptions, availability and pricing. Section 3 says that, after booking confirmation, limited **contact details** are shared between landowners and guests. Neither section explains whether the public listing exposes exact address, hunting polygon coordinates, entry/parking waypoints, trail points, or when booked hunters receive precise navigation details. This is a **disclosure/documentation gap**, not evidence that coordinates are publicly exposed. The intended product includes user-drawn hunting boundaries and entry/parking areas, which can reveal private residences, gates and access routes. Avoid publishing an exact-address promise until the implementation and authorization are verified.

**P0 security/privacy acceptance matrix (synthetic sandbox only):** Create two distinct synthetic landowners, one hunter with an approved upcoming booking, one unbooked hunter and one completed/cancelled booking. Capture response payloads (not just map UI) for anonymous search/listing, unbooked logged-in view, approved booking, pending authorization, declined/cancelled/expired booking, completed booking, and another owner's edit/API attempts. Assert that exact address, geometry vertices, parking/entry coordinates, EXIF geolocation and navigation URLs are withheld from unauthorized identities; check RLS and Edge Functions independently of client hiding. Explicitly define whether completed hunters retain historic trip directions and document retention/revocation rules. Test map links, image metadata, search JSON and direct object-ID enumeration. Use only disposable coordinates and redact exact test positions from public logs.

**Owner handoff:** Landowner QA owns map and cross-owner permissions; Hunter QA owns booking-state transitions; Developer owns server-side RLS/API filtering; Legal owns privacy text and consent alignment. Do not edit shared payment code to resolve this finding. Require counsel review of location disclosures before any public-policy changes. Add screenshot and response-level evidence to the shared report with test fixture IDs and exact staging commit/deployment.

**PASS:** Re-fetched current staging `privacy.html`, shared legal report and Stripe launch-gate source on 2026-11-22; documented the omission and assigned verification. **REVIEW:** location-sharing privacy wording. **NOT TESTED:** authenticated geolocation authorization, EXIF leakage, responsive browser matrix, Stripe TEST transactions, Cloudflare deployment. Existing Stripe gate still documents **7 passed / 3 skipped** on 2026-11-14, not a new run. **NO-GO** unchanged. No production, main, live Stripe or real customer resources accessed.


## 2026-11-24 — identity-document privacy acceptance gate

**REVIEW (source):** Standalone `privacy.html` sections 1, 3 and 4 enumerate account, booking, property and payment data, sharing and retention but do not expressly describe government ID images, verification access or document-specific retention. This records the November 23 finding; it does not establish actual collection or exposure. Source blob `50143de278249876d2ec3c92f2dc68d01f9fb453`.

**Synthetic acceptance tests:** Use clearly fictional non-government test images, two unrelated hunters and hosts, and a dedicated sandbox admin. Verify private storage, denied anonymous and cross-role object reads, short-lived authorized URLs, expiry and revocation, upload type/size restrictions, no document contents in logs or email, deletion and legal-hold behavior. Verify minor guest exemptions and adult responsibility without collecting real IDs. Developer owns storage policies; Hunter QA owns guest upload/deadline tests; Landowner QA owns cross-role denial; Legal owns disclosure and retention approval. Record redacted response statuses and fixture IDs, never image contents or signed URLs.

**PASS:** staging source and shared Stripe gate retrieved. **NOT TESTED:** authenticated storage, browser widths, deployment, fresh Stripe TEST execution. Latest shared gate remains November 14 run 43634277042 (7 passed, 3 skipped); linked synthetic Connect transfer evidence exists, so historical zero linked accounts is not a current verified count. Tax registration, receipt delivery, external-bank payout, partial refund and legal release gates remain open. NO-GO. No production or payment changes.
