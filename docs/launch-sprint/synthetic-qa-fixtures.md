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
