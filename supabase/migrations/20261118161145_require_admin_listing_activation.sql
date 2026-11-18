create or replace function leasewild_private.guard_listing_activation() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is not null and not private.is_listing_review_admin() then
  if new.status='active' and (tg_op='INSERT' or old.status is distinct from 'active') then raise exception 'Admin review is required before activating a listing' using errcode='42501'; end if;
 end if;
 return new;
end $$;
revoke all on function leasewild_private.guard_listing_activation() from public,anon,authenticated;
create trigger guard_listing_activation before insert or update of status on public.listings for each row execute function leasewild_private.guard_listing_activation();
notify pgrst,'reload schema';
