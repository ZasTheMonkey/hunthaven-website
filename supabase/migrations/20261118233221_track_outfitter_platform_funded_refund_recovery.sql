alter table public.sandbox_booking_refund_recoveries add column booking_type text not null default 'landowner' check(booking_type='landowner');
create table public.sandbox_outfitter_refund_recoveries (
 booking_type text not null default 'outfitter' check(booking_type='outfitter'),
 booking_id uuid primary key references public.outfitter_booking_requests(id) on delete restrict,
 owner_id uuid not null references auth.users(id),
 payment_intent text not null,
 refund_id text unique,
 refund_amount_cents integer not null check(refund_amount_cents>0),
 transfer_id text,
 connected_account text,
 baseline_reversed_cents integer not null default 0 check(baseline_reversed_cents>=0),
 target_cents integer not null check(target_cents>=0),
 recovered_cents integer not null default 0 check(recovered_cents>=0 and recovered_cents<=target_cents),
 mode text not null check(mode in ('platform_funded','normal_pending')),
 status text not null default 'refund_pending' check(status in ('refund_pending','pending','recovering','recovered')),
 claim_started_at timestamptz,
 last_error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.sandbox_outfitter_refund_recoveries enable row level security;
revoke all on public.sandbox_outfitter_refund_recoveries from public,anon,authenticated;
grant all on public.sandbox_outfitter_refund_recoveries to service_role;
create index sandbox_outfitter_refund_recoveries_owner_pending on public.sandbox_outfitter_refund_recoveries(owner_id,created_at) where status<>'recovered';
create or replace function public.sandbox_claim_outfitter_refund_recovery(p_booking_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare claimed public.sandbox_outfitter_refund_recoveries;
begin
 update public.sandbox_outfitter_refund_recoveries set status='recovering',claim_started_at=now(),updated_at=now()
 where booking_id=p_booking_id and refund_id is not null and (status='pending' or (status='recovering' and claim_started_at<now()-interval '2 minutes')) returning * into claimed;
 if claimed.booking_id is null then return null; end if;
 return to_jsonb(claimed);
end $$;
revoke all on function public.sandbox_claim_outfitter_refund_recovery(uuid) from public,anon,authenticated;
grant execute on function public.sandbox_claim_outfitter_refund_recovery(uuid) to service_role;
notify pgrst,'reload schema';
