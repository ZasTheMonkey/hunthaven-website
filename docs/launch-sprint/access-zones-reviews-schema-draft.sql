-- LeaseWild sandbox design draft: access zones and landowner reviews of hunters
-- Status: REVIEW ONLY / NOT A MIGRATION / DO NOT APPLY
-- Created: 2026-11-10
--
-- This file is intentionally guarded so accidental execution fails closed.
-- It documents the proposed database contract for sandbox implementation.
-- Before converting it into a migration:
--   1. identify an unambiguous non-production Supabase project;
--   2. inspect the live sandbox listings/bookings/auth schema and status values;
--   3. create a migration with the Supabase CLI;
--   4. test with dedicated owner, second-owner, hunter, and unrelated-user accounts;
--   5. run database security/performance advisors;
--   6. obtain legal/privacy review for location disclosure and review moderation.
--
-- Existing repository warning:
-- supabase-schema.sql currently grants public SELECT of active listing rows and
-- includes street_address, parcel_boundary and allowed_zone on the same table.
-- A client-side field list reduces routine exposure but does not prevent direct
-- Data API requests. The database must revoke direct public catalog access and
-- expose only a reviewed safe-column view before sensitive geometry is stored.

begin;

do $draft_guard$
begin
  raise exception
    'DRAFT ONLY: remove this guard only after sandbox schema inspection, QA authorization, legal review, and migration generation';
end
$draft_guard$;

-- =====================================================================
-- VERIFIED SANDBOX SCHEMA INSPECTION (2026-11-10; read-only):
-- Supabase project kbkdfpmlyggfijkyjxoi is named leasewild-payment-testing.
-- public.bookings has id, listing_id, check_in, check_out, status,
-- but NO owner_id, hunter_id, or completed_at columns.
-- public.lease_payments has booking_id, owner_id, guest_id, listing_id,
-- checkin_at, checkout_at, payment_state; actual identity and eligibility
-- must be checked against its authoritative lifecycle, not inferred.
-- The proposed hunter_reviews INSERT policy below REFERENCES NONEXISTENT
-- bookings columns and MUST NOT be executed unchanged.
-- Owner-to-booking association and review eligibility need a reviewed join
-- with lease_payments, including refunded/cancelled and payout edge cases.
-- Do not modify existing payment tables to satisfy this draft.
--
-- PREREQUISITES TO VERIFY (names are assumptions, not established facts)
-- =====================================================================
-- public.listings:
--   id uuid primary key
--   owner_id uuid not null references auth.users(id)
--
-- public.bookings:
--   id uuid primary key
--   listing_id uuid not null references public.listings(id)
--   owner_id uuid not null references auth.users(id)
--   hunter_id uuid not null references auth.users(id)
--   status text not null
--   completed_at timestamptz
--
-- Review the sandbox booking state machine before replacing the provisional
-- authorized statuses below. Do not infer eligibility from payment client state.

create extension if not exists postgis with schema extensions;

-- =====================================================================
-- ACCESS ZONES
-- =====================================================================

create table public.listing_access_zones (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  zone_type text not null
    check (zone_type in ('hunting_area', 'entry', 'parking')),
  label text not null
    check (char_length(btrim(label)) between 1 and 80),
  geometry extensions.geometry(Geometry, 4326) not null,
  visibility text not null default 'confirmed_booking'
    check (visibility in ('owner_only', 'confirmed_booking')),
  instructions text
    check (instructions is null or char_length(instructions) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint listing_access_zones_geometry_valid
    check (extensions.st_isvalid(geometry)),
  constraint listing_access_zones_geometry_bounds
    check (
      extensions.st_within(
        geometry,
        extensions.st_makeenvelope(-180, -90, 180, 90, 4326)
      )
    ),
  constraint listing_access_zones_type_geometry
    check (
      (zone_type = 'hunting_area' and extensions.st_geometrytype(geometry) = 'ST_Polygon')
      or
      (zone_type in ('entry', 'parking')
        and extensions.st_geometrytype(geometry) in ('ST_Point', 'ST_Polygon'))
    )
);

create index listing_access_zones_listing_id_idx
  on public.listing_access_zones (listing_id);

create index listing_access_zones_geometry_gix
  on public.listing_access_zones using gist (geometry);

alter table public.listing_access_zones enable row level security;

revoke all on table public.listing_access_zones from anon;
grant select, insert, update, delete
  on table public.listing_access_zones to authenticated;

create policy "Owners can read their listing access zones"
  on public.listing_access_zones
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_access_zones.listing_id
        and l.owner_id = (select auth.uid())
    )
  );

-- SECURITY HOLD (P0): do not grant hunters access to precise hunting,
-- entry or parking coordinates until the real sandbox booking lifecycle is
-- inspected and a time-limited authorization rule is reviewed and tested.
-- The former status-only policy permitted indefinite access after completion.
-- The final policy must derive an access window from authoritative booking
-- check-in/check-out timestamps, explicitly revoke access on cancellation and
-- refund, and never trust browser-supplied dates or booking status.
-- Owner SELECT policy above remains independent of this fail-closed hold.
create policy "Hunter zone access pending time-window review"
  on public.listing_access_zones
  for select
  to authenticated
  using (false);

create policy "Owners can insert zones for their listings"
  on public.listing_access_zones
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.listings l
      where l.id = listing_access_zones.listing_id
        and l.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update zones for their listings"
  on public.listing_access_zones
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_access_zones.listing_id
        and l.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.listings l
      where l.id = listing_access_zones.listing_id
        and l.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete zones for their listings"
  on public.listing_access_zones
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_access_zones.listing_id
        and l.owner_id = (select auth.uid())
    )
  );

-- =====================================================================
-- LANDOWNER REVIEWS OF HUNTERS
-- =====================================================================

create table public.hunter_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  reviewer_owner_id uuid not null references auth.users(id) on delete restrict,
  hunter_id uuid not null references auth.users(id) on delete restrict,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  communication_rating smallint check (communication_rating between 1 and 5),
  safety_rating smallint check (safety_rating between 1 and 5),
  property_respect_rating smallint check (property_respect_rating between 1 and 5),
  review_text text
    check (review_text is null or char_length(review_text) <= 2000),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'published', 'hidden', 'rejected')),
  created_at timestamptz not null default now(),

  constraint hunter_reviews_one_per_booking unique (booking_id)
);

create index hunter_reviews_hunter_published_idx
  on public.hunter_reviews (hunter_id, created_at desc)
  where moderation_status = 'published';

create index hunter_reviews_reviewer_owner_id_idx
  on public.hunter_reviews (reviewer_owner_id);

alter table public.hunter_reviews enable row level security;

revoke all on table public.hunter_reviews from anon;
grant select, insert on table public.hunter_reviews to authenticated;

create policy "Owners can read reviews they submitted"
  on public.hunter_reviews
  for select
  to authenticated
  using (reviewer_owner_id = (select auth.uid()));

create policy "Hunters can read published reviews about themselves"
  on public.hunter_reviews
  for select
  to authenticated
  using (
    hunter_id = (select auth.uid())
    and moderation_status = 'published'
  );

create policy "Owners can review completed eligible bookings"
  on public.hunter_reviews
  for insert
  to authenticated
  with check (
    reviewer_owner_id = (select auth.uid())
    -- INSERT policy must enforce moderation; DEFAULT alone is bypassable.
    and moderation_status = 'pending'
    and exists (
      select 1
      from public.bookings b
      where b.id = hunter_reviews.booking_id
        and b.owner_id = (select auth.uid())
        and b.hunter_id = hunter_reviews.hunter_id
        and b.status = 'completed' -- REVIEW STATUS VALUE
        and b.completed_at is not null
        and b.completed_at <= now()
    )
  );

-- No client UPDATE or DELETE policy is intentional:
-- a submitted review is immutable from the browser. Corrections, appeals,
-- moderation and deletion require a reviewed server/admin workflow.

create table public.hunter_review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.hunter_reviews(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  category text not null
    check (category in ('privacy', 'harassment', 'inaccurate', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint hunter_review_reports_one_per_reporter unique (review_id, reporter_id)
);

create index hunter_review_reports_review_id_idx
  on public.hunter_review_reports (review_id);

alter table public.hunter_review_reports enable row level security;

revoke all on table public.hunter_review_reports from anon;
grant select, insert on table public.hunter_review_reports to authenticated;

create policy "Users can read their own review reports"
  on public.hunter_review_reports
  for select
  to authenticated
  using (reporter_id = (select auth.uid()));

create policy "Authenticated users can report visible reviews"
  on public.hunter_review_reports
  for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and exists (
      select 1
      from public.hunter_reviews r
      where r.id = hunter_review_reports.review_id
        and r.moderation_status = 'published'
    )
  );

-- =====================================================================
-- PUBLIC CATALOG SEPARATION (REQUIRED BEFORE ZONE DATA)
-- =====================================================================

create view public.public_listing_catalog
with (security_invoker = true)
as
select
  id,
  created_at,
  status,
  state,
  county,
  acreage,
  pricing_type,
  price_per_day,
  max_guests,
  cleaning_fee,
  min_stay,
  activities,
  description,
  photo_urls,
  allow_out_of_state,
  video_url,
  num_beds,
  deer_activity,
  hogs_active,
  trail_cam_date
from public.listings
where status = 'active';

-- Review existing grants before enabling these lines.
-- security_invoker requires the caller to have access to the referenced columns.
-- Revoke broad table reads, then grant only the catalog columns needed by the view.
-- This also constrains direct Data API reads to the same safe presentation fields.
revoke select on table public.listings from anon, authenticated;
grant select (
  id,
  created_at,
  status,
  state,
  county,
  acreage,
  pricing_type,
  price_per_day,
  max_guests,
  cleaning_fee,
  min_stay,
  activities,
  description,
  photo_urls,
  allow_out_of_state,
  video_url,
  num_beds,
  deer_activity,
  hogs_active,
  trail_cam_date
) on table public.listings to anon, authenticated;
grant select on table public.public_listing_catalog to anon, authenticated;

-- IMPORTANT: existing authenticated owner screens that read street_address,
-- parcel_boundary or allowed_zone directly from listings would lose that access.
-- Before migration, move those fields to an owner-only private table or expose
-- a separately reviewed owner API. Do not restore broad SELECT on listings.

-- =====================================================================
-- REQUIRED NEGATIVE / POSITIVE TESTS BEFORE APPLICATION UI WORK
-- =====================================================================
-- PASS owner A: create/edit/delete zones only for owner A listings.
-- PASS owner B: cannot read or mutate owner A zones.
-- PASS unrelated hunter: cannot read any zone coordinates.
-- PASS confirmed hunter: reads only confirmed-booking zones for booked listing.
-- PASS canceled/refunded hunter: cannot read zones after state transition.
-- PASS geometry: reject invalid/self-intersecting polygons and out-of-range coords.
-- PASS review: only completed booking owner can insert, exactly once.
-- PASS mismatch: owner/hunter/booking ID substitution is rejected.
-- PASS moderation: pending/hidden/rejected reviews are not visible to hunter/catalog.
-- PASS report: one report per authenticated user; private details never public.
-- PASS public catalog: no email, phone, street_address, parcel_boundary,
--      allowed_zone or access-zone geometry in anon responses.
-- PASS advisors: no security/performance findings left unreviewed.

rollback;
