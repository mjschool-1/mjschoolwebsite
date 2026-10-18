-- ==============================================================================
-- Migration: Create and Configure Facilities Gallery Table with RLS
-- File: supabase/migrations/20261019_create_facility_images_table.sql
-- Goal: Dedicated, persistent table for managing the 4 facilities card images on /facilities/
-- ==============================================================================

-- 1. Create public.facility_images table
CREATE TABLE IF NOT EXISTS public.facility_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- 2. Add columns if migrating from partial schema
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS facility_key TEXT UNIQUE NOT NULL;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- 3. Grants for anon and authenticated roles
GRANT SELECT ON TABLE public.facility_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.facility_images TO authenticated;

-- 4. Enable Row Level Security
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;

-- 5. Helper function is_admin() check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
      AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 6. Row Level Security Policies
-- Policy: Public visitors can view all facility card images
DROP POLICY IF EXISTS "Allow public read of facility_images" ON public.facility_images;
CREATE POLICY "Allow public read of facility_images"
    ON public.facility_images
    FOR SELECT
    USING (true);

-- Policy: Authorized staff can view all facility images
DROP POLICY IF EXISTS "Allow authorized staff read all facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff read all facility_images"
    ON public.facility_images
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Policy: Authorized staff can insert facility images
DROP POLICY IF EXISTS "Allow authorized staff insert facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff insert facility_images"
    ON public.facility_images
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Policy: Authorized staff can update facility images
DROP POLICY IF EXISTS "Allow authorized staff update facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff update facility_images"
    ON public.facility_images
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy: Authorized staff can delete facility images
DROP POLICY IF EXISTS "Allow authorized staff delete facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff delete facility_images"
    ON public.facility_images
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 7. Seed initial entries for the 4 Facilities cards
INSERT INTO public.facility_images (facility_key, title, image_url, display_order)
VALUES
    ('classrooms', 'Classrooms & Learning Spaces', NULL, 0),
    ('hygiene', 'Cleanliness & Hygiene', NULL, 1),
    ('play-swimming', 'Early Years Play & Swimming', NULL, 2),
    ('traditions', 'Indian Values & Traditions', NULL, 3)
ON CONFLICT (facility_key) DO NOTHING;
