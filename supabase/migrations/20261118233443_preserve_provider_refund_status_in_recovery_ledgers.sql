alter table public.sandbox_booking_refund_recoveries add column refund_status text not null default 'pending';
alter table public.sandbox_outfitter_refund_recoveries add column refund_status text not null default 'pending';
update public.sandbox_booking_refund_recoveries set refund_status='succeeded' where refund_id is not null and status in ('pending','recovering','recovered');
notify pgrst,'reload schema';
