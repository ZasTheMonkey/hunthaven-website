# LeaseWild Website Compliance Design Status

_Last updated: November 9, 2026 at 10:45 PM ET_

## Current run

- **Required handoff:** `docs/legal/website-compliance-handoff.md` was not present on `staging/leasewild-full-clone` when checked.
- **Implemented:** Reduced waitlist data collection in `index.html`.
- **Implementation commit:** [`900908f5814148a99d47706dc82dd5ad6150ec47`](https://github.com/ZasTheMonkey/hunthaven-website/commit/900908f5814148a99d47706dc82dd5ad6150ec47)
- **Sandbox deployment:** Cloudflare Pages build and deploy stages completed successfully for the implementation commit at 2026-11-10 02:16:30 UTC.
- **Scope:** Sandbox branch and `leasewild-sandbox.pages.dev` only. No production site, live Stripe, production Supabase, real customer data, or personal sessions were used.

## Compliance-oriented UX and technical changes

1. The waitlist phone field is now optional instead of required.
2. The field is visibly labeled “Optional.”
3. Supporting copy explains that the number is used for waitlist updates only when provided.
4. `aria-describedby` associates the explanation with the phone control.
5. `maxlength="25"` limits unnecessary input length.
6. Blank phone values are omitted from the outbound waitlist request rather than transmitted as an empty parameter.

This change supports data minimization and reduces friction. It does **not** establish SMS marketing consent, automated-calling consent, or any attorney-approved communication policy.

## Validation evidence

- Static replacement assertions passed before commit.
- Live sandbox DOM confirmed:
  - phone `required === false`;
  - `maxlength === 25`;
  - `aria-describedby="wl-phone-help"`;
  - conditional request inclusion is present.
- Waitlist modal opened and closed successfully without submitting data.
- Live accessibility tree exposed “PHONE Optional” and its supporting explanation.
- No LeaseWild page-script console errors were observed during this flow. Remote browser-extension metadata errors were observed and are unrelated to the site.
- GitHub has no attached CI status checks or workflow runs for this commit; CI is not claimed as passed.
- Desktop visual review was completed. Mobile viewport visual testing was not available in this run.

## Items requiring Legal Risk Review / Florida attorney approval

- Determine whether any phone collection should remain until a separate, explicit SMS/automated-message consent flow is approved.
- Draft and approve a Privacy Policy before replacing the current placeholder Privacy footer link.
- Review the homepage claims “$1M coverage,” “digital waiver,” “protected booking,” and “without the risk” for substantiation and appropriate qualification.
- Confirm cancellation, service-fee, waiver, location-disclosure, and dispute-resolution language before binding publication.
- Reconcile the stale “Bookings open July 1, 2026” statements with current business status before public-facing copy is changed.

## Coordination and conflict avoidance

Eight commits landed after the prior homepage accessibility commit and touched only:

- `guest-portal.html`
- `landowner-portal.html`
- `sandbox-messaging-bridge.js`

Those active Hunter QA and Landowner QA files were intentionally not modified. The current change was limited to the unchanged homepage and this Legal status document.

## Recommended next implementation

After Legal supplies the missing handoff, prioritize the highest-risk approved item. In parallel, the safest product-design target is mobile search/listing-card hierarchy and map controls, provided no QA bot has begun editing those files.


## Launch sprint update — November 9, 2026 at 9:31 PM ET

- The required legal handoff remained absent.
- Removed stale July 1, 2026 launch messaging and fabricated homepage fallback listings in implementation commit `b21c515fb9601abb455550d8cdf1d5180bf1938b`.
- Preserved live sandbox inventory rendering and added honest loading, empty, insufficient-detail, and fetch-error states.
- Published the integration gate at `docs/launch-sprint/launch-readiness.md`.
- Current decision is **NO-GO for production launch** pending attorney review and authenticated/payment evidence.
- Newly documented legal P0s include unverified insurance, verification, waiver, cancellation, and “without risk” claims across the homepage and listings page.
- No binding policy text was changed or published.


## Listings compliance UX update — November 9, 2026 at 10:45 PM ET

- **Required legal handoff:** `docs/legal/website-compliance-handoff.md` is still absent.
- **Legal blocker report:** `docs/launch-sprint/legal-blockers.md` is still absent; the Legal automation has a recorded completed run but no stored result or shared report.
- **Implementation:** [`c7c85d755c948bf8f67ff038c79edcabd48ee04d`](https://github.com/ZasTheMonkey/hunthaven-website/commit/c7c85d755c948bf8f67ff038c79edcabd48ee04d) on sandbox staging only.
- Removed expired prelaunch dates and claims that booking was not yet open.
- Replaced universal verification, water-rights, up-to-date regulation, and state-tailored waiver assertions with qualified guidance to review host details and official agency rules.
- Made the listings updates-form phone field optional, length-limited, described for accessibility, and omitted when blank.
- No policy, waiver, fee, cancellation term, insurance promise, or other binding legal language was drafted or published.
- Cloudflare build/deploy succeeded for exact implementation commit; canonical public listings page and updates-dialog behavior were smoke tested without form submission.
- **Attorney review remains required** for privacy, communications consent, terms, waivers, insurance, host verification, refunds/cancellations, fee presentation, messaging retention, and Florida hunting/fishing obligations.
- **Release status:** NO-GO. Authenticated E2E, Stripe TEST state handling, RLS/authorization, and mobile viewport evidence remain unavailable.


## Homepage integrity update — November 9, 2026 at 11:29 PM ET

- **Required legal handoff remains absent:** `docs/legal/website-compliance-handoff.md` was not present in the current branch tree.
- **Implementation:** `93ae8e20413819cbc857fa32877663d355449d04` on sandbox staging only.
- Removed eight hard-coded sample map listings and three named five-star early-access testimonials from the public homepage. Replaced the testimonial block with neutral, observable browse/compare/decide guidance.
- Prevented opaque updates-form responses from being labeled as confirmed subscriptions. Both forms now retain the entered value and present a retry path when acceptance cannot be verified.
- The existing `supabase/functions/notify-signup` function was reviewed but not changed or repurposed because its contract is an auth-signup webhook. No lead data, auth data, schema, RLS policy, payment code, binding policy, waiver, or legal term was changed.
- Public browser smoke at 1363px rendered three database-backed cards and the revised section without horizontal overflow. Fabricated names were absent. Other requested widths and all authenticated tests remain NOT TESTED/BLOCKED.
- Remaining legal P0s include homepage protection/waiver/insurance-style claims, privacy and communications consent for lead capture, access-zone location privacy, review moderation/reporting, review eligibility, fee/refund presentation, and Florida attorney approval.
- Access-zone drawing and landowner reviews of hunters are **not implemented or legally approved** in this run. Any schema must enforce owner authorization, booking-based disclosure, one eligible review per completed booking, and moderation/reporting before launch.
- **Release status: NO-GO.** Production, `main`, live Stripe, production Supabase, real users, and personal sessions were untouched.


## Landowner earnings/trust UX update — November 10, 2026 at 12:42 AM ET

- **Final implementation:** `db3d160a70b61d7b4a24c679d2cb9574068c35a5` on sandbox staging only.
- Corrected public 85%/15% inconsistencies to the current 80/20 marketplace description and calculator model; payment and checkout code were not changed.
- Removed stale July 2026, instant-approval, “without risk,” $1M coverage, universal ID verification, permanent waiver-storage, fixed deposit-timing, and automatic security-deposit claims.
- Replaced these with pre-publish guidance that directs landowners to review guest requirements, agreements, sensitive location fields, booking controls, deposits and refunds.
- Updated landowner navigation to direct Sign in and Browse properties links while retaining the authenticated `next=list-your-land.html` redirect.
- All three inline scripts passed syntax compilation; static prohibited-claim checks passed; two deterministic calculator fixtures passed.
- Exact Cloudflare deployment `ffeb7ae6-895a-4174-be87-23ab17180e7c` reports success for final SHA `db3d160a`.
- Browser smoke confirmed the unauthenticated redirect and portal at 1363px with no horizontal overflow. Authenticated form rendering/save and all other requested widths remain BLOCKED/NOT TESTED.
- Validation rejected the preceding `c60dfa0e` implementation because replacement-token expansion duplicated script content. The final commit was rebuilt from the clean pre-change SHA and is the only implementation counted as passing.
- **Legal handoff remains absent.** No binding policy, waiver, insurance promise, payment term, location-disclosure rule, review policy or production content was approved in this run.
- **Release remains NO-GO.** Access-zone privacy/authorization, hunter-review eligibility/moderation, authenticated E2E, responsive coverage and Florida attorney approval remain open.


## Listings updates privacy/reliability fix — November 10, 2026 at 1:45 AM ET

- **Implementation:** `53cc99375e7b1fa7f040987bd50ec2e5f7a662ed` on sandbox staging only.
- Removed the unverified cross-origin GET submission that encoded first name, last name, email, phone, location and timestamp in the request URL and could display success without a verifiable response.
- The form now fails closed without transmitting contact data, preserves entered values, does not show the success view, and presents a focusable `role="alert"` explaining the temporary unavailability.
- Removed unsupported species/booking language from listings metadata; this is a technical/content-risk correction, not approval of inventory or marketing claims.
- Exact-SHA static checks and inline-script compilation passed. Cloudflare deployment `def0a4d3-5196-480f-ae0f-a8608d3e9c74` succeeded for `53cc9937`; public listings and dialog rendered at 1363px.
- Browser submission was not performed. A privacy-reviewed, response-verifiable lead endpoint, consent/copy review, retention rules, vendor review and failure-path E2E remain required before re-enabling signup.
- `docs/legal/website-compliance-handoff.md` remains absent. No legal terms, consent language, waiver, insurance promise, access-zone disclosure rule, review policy or production content was approved.
- **Release remains NO-GO.** Access-zone authorization/privacy, hunter-review eligibility/moderation, authenticated QA, responsive coverage and Florida attorney approval remain open. Production and live services were untouched.


## Public listing-card data handling update — November 10, 2026 at 2:15 AM ET

- **Implementation:** `1d83886a69ba6f9d68edb3858dfaca350c621836` on sandbox staging only.
- Escaped owner-provided activity, identifier, trail-camera date and metadata values before HTML rendering, and rejected non-HTTPS image schemes. This narrows client-side injection exposure but is not a substitute for server validation, storage policy, CSP, database authorization or security review.
- Removed a nonfunctional “save” affordance that did not persist a preference and could open a listing instead. No user preference or booking data was changed.
- Corrected duplicate acreage, empty location rows and singular labels; added keyboard link semantics. No legal terms, inventory approval, marketing substantiation or payment behavior changed.
- Exact-SHA static compilation and deterministic hostile-input assertions passed. Cloudflare deployment `0a1e1532-3617-42c3-ae30-814a7a6dcead` succeeded; public browser smoke at 1363px rendered three cards without duplicate acreage or horizontal overflow.
- Full responsive, CSP, authenticated, database-policy and stored-input tests remain incomplete. `docs/legal/website-compliance-handoff.md` is still absent.
- **Release remains NO-GO.** Access-zone location privacy/authorization, hunter-review eligibility/moderation, legal terms and Florida attorney approval remain unresolved. Production and live systems were untouched.


## Disabled listings signup removal — November 10, 2026 at 3:34 AM ET

- **Implementation:** `cd7c4393fa22231c7bfcb07e12a43d5abb054a14` on sandbox staging only.
- Removed the disabled listings updates form, dialog, styling and client submission code. Desktop/mobile signup controls now lead to active inventory; the secondary conversion path leads landowners to the existing listing flow.
- The listings page no longer collects names, email addresses, phone numbers or location through this removed feature. Reintroducing subscription capture still requires a privacy-reviewed endpoint, minimal-data design, consent language, retention/vendor review, verified success/failure states and attorney review.
- Exact-SHA compilation/static checks passed. Cloudflare deployment `dcf8b405-2a63-45da-aa67-eb9accd819d5` succeeded. Browser smoke at 1363px confirmed three cards, working browse/landowner links, no signup form/dialog/dead controls and no horizontal overflow.
- No legal terms, binding consent, booking/payment behavior or production content changed. `docs/legal/website-compliance-handoff.md` remains absent.
- **Release remains NO-GO.** Access-zone privacy/authorization, hunter-review eligibility/moderation, authenticated QA, complete responsive coverage and Florida attorney approval remain unresolved.


## 2026-11-10 04:50 ET — Sensitive access data and hunter-review controls

**Status: partial mitigation; attorney and runtime authorization review still required.**

### Implemented

- Public `listings.html` no longer requests all listing columns. Commit `20be480945856fd3a8b9a85e80d61f27f024f2ec` uses an explicit allowlist and excludes owner contact information, street address, parcel boundary, and allowed-zone geometry.
- A review-only, fail-closed schema design was added at `docs/launch-sprint/access-zones-reviews-schema-draft.sql` in commit `ac8d868148ed113ba92c9e4b3ba05e7acdcf8666`.
- The draft proposes:
  - owner-only editing for hunting, entry, and parking geometries;
  - access for the booked hunter only after an eligible booking state;
  - one owner review per completed booking;
  - published-review visibility to the reviewed hunter;
  - factual-text guidance, moderation state, and review reporting;
  - a `security_invoker` public catalog view excluding sensitive access fields.

### Important limitations

- Client field minimization does **not** prevent direct Data API access. The current repository schema appears to grant public SELECT on active listings, including address/boundary-related columns. Server-side grants/RLS or a safe public view are required before sensitive zone data is stored.
- The draft is not a migration and was not applied. It intentionally raises an exception and rolls back.
- Booking status names, ownership columns, and schema relationships must be reconciled against the approved sandbox database before implementation.
- Cross-owner denial, booked-hunter disclosure timing, review eligibility, one-review enforcement, reporting, deletion/appeal handling, and moderation have not been authenticated end-to-end tested.
- Exact access coordinates should remain unavailable to anonymous visitors and unconfirmed users. Product copy must not promise property verification, safety, legal access, or background screening without substantiation.
- Hunter-review wording, moderation procedure, retention, dispute/appeal rights, privacy disclosures, and deletion obligations require Florida attorney review before any binding policy is published.

**Legal launch recommendation remains NO-GO.** No production data, legal terms, live payments, or production systems were changed.

## 2026-11-10 05:25 ET — Accessible property-discovery status

**Implemented in sandbox:** commit `105fb5eea1dcdd067e26b5034f40720a87943b64` adds a persistent polite live region for loading and result counts, grid busy state, distinct empty/error messaging, alert semantics for load failures, and a keyboard-operable retry control.

**Evidence:** exact deployment `b5faa2ee-12fc-4c4d-b505-0d53bced8ac4` succeeded. Browser smoke at 1363px exposed “3 properties are available,” then “1 property is available” after filtering, with no horizontal overflow. Source/static checks passed. A real screen reader, network-failure retry, 200% zoom, touch, and the full responsive matrix were not tested.

**Compliance boundary:** this accessibility improvement does not resolve the separate direct Data API exposure risk, access-zone privacy/authorization, hunter-review moderation and appeal obligations, missing legal handoff, or attorney approval. The property-zone/review schema remains a fail-closed design draft and was not applied. Legal release recommendation remains **NO-GO**.

## 2026-11-10 06:25 ET — Morning security coordination

- Landowner QA correctly identified that allowing owner inserts with `moderation_status='published'` would bypass moderation. Draft commit `fe4fe19558ee68a03235f1d1d22aa6e423cbd2f0` now requires `pending`.
- Landowner QA also identified that a `security_invoker` public view would fail if its caller lost all underlying listing-table privileges.
- Designer commit `a2abe68cd8d3e855d7e7c17e2d5b9d687c01342a` corrects the review-only design by revoking broad reads and granting only the catalog's presentation columns. Street address, parcel boundary, allowed-zone geometry, owner contact fields, and access zones are not granted.
- The draft now explicitly requires an owner-private table or separately reviewed owner API before existing owner screens can read private listing fields. Broad SELECT must not be restored.
- These are static design corrections only. No migration, RLS runtime, anonymous negative test, owner-private access test, moderation, appeal, deletion, or cross-owner test occurred.
- Public listings filter cleanup `2756c02a5dd93a9802e8068fb6deca4647412473` removed unsupported Last Minute/Hot Spots controls and now exposes selection state; this reduces misleading presentation but does not establish inventory accuracy.

**Legal/security recommendation remains NO-GO.** Access-coordinate disclosure, owner-private data architecture, review moderation/appeals/retention, authenticated authorization, missing legal handoff, and Florida attorney approval remain unresolved.