# Group hunting guest identity verification — sandbox implementation gate (2026-11-11)

Owner requirement: for hunting reservations with party size >1, collect every additional guest's full name and email during checkout. Send each a private upload invitation from noreply@leasewild.com; show the linked reservation and guest verification in admin. Do not require property ownership proof.

## Security and workflow requirements
1. Booking UI dynamically displays exactly (party_size - 1) additional guest name/email pairs. Validate trimmed full names, valid distinct email addresses, and reject duplicates or the primary hunter's email. Do not silently discard data.
2. Server-side checkout must validate and atomically persist the guest roster linked to the sandbox reservation, enforcing party-size equality and booking ownership. Do not trust client-submitted reservation IDs, names, emails, or user metadata for authorization.
3. On booking creation, send single-use, high-entropy, expiring guest-specific links from the verified noreply@leasewild.com sender. Never include documents or signed storage URLs in email. Do not log raw tokens.
4. Guest upload must use private storage, size/type validation, owner-bound token lookup, no public listing, and a separate guest document path. Admin-only read via short-lived signed URLs. Guest may view their own submission status only. Never reuse the landowner identity-verification table or permissions for guest submissions.
5. Admin displays reservation reference, listing, dates, party size, guest names/emails, statuses (invited/pending/approved/rejected/expired), and secure ID preview. Reject/reinvite with audit events. Guest ID review is documentary; do not automatically mark a listing approved.
6. Handle cancellations, booking expiry, duplicate Stripe webhook deliveries, retries, invalid/expired tokens, email failure, partial uploads, and changed party size. Retain documents only according to published retention/privacy policy and applicable law. Restrict download and never expose government IDs to landowners, outfitters, or other hunters.
7. Do not change payment capture, tax, Connect payout, or current booking status semantics without E2E regression.

## Current code inspection
- `booking.js` renders a `bk-guests` selector and posts only `listing_id,check_in,check_out,guests,trip_protection` to `sandbox-booking-checkout`; there are no additional-guest fields or backend roster payload.
- Sandbox edge function list has no dedicated guest invitation/email handler.
- Therefore end-to-end invitation and secure ID intake are **NOT IMPLEMENTED**. Do not label this feature PASS or tell the owner that noreply invitations were sent.
- The owner-facing admin landowner-ID viewer is a different workflow and should remain private.

## Next implementation order (coordinate Hunter QA + Developer)
- [ ] Confirm reservation schema and active checkout/webhook handlers, email sender configuration and verified domain; never read production secrets
- [ ] Add RLS-protected guest roster, token hashes, audit/status table and private guest-ID bucket on verified sandbox project, with migration committed
- [ ] Add server-side guest roster validation/persistence to active sandbox checkout function
- [ ] Add dynamic responsive guest input UI in `booking.js` with accessible labels and error messages
- [ ] Add guest-specific invite/send, upload/review endpoints and admin reservation-linked UI
- [ ] Run synthetic 1/2/4 guest checkout, invite, upload, approval, rejection, expiry, cancellation and cross-role negative tests; verify database state, sender, test-mode Stripe integrity
- [ ] Record PASS/FAIL/BLOCKED evidence and deployment commit in launch-sprint report

Deployment scope: `staging/leasewild-full-clone` / `leasewild-sandbox.pages.dev` only. No live website, GitHub main, production Supabase, live Stripe or real identities.
