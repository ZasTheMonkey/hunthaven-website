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
