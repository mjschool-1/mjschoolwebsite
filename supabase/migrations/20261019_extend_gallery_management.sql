-- ==============================================================================
-- Migration: Complete Gallery & Facility Management (Idempotent)
-- File: supabase/migrations/20261019_extend_gallery_management.sql
-- Goal: 
--   1. Create public.facility_images table if it does not exist
--   2. Ensure all required columns (page_section, show_title, display_order, etc.) exist
--   3. Configure PostgreSQL Grants and Row Level Security (RLS) policies
--   4. Ensure site-banners storage bucket and its upload/download policies exist
--   5. Seed genuine initial records for Facilities, Infrastructure, and Gallery
--      WITHOUT overwriting existing uploaded images or custom settings
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table Creation (Safe & Idempotent)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.facility_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    page_section TEXT NOT NULL DEFAULT 'facilities',
    show_title BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- ------------------------------------------------------------------------------
-- 2. Defensive Column Additions (in case table existed from earlier iteration)
-- ------------------------------------------------------------------------------
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS facility_key TEXT;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS page_section TEXT NOT NULL DEFAULT 'facilities';
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS show_title BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Ensure unique constraint on facility_key exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'facility_images_facility_key_key' 
          AND conrelid = 'public.facility_images'::regclass
    ) THEN
        ALTER TABLE public.facility_images ADD CONSTRAINT facility_images_facility_key_key UNIQUE (facility_key);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Indexes for Query Performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_facility_images_page_section_order 
ON public.facility_images (page_section, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_facility_images_facility_key 
ON public.facility_images (facility_key);

-- ------------------------------------------------------------------------------
-- 4. PostgreSQL Grants (Layer 1 Security)
-- ------------------------------------------------------------------------------
GRANT SELECT ON TABLE public.facility_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.facility_images TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. Helper Function: is_admin() (Reuses admin_users verification)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (Layer 2 Security)
-- ------------------------------------------------------------------------------
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;

-- Public visitors can read all image metadata for website rendering
DROP POLICY IF EXISTS "Allow public read of facility_images" ON public.facility_images;
CREATE POLICY "Allow public read of facility_images"
    ON public.facility_images
    FOR SELECT
    USING (true);

-- Authorized admin staff can insert new gallery / facility items
DROP POLICY IF EXISTS "Allow authorized staff insert facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff insert facility_images"
    ON public.facility_images
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Authorized admin staff can update image URLs, titles, order, and visibility
DROP POLICY IF EXISTS "Allow authorized staff update facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff update facility_images"
    ON public.facility_images
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Authorized admin staff can delete gallery cards
DROP POLICY IF EXISTS "Allow authorized staff delete facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff delete facility_images"
    ON public.facility_images
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. Storage Bucket & Policies: 'site-banners'
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-banners', 'site-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can view/download uploaded images
DROP POLICY IF EXISTS "Public can view site-banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public download of site-banners" ON storage.objects;
CREATE POLICY "Public can view site-banners"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'site-banners');

-- Authorized staff can upload images to site-banners
DROP POLICY IF EXISTS "Authorized staff upload site-banners" ON storage.objects;
CREATE POLICY "Authorized staff upload site-banners"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-banners' AND public.is_admin());

-- Authorized staff can update/replace images in site-banners
DROP POLICY IF EXISTS "Authorized staff update site-banners" ON storage.objects;
CREATE POLICY "Authorized staff update site-banners"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-banners' AND public.is_admin())
    WITH CHECK (bucket_id = 'site-banners' AND public.is_admin());

-- Authorized staff can delete unused images from site-banners
DROP POLICY IF EXISTS "Authorized staff delete site-banners" ON storage.objects;
CREATE POLICY "Authorized staff delete site-banners"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-banners' AND public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. Seed Initial Records Safely (Do NOT overwrite existing content)
-- ------------------------------------------------------------------------------
-- Section A: Four Facilities Cards (/facilities/)
INSERT INTO public.facility_images (facility_key, title, image_url, display_order, page_section, show_title)
VALUES
    ('classrooms', 'Classrooms & Learning Spaces', NULL, 0, 'facilities', true),
    ('hygiene', 'Cleanliness & Hygiene', NULL, 1, 'facilities', true),
    ('play-swimming', 'Early Years Play & Swimming', NULL, 2, 'facilities', true),
    ('traditions', 'Indian Values & Traditions', NULL, 3, 'facilities', true)
ON CONFLICT (facility_key) DO NOTHING;

-- Section B: Campus Infrastructure Photo (/about/infrastructure/)
-- Separate from hero banner; default image is NULL so it retains the placeholder
INSERT INTO public.facility_images (facility_key, title, image_url, display_order, page_section, show_title)
VALUES
    ('campus_main', 'Campus Infrastructure', NULL, 0, 'infrastructure', true)
ON CONFLICT (facility_key) DO NOTHING;

-- Section C: Three Public Gallery Moments Cards (/gallery/)
INSERT INTO public.facility_images (facility_key, title, image_url, display_order, page_section, show_title)
VALUES
    ('gallery_1', 'Everyday Learning', NULL, 0, 'gallery', true),
    ('gallery_2', 'Learning Beyond Books', NULL, 1, 'gallery', true),
    ('gallery_3', 'Rooted in Indian Values', NULL, 2, 'gallery', true)
ON CONFLICT (facility_key) DO NOTHING;

-- Section D: Backfill default values for any pre-existing rows with NULL values
UPDATE public.facility_images 
SET page_section = 'facilities' 
WHERE page_section IS NULL OR page_section = '';

UPDATE public.facility_images 
SET show_title = true 
WHERE show_title IS NULL;

UPDATE public.facility_images 
SET title = '' 
WHERE title IS NULL;

-- ------------------------------------------------------------------------------
-- 9. Gallery Card Image Sets (Multiple Images Per Card for /gallery/)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_card_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_key TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- Defensive column additions
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS card_key TEXT;
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS caption TEXT DEFAULT '';
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.gallery_card_images ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Index for card-based retrieval and sequence order
CREATE INDEX IF NOT EXISTS idx_gallery_card_images_card_order 
ON public.gallery_card_images (card_key, display_order ASC);

-- PostgreSQL Grants
GRANT SELECT ON TABLE public.gallery_card_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gallery_card_images TO authenticated;

-- Row Level Security
ALTER TABLE public.gallery_card_images ENABLE ROW LEVEL SECURITY;

-- Public can read all published card images
DROP POLICY IF EXISTS "Allow public read of gallery_card_images" ON public.gallery_card_images;
CREATE POLICY "Allow public read of gallery_card_images"
    ON public.gallery_card_images
    FOR SELECT
    USING (true);

-- Authorized staff can insert set images
DROP POLICY IF EXISTS "Allow authorized staff insert gallery_card_images" ON public.gallery_card_images;
CREATE POLICY "Allow authorized staff insert gallery_card_images"
    ON public.gallery_card_images
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Authorized staff can update set images (reorder, caption, replace)
DROP POLICY IF EXISTS "Allow authorized staff update gallery_card_images" ON public.gallery_card_images;
CREATE POLICY "Allow authorized staff update gallery_card_images"
    ON public.gallery_card_images
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Authorized staff can delete set images
DROP POLICY IF EXISTS "Allow authorized staff delete gallery_card_images" ON public.gallery_card_images;
CREATE POLICY "Allow authorized staff delete gallery_card_images"
    ON public.gallery_card_images
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

