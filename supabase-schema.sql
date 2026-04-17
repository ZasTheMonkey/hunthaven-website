-- ============================================================
--  WILDBOOK — Supabase Schema
--  Run this entire file in the Supabase SQL Editor once.
-- ============================================================

-- ── 1. LISTINGS TABLE ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listings (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  status           text        NOT NULL DEFAULT 'active',

  -- Landowner contact
  first_name       text,
  last_name        text,
  email            text,
  phone            text,

  -- Property details
  state            text,
  county           text,
  acreage          numeric,
  price_per_day    numeric,
  cleaning_fee     numeric,
  min_stay         integer,

  -- Listing content
  activities       text[],
  custom_animals   text,
  description      text,
  hear_about       text,
  photo_urls       text[]      NOT NULL DEFAULT '{}'
);

-- ── 2. ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public can SELECT active listings only
CREATE POLICY "Public can view active listings"
  ON public.listings
  FOR SELECT
  USING (status = 'active');

-- Public can INSERT new listings (landowner submission form)
CREATE POLICY "Public can submit listings"
  ON public.listings
  FOR INSERT
  WITH CHECK (true);

-- Service-role (admin) can UPDATE status (take-down / restore)
-- The admin page uses the anon key but bypasses RLS via a custom
-- UPDATE policy that allows any authenticated session OR the
-- service role. For the simple password-protected admin panel
-- (client-side auth), we allow unrestricted UPDATE so the
-- Take Down / Restore buttons work with the anon key.
-- ⚠️  Upgrade to a real auth flow before going to production.
CREATE POLICY "Allow status updates for admin"
  ON public.listings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ── 3. STORAGE BUCKET ───────────────────────────────────────
-- Run in SQL editor (storage schema is available in Supabase)

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the bucket
CREATE POLICY "Public can upload listing photos"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'listing-photos');

-- Allow public reads from the bucket
CREATE POLICY "Public can view listing photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listing-photos');
