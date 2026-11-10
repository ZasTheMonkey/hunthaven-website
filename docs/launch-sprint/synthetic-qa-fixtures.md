# LeaseWild synthetic QA fixtures — staging only

**Environment:** Supabase project `kbkdfpmlyggfijkyjxoi`. Never run against production.

## Accounts to provision through Supabase Auth (not raw SQL)
- `qa-owner-a`: dedicated synthetic landowner A
- `qa-owner-b`: dedicated synthetic landowner B
- `qa-hunter`: dedicated synthetic hunter

Use three distinct, controlled test inboxes (aliases are fine if deliverable). Create via supported Supabase Auth Admin API or normal sign-up flow, verify email as configured, and store credentials only in an approved secret manager. Do **not** insert directly into `auth.users`, use real customer accounts, commit passwords, or expose service-role keys in the browser.

## Required synthetic records
1. Owner A creates a clearly labeled `QA ONLY — Owner A` inactive/draft listing; owner B creates a separate `QA ONLY — Owner B` inactive/draft listing. Keep fixtures nonbookable publicly.
2. Owner A draws one valid hunting polygon, one entry point, one parking point. Owner B must not read/update/delete A's zones.
3. Hunter makes a sandbox booking through the actual test checkout flow (Stripe TEST only) for a temporarily bookable **sandbox-only** listing. Do not fake paid status or invent a successful charge.
4. Check owner A approval, hunter notification, message access, cancellation/expiry, and owner B cross-booking denial.
5. For review testing, create an explicitly labeled historical test booking/payment fixture with authenticated QA identities and known eligible state **only after** validating the booking/payment constraints and separating it from Stripe accounting. Never mark a fabricated payment as an actual Stripe charge.
6. Submit one review as owner A; ensure duplicate review rejected, hunter sees only published reviews, owner B cannot submit for A's booking, and hunter cannot review themselves.

## Execution and evidence
- Record Auth user UUIDs and fixture UUIDs in private QA tracking, never credentials in Git.
- For each case capture HTTP status, relevant RLS error code, screenshot at desktop/tablet/mobile, and cleanup confirmation.
- Delete QA bookings, payment fixtures, reviews, zones, listings and synthetic Auth accounts in dependency order after tests. Never delete actual user data.
- **Go-live gate:** no production merge/deploy until the user explicitly says `Go Live!!`.

## Current status
The available Supabase connector exposes SQL, migrations and project inspection, but not Auth Admin create-user operations. Therefore these three **real sign-in accounts have not been provisioned**. Previous RLS tests simulated a JWT subject within a rolled-back SQL transaction; they are not authenticated browser tests.

## Authorized test inbox aliases (2026-11-10)
The user approved using Gmail inbox `roamquestlx@gmail.com` for these dedicated **sandbox-only** signup aliases:
- Owner A: `roamquestlx+leasewild-owner-a@gmail.com`
- Owner B: `roamquestlx+leasewild-owner-b@gmail.com`
- Hunter: `roamquestlx+leasewild-hunter@gmail.com`

These are proposed identifiers, **not verified Auth users**. Gmail plus-addressing generally routes to the base inbox. Supabase Auth signups, email verification and actual sessions must still be completed through supported Auth flows. Never store passwords, OTPs, or service-role keys in Git.

## Created sandbox fixtures — 2026-11-10
- All three Gmail alias Auth users verified and email-confirmed:
  - Owner A `103c4605-f279-4f87-a677-1ac2b46df373`
  - Owner B `856cfc35-9589-44e1-987c-e2fbb619dd9b`
  - Hunter `58356c6f-35b7-42c1-b9da-164863ea0cbb`
- Owner A listing `d626d2e9-d9a0-47a1-8433-fd04a3948b4e`, status `draft`
- Owner B listing `89eda82e-9b1e-460e-9946-b33f3eaa8057`, status `draft`
- Owner A test booking `fbcae70b-a4dc-41fd-ac9a-af47176b170b`, status `pre_reserved`, 2026-12-01 to 2026-12-02
- Owner B test booking `b04757c3-a801-4557-a765-44b213586db5`, status `pre_reserved`, 2026-12-03 to 2026-12-04
- Both bookings explicitly labeled QA ONLY; both listings are draft and must not be publicly bookable. These bookings are database fixtures, **not** proof of end-to-end booking flow or Stripe payment.
- Verification query: two draft listings, two pre_reserved bookings, **zero** `lease_payments` linked to test bookings.
- Cleanup: delete these booking IDs first, then these listing IDs, only after tests and dependency inspection. Do not delete unrelated records.
