create or replace function leasewild_private.hunter_review_for_admin(p_review_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if (select auth.uid()) is null or not private.is_listing_review_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 select jsonb_build_object('id',id,'booking_id',booking_id,'overall_rating',overall_rating,'review_text',review_text,'moderation_status',moderation_status) into result from public.hunter_reviews where id=p_review_id;
 return result;
end $$;
revoke all on function leasewild_private.hunter_review_for_admin(uuid) from public,anon;
grant execute on function leasewild_private.hunter_review_for_admin(uuid) to authenticated;
create or replace function public.sandbox_hunter_review_for_admin(p_review_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$select leasewild_private.hunter_review_for_admin(p_review_id)$$;
revoke all on function public.sandbox_hunter_review_for_admin(uuid) from public,anon;
grant execute on function public.sandbox_hunter_review_for_admin(uuid) to authenticated;
notify pgrst,'reload schema';
