# Landowner QA screenshot handoff — 2026-11-14 21:19 ET

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev only. This is **user-provided screenshot evidence**, not a fresh real-browser execution. No production access.

## Observed
- iPhone Stripe-hosted Checkout screenshot at 20:36 shows "LeaseWild SANDBOX booking authorization" **$444.00**, payment method options Card, Apple Pay, Cash App Pay, Affirm, Link and Klarna. A Pay button is visible. No payment success, authorization/capture, session ID, or TEST-mode Stripe object is visible. The label alone is not proof of TEST mode.
- iPhone sandbox guest cancellation dialog at 20:35 shows trip **November 19, 2026**, **1 guest**, booking total **$250.00**. Text: "Under the 48-hour flexible policy, this Stripe TEST payment qualifies for a full refund." It also says "Cancellation requires support reconciliation. Do not retry payment or refund." Two confirmation buttons are visible. No post-click outcome is shown.
- The amounts differ ($444 vs $250); do **not** assume the screenshots represent the same booking. Do not attribute the difference to a pricing bug without booking/session identifiers.
- Potential user-experience inconsistency: full-refund eligibility is displayed alongside a support-reconciliation warning, without a visible explanation of whether cancellation can complete automatically. Treat as **triage**, not a reproduced backend defect.

## Evidence classification
- USER SCREENSHOT OBSERVED: hosted Checkout and guest cancellation modal rendered on iPhone.
- NOT TESTED this run: clicking cancellation, Stripe card submission, 3DS, refund, reservation state, release of dates, email delivery, host-side reconciliation, Stripe TEST session/PaymentIntent mapping, responsive widths.
- BROWSER ACCESS BLOCKED in this invocation; do not call this a real-browser PASS/FAIL.
- No new commits beyond this documentation, no application fixes, no deployment, no synthetic records changed.

## Coordinated next actions
1. Hunter/Payments owner: identify *synthetic-only* booking IDs for both screenshots (if available from controlled fixture evidence), map each to its Stripe TEST Checkout Session/PaymentIntent and database row. Do not inspect real user sessions or production.
2. Hunter/Payments owner: with a fresh synthetic captured $250-equivalent booking, execute cancellation once in the real sandbox browser, record UI response, backend status, Stripe refund ID and webhook; verify the 48-hour rule from actual date/time and policy. Do not repeat refund on a potentially ambiguous booking.
3. Host/Admin owner: independently verify landowner reservation view and inventory/date release after cancellation, plus any pending support-reconciliation state and outbox email. Cross-check host-facing 20% fee/refund reversal only for a controlled TEST fixture.
4. Product/Developer: review whether Checkout's alternative payment methods are compatible with manual capture and cancellation rules; do not disable methods without verified provider constraints. Clarify cancellation copy only after state-machine reconciliation.
5. Landowner QA: retain ownership of authenticated map save/reload, entry/parking zones, cross-owner RLS, and completed-booking hunter reviews. Fixture verification and server-side cleanup are still prerequisites.

## Launch decision
**NO-GO** pending Stripe Tax, delivered receipt evidence, external bank payout, partial refund, authenticated landowner map/review journeys, and legal review. No live/main/production changes permitted.
