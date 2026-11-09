# Lease payments, cleaning holds, and listing access rules

## Behavior

New bookings pay the lease and existing selected fees immediately. The owner gets 80% of the discounted lease; LeaseWild retains 20% plus separately collected fees. Stripe processing costs are charged to LeaseWild. Cleaning is excluded from the immediate charge. A $100 lease and $50 cleaning deposit produces an $80 lease transfer; cleaning is separately authorized for up to $50 and, if claimed, is transferred entirely to the owner.

Owners choose check-in time, checkout time, property time zone, and rifle, bow, or both. Midnight-to-midnight is the default. Existing unspecified hunting methods remain unspecified (not silently authorized). Bookings use separate arrival and departure dates; the departure date is exclusive. Consecutive days support camping where permitted in the listing. Payment records snapshot times and methods, so later listing changes do not alter the deadline on existing paid bookings. Deadlines are exactly 48 elapsed hours after checkout, including across DST changes. Nonexistent DST local times are rejected.

Guests must sign in with a verified email and explicitly accept the cleaning authorization terms. A protected payment snapshot is priced from the current listing and validated code, not client totals. Checkout saves the card for off-session use only when a deposit is required. A worker attempts a manual-capture card authorization 24 hours before checkout. The hold is not guaranteed throughout a long stay. No cleaning transfer occurs before capture. A hold that cannot cover the deadline is canceled, never captured to extend it. Guest and owner portals show that funds are not secured when authorization fails. Guests can open a hosted recovery authorization from their portal.

Only the snapshotted owner can claim a positive amount up to the deposit, with a cleaning explanation, after checkout and strictly before its 48-hour deadline. Partial capture releases the unused balance. The worker releases an unclaimed hold at the deadline (normally within its one-minute polling interval). Bank statement availability may lag. Cancellation releases the deposit only; this change does not implement the site's pre-existing lease-refund policy. A fully refunded Stripe lease also releases its deposit. Existing charges are not retroactively converted.

## Fixed sales tax

At the user's request, new checkout quotes add 6.5% to the discounted lease price, rounded to cents. Tax is a separate line and protected snapshot field; it is retained by LeaseWild separately from its 20% commission. Cleaning authorizations, optional protection, and processing fees are excluded from this configured tax base. This manual calculation does not activate Stripe Tax, register the business, file returns, or determine legal taxability. Confirm the tax base and remitting entity before production rollout. The existing processing surcharge calculation is unchanged.

## Validation performed

- `npm test`: 22 tests covering cent conservation, 80/20 split, cleaning exclusion, discounts, DST/custom times, exact claim cutoffs, authorization/capture/release scenarios, short holds, failed cards, lost-response recovery, and refunds.
- PGlite executes the actual migration and verifies participant-only reads, denied client writes, claim bounds, and lock contention.
- `npm run check`: TypeScript checking against the pinned Stripe/Supabase SDK types.
- No real customer was charged; Stripe calls in lifecycle tests are mocks. A real Stripe sandbox/test-mode checkout is still required before production activation.

## Deployment prerequisites (not yet performed)

1. Use a separate Supabase test project and Stripe sandbox/test account. Apply `supabase/migrations/20261109033849_lease_payment_cleaning_deposits.sql`. No production migration or function was changed during preparation.
2. Configure the existing `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SB_URL`, and `SB_SERVICE_KEY` secrets for that environment. Generate a strong random `CLEANING_WORKER_SECRET`; save it in Supabase Edge Function secrets and as `cleaning_worker_secret` in Supabase Vault. Do not commit either secret.
3. Deploy `stripe-checkout`, `stripe-webhook`, `cleaning-deposit`, and `cleaning-deposit-worker` together, including `_shared`. Honor `supabase/config.toml`: user endpoints verify JWT and additionally validate the user; the webhook verifies Stripe's signature; the worker verifies its own secret. Never expose the service-role key to browsers.
4. Configure Stripe's webhook endpoint for `checkout.session.completed`, `checkout.session.expired`, and payment-intent changes. The handler reads Stripe to verify paid amounts and destinations; the worker also reconciles checkout state if a webhook is delayed.
5. Enable `pg_cron` and `pg_net`. Store the project URL as `cleaning_project_url` in Vault. Run the scheduler statement below as the database owner. Confirm successful invocation and monitor `failed` counts; failure to run the worker means holds are not promptly created/released.
6. Test a connected test account with a successful card and an authentication-required card. Verify separate lease/deposit PaymentIntents, owner transfers, partial capture, exact-deadline refusal, no-claim release, canceled reservation, expired authorization, retry after a lost response, and forged-user attempts. Move only test payment timestamps to accelerate the 48-hour window.
7. Before switching production, resolve the existing unrestricted public `bookings` SELECT/UPDATE policies and assess the legacy cancellation/refund workflow. New protected `lease_payments` records do not trust public booking fields for captures, but the legacy records and portal still need their own access-control repair. Configure payment-failure notifications if email/SMS is required; this implementation reports failures in the portals.
8. Apply the reviewed migration and deploy the functions, scheduler, and website in a coordinated maintenance window. Do not merge the website before the schema exists. Existing checkout sessions retain their original pricing. This branch has not been activated in production.

```sql
select cron.schedule('leasewild-cleaning-deposits', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='cleaning_project_url') || '/functions/v1/cleaning-deposit-worker',
    headers := jsonb_build_object('Content-Type','application/json', 'x-worker-secret',
      (select decrypted_secret from vault.decrypted_secrets where name='cleaning_worker_secret')),
    body := '{}'::jsonb
  );
$$);
```

If capture succeeds but its response is lost, the worker reconciles the existing PaymentIntent before doing more work. A lock prevents simultaneous claim/release execution; stable Stripe idempotency keys protect retries. Do not delete protected payment rows or reuse them for another booking. Access times are snapshotted at initial checkout creation; abandoned sessions must be replaced by a new booking if pricing or dates change.
