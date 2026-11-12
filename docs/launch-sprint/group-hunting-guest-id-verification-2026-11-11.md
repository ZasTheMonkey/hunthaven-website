# Group hunting guest identity verification — sandbox implementation gate (2026-11-11)

Owner requirement: for hunting reservations with party size >1, collect adult guest names and emails during checkout and invite each adult to upload ID via noreply@leasewild.com; show all guests and linked reservation in admin. Guests under 18 do not upload ID but must be accompanied by an ID-verified adult age 18+. Do not require property ownership proof.

## Security and workflow requirements
1. Booking UI dynamically displays exactly (party_size - 1) additional guest records. Ask whether each guest is 18 or older. Adults: require full name and email, validate distinct email addresses, and reject duplicates or the primary hunter's email. Minors: require full name and age/date of birth and a named accompanying adult from the booking party; do not require minor email or ID. Do not silently discard data.
2. Server-side checkout must validate and atomically persist the guest roster linked to the sandbox reservation, enforcing party-size equality, booking ownership, and an identified age-18+ adult supervisor for every minor. A minor cannot be the primary booking holder or attend without their designated adult. Require adult supervisor to confirm responsibility for accompanying minor(s). Do not trust client-submitted reservation IDs, names, emails, or user metadata for authorization.
3. On booking creation, send single-use, high-entropy, expiring adult guest-specific links from the verified noreply@leasewild.com sender. Never email a minor requesting ID. Never include documents or signed storage URLs in email. Do not log raw tokens.
4. Guest upload must use private storage, size/type validation, owner-bound token lookup, no public listing, and a separate guest document path. Admin-only read via short-lived signed URLs. Guest may view their own submission status only. Never reuse the landowner identity-verification table or permissions for guest submissions.
5. Admin displays reservation reference, listing, dates, party size, adult guest names/emails and ID statuses (invited/pending/approved/rejected/expired), minors' names and ages, assigned supervising adults, and secure adult ID preview. Reject/reinvite with audit events. Guest ID review is documentary; do not automatically mark a listing approved.
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
- [ ] Run synthetic 1/2/4 guest checkout including mixed adult/minor parties, no adult supervisor, underage primary booking, adult ID invitations, no minor ID invitation, upload, approval, rejection, expiry, cancellation and cross-role negative tests; verify database state, sender, test-mode Stripe integrity
- [ ] Record PASS/FAIL/BLOCKED evidence and deployment commit in launch-sprint report

Deployment scope: `staging/leasewild-full-clone` / `leasewild-sandbox.pages.dev` only. No live website, GitHub main, production Supabase, live Stripe or real identities.

## Minor supervision rule (owner update)
- Every hunter under 18 must have an identified adult age 18+ in the same reservation, physically accompany them during the hunt, and have their own identity verified.
- No government ID upload or email invitation is required for minors; collect only the minimum age information needed and protect minors' personal data.
- If the supervising adult cancels or is rejected, the booking cannot proceed with the minor unless a replacement verified adult is assigned.
- Do not imply adult supervision alone satisfies hunting license, hunter education, age, firearm, or state-specific legal requirements; verify relevant jurisdictional rules separately.

## Primary account holder: one-time identity verification (owner update)
- The primary booking holder completes government-issued ID verification once as part of account creation/onboarding, before their first hunting booking is finalized. Subsequent reservations reuse the approved account identity status; do not request a fresh ID per booking.
- A pending, rejected, expired, or revoked verification is not approved; require remediation only when status is no longer valid. Identity approval does not replace booking-specific hunting eligibility or licenses.
- Associate the booking with the authenticated account ID and read server-side verified identity status; never trust a client-provided `verified` flag.
- Additional adult guests follow their own identity verification workflow. If an adult guest has a previously approved identity linked to their own authenticated account, reuse it rather than requesting repeated uploads; ensure the identity actually matches the invited guest.
- Minors require no ID upload or email, but remain associated with an identified verified accompanying adult in the reservation.
- Current code status: specification only; authenticated account-holder ID onboarding and server-side booking gate require E2E implementation and testing before claiming operational.

## Adult guest verification deadline (owner update)
- Additional adult guests must complete required ID verification no later than 78 hours before the property's scheduled hunt/stay check-in time, calculated in the property's IANA time zone (DST-aware).
- Group reservations may be created before this deadline with adult guest verification pending; send invitations promptly and show a per-guest deadline and status in booking/admin portals.
- If booking occurs within 78 hours of check-in, require any unverified additional adults to complete verification before booking confirmation/participation; do not imply a past deadline can be met.
- At the deadline, flag outstanding adult verifications for admin handling and prohibit unverified adults from participating; do not automatically issue refunds or cancel paid reservations without a published, approved policy and safe Stripe workflow.
- Reuse previously approved adult guest verification where identity matching is established. Minor guests require no ID or email but a verified accompanying adult.
- NOT IMPLEMENTED: server-side deadline enforcement, invites, and ID review. Existing group checkout is temporarily disabled pending implementation.

## Notification repair progress (2026-11-11)
- Created sandbox-only RLS-protected `sandbox_booking_email_outbox` with unique booking/event/recipient key and no anon/authenticated grants.
- Deployed sandbox `sandbox-booking-webhook` v7: on successful test Stripe authorization -> `pending_approval`, queue an owner booking-request notification using listing contact email. No production code touched.
- NOT TESTED: synthetic webhook-to-outbox end-to-end, provider delivery, retry worker, guest roster, secure guest ID invitation and admin review.
- NOT OPERATIONAL: queued messages are not sent until a verified sandbox-only email delivery worker is implemented. Do not tell owner emails are fixed. Need confirm RESEND_API_KEY or equivalent sandbox provider and noreply@leasewild.com sender verification without exposing secrets.
