create or replace function leasewild_private.guard_outfitter_booking_insert() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is not null and (new.payment_status<>'unpaid' or new.stripe_checkout_session_id is not null or new.stripe_payment_intent_id is not null or new.amount_cents is not null or new.currency<>'usd') then
  raise exception 'Payment fields are managed by the sandbox payment service' using errcode='42501';
 end if;
 return new;
end $$;
revoke all on function leasewild_private.guard_outfitter_booking_insert() from public,anon,authenticated;
create trigger guard_outfitter_booking_insert before insert on public.outfitter_booking_requests for each row execute function leasewild_private.guard_outfitter_booking_insert();
notify pgrst,'reload schema';
