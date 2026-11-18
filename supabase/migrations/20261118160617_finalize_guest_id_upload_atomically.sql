alter table public.sandbox_booking_guests drop constraint sandbox_booking_guests_verification_status_check;
alter table public.sandbox_booking_guests add constraint sandbox_booking_guests_verification_status_check check (verification_status in ('pending','submitted','approved','rejected','exempt_minor'));
create or replace function public.sandbox_finalize_guest_id_upload(p_token_id uuid,p_guest_id uuid,p_path text) returns boolean language plpgsql security definer set search_path='' as $$
declare token_guest uuid; booking uuid;
begin
 select t.guest_id into token_guest from public.sandbox_guest_id_invitation_tokens t where t.id=p_token_id and t.guest_id=p_guest_id and t.used_at is null and t.expires_at>now() for update;
 if token_guest is null then return false; end if;
 select g.booking_id into booking from public.sandbox_booking_guests g join public.bookings b on b.id=g.booking_id where g.id=p_guest_id and not g.is_minor and g.verification_status='pending' and b.status in ('pending_approval','confirmed','approved') and (b.check_in::date+time '23:59:59') at time zone 'UTC'>now() for update of g;
 if booking is null or p_path not like 'sandbox-guest-ids/'||booking::text||'/'||p_guest_id::text||'/%' then return false; end if;
 update public.sandbox_booking_guests set document_path=p_path,verification_status='submitted' where id=p_guest_id;
 update public.sandbox_guest_id_invitation_tokens set used_at=now() where id=p_token_id;
 return true;
end $$;
revoke all on function public.sandbox_finalize_guest_id_upload(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.sandbox_finalize_guest_id_upload(uuid,uuid,text) to service_role;
notify pgrst,'reload schema';
