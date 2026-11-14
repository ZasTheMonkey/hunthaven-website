-- Sandbox-only duplicate checkout protection.
-- The browser supplies one UUID per logical booking attempt; the unique index
-- makes retries return the original Stripe Checkout Session instead of
-- inserting a second booking.
alter table public.bookings
  add column if not exists checkout_request_key uuid;

create unique index if not exists bookings_checkout_request_key_unique
  on public.bookings (checkout_request_key)
  where checkout_request_key is not null;

comment on column public.bookings.checkout_request_key is
  'Sandbox browser-generated idempotency key. Replays must return the original Checkout Session instead of creating another booking.';
