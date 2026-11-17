# Landowner partial refund staging evidence

Staging branch only. Implementation commits c801aef and 1a2597d.
Supabase project kbkdfpmlyggfijkyjxoi, function sandbox-booking-partial-refund version 2.
The server authenticates the user, verifies listing ownership, and requires a confirmed captured Stripe TEST payment.

## Real browser result

On November 17, 2026, Chrome completed a fresh Stripe TEST Checkout, followed by owner approval and capture. The synthetic owner signed in through the deployed landowner portal and selected Reservations, then Partial refund for the new booking.

- Booking 6078d1aa-83c9-42e3-b619-c5242548ca06.
- Checkout cs_test_a0YPUS5X6Z0VDlzDdUnk9emzrz5LUOnYZK7qjgL5i2DlXVfFcyLlC7sf4s.
- PaymentIntent pi_3UcucgAO40Rp32aF1hcOw3R5.
- Captured USD 106.50, partial refund USD 25.00, remaining paid USD 81.50.
- Refund re_3UcucgAO40Rp32aF1dyKim4j succeeded.
- The portal prompt accepted 25.00 and its result alert displayed succeeded, USD 25.00 refunded, USD 81.50 still paid.
- Retrying the same amount and refreshing the refund preview returned the same refund ID and amounts.
- The hunter's attempt received HTTP 404.
- Owner booking list remained confirmed after the partial refund.
- Direct Supabase SQL verified the matching booking, PaymentIntent, refund ID, succeeded status, and amounts in booking_partial_refunds.

Cleanup subsequently cancelled the synthetic booking and refunded the remainder. The partial refund row retains the amounts observed at its reconciliation time, before cancellation cleanup. It is an operation record, and subsequent cancellation does not refresh that snapshot.

## Scope and remaining verification

One discretionary partial refund is allowed per booking. A second distinct amount is rejected. Existing refunded payments require review. The reservation remains confirmed after a partial refund. The existing cancellation policy continues to apply.

The refund record table is server-only with RLS enabled and client privileges revoked. A preview or identical retry can recover its record from Stripe after a database-write failure. The amounts are integer cents. Destination payments request proportional transfer and application fee reversals, but this browser run used the land booking flow and does not establish connected-account reversal proof.

Local syntax checks and git diff whitespace checks passed. This result closes the deployed landowner partial-refund happy path and record reconciliation check. It does not establish overall launch readiness, additional refund operations, external-bank payout, or production receipt/tax readiness.
