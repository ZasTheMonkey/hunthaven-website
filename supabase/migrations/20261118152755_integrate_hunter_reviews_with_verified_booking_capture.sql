-- Sandbox integration; no payment rows are invented or backfilled.
create or replace function leasewild_private.review_eligibility(p_booking_id uuid)
returns table(hunter_id uuid) language sql stable security definer set search_path='' as $$
 select u.id from public.bookings b
 join public.listings l on l.id=b.listing_id
 join auth.users u on lower(u.email)=lower(b.guest_email)
 where b.id=p_booking_id and (select auth.uid()) is not null
 and l.owner_id=(select auth.uid()) and u.id<>(select auth.uid())
 and b.status='confirmed'
 and (((b.check_out::date+coalesce(l.checkout_time,'00:00:00'::time)) at time zone coalesce(l.time_zone,'America/New_York'))<=now())
 and (
  (b.stripe_payment_intent like 'pi_%' and b.authorization_created_at is not null)
  or exists(select 1 from public.lease_payments lp where lp.booking_id=b.id and lp.owner_id=l.owner_id and lp.guest_id=u.id and lp.payment_state='paid' and lp.checkout_at<=now() and lp.state not in ('cancelled','refunded','refund_pending','disputed','failed'))
 )
 limit 1
$$;
revoke all on function leasewild_private.review_eligibility(uuid) from public,anon;
grant execute on function leasewild_private.review_eligibility(uuid) to authenticated;

create or replace function leasewild_private.owner_can_review_booking(p_booking_id uuid,p_hunter_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from leasewild_private.review_eligibility(p_booking_id) e where e.hunter_id=p_hunter_id)
$$;
revoke all on function leasewild_private.owner_can_review_booking(uuid,uuid) from public,anon;
grant execute on function leasewild_private.owner_can_review_booking(uuid,uuid) to authenticated;

create or replace function public.sandbox_hunter_review_eligibility(p_booking_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce((select jsonb_build_object('eligible',true,'hunter_id',e.hunter_id) from leasewild_private.review_eligibility(p_booking_id) e),jsonb_build_object('eligible',false))
$$;
revoke all on function public.sandbox_hunter_review_eligibility(uuid) from public,anon;
grant execute on function public.sandbox_hunter_review_eligibility(uuid) to authenticated;

create table if not exists leasewild_private.hunter_review_moderation_audit(
 id uuid primary key default gen_random_uuid(),review_id uuid not null,
 moderator_id uuid not null references auth.users(id),status text not null,
 created_at timestamptz not null default now()
);
alter table leasewild_private.hunter_review_moderation_audit enable row level security;
revoke all on leasewild_private.hunter_review_moderation_audit from public,anon,authenticated;

create or replace function leasewild_private.moderate_hunter_review(p_review_id uuid,p_status text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if (select auth.uid()) is null or not private.is_listing_review_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_status not in ('published','hidden','rejected') then raise exception 'Invalid moderation status' using errcode='22023'; end if;
 update public.hunter_reviews set moderation_status=p_status where id=p_review_id returning jsonb_build_object('id',id,'moderation_status',moderation_status) into result;
 if result is null then raise exception 'Review not found' using errcode='P0002'; end if;
 insert into leasewild_private.hunter_review_moderation_audit(review_id,moderator_id,status) values(p_review_id,(select auth.uid()),p_status);
 return result;
end $$;
revoke all on function leasewild_private.moderate_hunter_review(uuid,text) from public,anon;
grant execute on function leasewild_private.moderate_hunter_review(uuid,text) to authenticated;
create or replace function public.sandbox_moderate_hunter_review(p_review_id uuid,p_status text)
returns jsonb language sql security invoker set search_path='' as $$select leasewild_private.moderate_hunter_review(p_review_id,p_status)$$;
revoke all on function public.sandbox_moderate_hunter_review(uuid,text) from public,anon;
grant execute on function public.sandbox_moderate_hunter_review(uuid,text) to authenticated;

notify pgrst,'reload schema';
