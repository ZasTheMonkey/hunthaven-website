create table public.booking_partial_refunds (
  booking_id uuid primary key references public.bookings(id),
  requested_by uuid not null,
  stripe_payment_intent text not null,
  stripe_refund_id text unique not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null check (currency = 'usd'),
  status text not null,
  captured_amount_cents bigint not null,
  refunded_amount_cents bigint not null,
  remaining_paid_cents bigint not null check (remaining_paid_cents >= 0),
  updated_at timestamptz not null default now()
);
alter table public.booking_partial_refunds enable row level security;
revoke all on public.booking_partial_refunds from public, anon, authenticated;
grant select, insert, update on public.booking_partial_refunds to service_role;
