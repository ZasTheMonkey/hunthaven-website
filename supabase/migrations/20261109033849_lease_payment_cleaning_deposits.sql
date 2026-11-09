alter table public.listings
 add column checkin_time time not null default '00:00',
 add column checkout_time time not null default '00:00',
 add column time_zone text not null default 'America/New_York' check (time_zone in ('America/New_York','America/Chicago','America/Denver','America/Phoenix','America/Los_Angeles','America/Anchorage','Pacific/Honolulu')),
 add column hunting_methods text[] not null default '{}' check (hunting_methods <@ array['rifle','bow']::text[]);

-- New payments only. Existing charges/bookings are not converted into deposits.
create table public.lease_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id),
  listing_id uuid not null references public.listings(id),
  guest_id uuid not null references auth.users(id),
  owner_id uuid not null references auth.users(id),
  guest_email text not null,
  destination text not null,
  lease_cents integer not null check (lease_cents >= 50),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  tax_rate_bps integer not null default 0 check (tax_rate_bps between 0 and 10000),
  owner_cents integer not null check (owner_cents >= 0),
  platform_cents integer not null check (platform_cents >= 0),
  total_cents integer not null check (total_cents = owner_cents + platform_cents),
  deposit_cents integer not null check (deposit_cents >= 0),
  checkin_at timestamptz not null,
  time_zone text not null,
  hunting_methods text[] not null,
  checkout_at timestamptz not null check (checkout_at > checkin_at),
  hold_at timestamptz not null,
  claim_deadline timestamptz not null check (claim_deadline = checkout_at + interval '48 hours'),
  policy_version text not null,
  consent_at timestamptz not null,
  customer_id text,
  payment_method_id text,
  checkout_session_id text unique,
  lease_intent_id text unique,
  deposit_intent_id text unique,
  recovery_session_id text unique,
  capture_before timestamptz,
  payment_state text not null default 'unpaid' check (payment_state in ('unpaid','paid','cancelled','refunded')),
  state text not null default 'scheduled' check (state in ('scheduled','authorizing','held','action_required','capturing','captured','releasing','released','not_required')),
  claim_cents integer check (claim_cents > 0 and claim_cents <= deposit_cents),
  claim_reason text,
  claim_at timestamptz,
  captured_cents integer not null default 0 check (captured_cents >= 0 and captured_cents <= deposit_cents),
  next_attempt_at timestamptz default now(),
  locked_until timestamptz,
  lock_token uuid,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lease_payments enable row level security;
revoke all on public.lease_payments from anon, authenticated;
grant select on public.lease_payments to authenticated;
grant all on public.lease_payments to service_role;
create policy lease_payment_participant_read on public.lease_payments for select to authenticated
using (guest_id=(select auth.uid()) or owner_id=(select auth.uid()));
create index lease_payments_guest_idx on public.lease_payments(guest_id);
create index lease_payments_owner_idx on public.lease_payments(owner_id);
create index lease_payments_work_idx on public.lease_payments(next_attempt_at) where next_attempt_at is not null;

-- A bounded lease and stable Stripe idempotency keys make retries safe.
create function public.lock_lease_payment(p_id uuid,p_token uuid)
returns setof public.lease_payments language sql security invoker set search_path='' as $$
 update public.lease_payments set lock_token=p_token,locked_until=now()+interval '5 minutes'
 where id=p_id and (locked_until is null or locked_until<now()) returning *;
$$;
revoke all on function public.lock_lease_payment(uuid,uuid) from public,anon,authenticated;
grant execute on function public.lock_lease_payment(uuid,uuid) to service_role;

-- Scheduler is installed separately after test-mode verification; see docs/payments.md.
