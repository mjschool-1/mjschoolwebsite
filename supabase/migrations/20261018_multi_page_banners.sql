-- ==============================================================================
-- MJ School — Multi-Page Banner Management Migration (For Review)
-- File: supabase/migrations/20261018_multi_page_banners.sql
-- Goal: Ensure site_banners supports all 7 website page categories with multi-banner ordering
-- Note: Provide this migration for review; do not run against live Supabase automatically.
-- ==============================================================================

-- ==============================================================================
-- 1. CANONICAL PAGE KEY TO ROUTE MAPPING
-- ==============================================================================
-- 1. homepage           -> /
-- 2. infrastructure     -> /about/infrastructure
-- 3. facilities         -> /facilities
-- 4. faculty_staff      -> /about/faculty-staff/
-- 5. syllabus           -> /academics/syllabus
-- 6. gallery            -> /gallery
-- 7. events_activities  -> /academics/events-activities

-- ==============================================================================
-- 2. SCHEMA VERIFICATION & SAFE COLUMN ADDITIONS
-- ==============================================================================
-- Ensure the base table exists
CREATE TABLE IF NOT EXISTS public.site_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT NOT NULL DEFAULT 'homepage',
    page_path TEXT NOT NULL DEFAULT '/',
    title TEXT NOT NULL DEFAULT 'Hero Banner',
    desktop_image_path TEXT NOT NULL,
    mobile_image_path TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- Idempotently ensure all required columns are present with sensible defaults
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS page_key TEXT NOT NULL DEFAULT 'homepage';
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS page_path TEXT NOT NULL DEFAULT '/';
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Hero Banner';
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS desktop_image_path TEXT;
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS mobile_image_path TEXT;
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- ==============================================================================
-- 3. SAFE REMOVAL OF ANY UNIQUE CONSTRAINT ON PAGE_KEY
-- ==============================================================================
-- We must allow multiple banners per page_key for carousel rotation & ordering.
ALTER TABLE public.site_banners DROP CONSTRAINT IF EXISTS site_banners_page_key_key;

DO $$
DECLARE
    v_constraint_name TEXT;
BEGIN
    FOR v_constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'site_banners'
          AND con.contype = 'u'
          AND ARRAY['page_key']::TEXT[] = (
              SELECT array_agg(att.attname::TEXT ORDER BY ord.ord)
              FROM unnest(con.conkey) WITH ORDINALITY AS ord(attnum, ord)
              JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ord.attnum
          )
    LOOP
        EXECUTE format('ALTER TABLE public.site_banners DROP CONSTRAINT IF EXISTS %I', v_constraint_name);
    END LOOP;
END;
$$;

-- ==============================================================================
-- 4. PERFORMANCE COMPOSITE INDEX FOR MULTI-PAGE BANNER QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_site_banners_page_order 
ON public.site_banners (page_key, is_published, display_order ASC, created_at ASC);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Grant required table privileges
GRANT SELECT ON TABLE public.site_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_banners TO authenticated;

-- Public can read any published banner for any page
DROP POLICY IF EXISTS "Allow public read of published banners" ON public.site_banners;
CREATE POLICY "Allow public read of published banners"
    ON public.site_banners
    FOR SELECT
    USING (is_published = true);

-- Authorized staff can read all banners (including drafts)
DROP POLICY IF EXISTS "Allow authorized staff read all banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff read all banners"
    ON public.site_banners
    FOR SELECT
    TO authenticated
    USING (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          AND is_active = true
      )
    );

-- Authorized staff can insert banners
DROP POLICY IF EXISTS "Allow authorized staff insert banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff insert banners"
    ON public.site_banners
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          AND is_active = true
      )
    );

-- Authorized staff can update banners
DROP POLICY IF EXISTS "Allow authorized staff update banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff update banners"
    ON public.site_banners
    FOR UPDATE
    TO authenticated
    USING (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          AND is_active = true
      )
    )
    WITH CHECK (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          AND is_active = true
      )
    );

-- Authorized staff can delete banners
DROP POLICY IF EXISTS "Allow authorized staff delete banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff delete banners"
    ON public.site_banners
    FOR DELETE
    TO authenticated
    USING (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          AND is_active = true
      )
    );

-- ==============================================================================
-- 6. READ-ONLY VERIFICATION DIAGNOSTIC QUERIES
-- ==============================================================================
-- Run these queries to inspect configured banners by category:
--
-- SELECT page_key, page_path, COUNT(*) AS total_banners, 
--        COUNT(*) FILTER (WHERE is_published = true) AS published_banners
-- FROM public.site_banners
-- GROUP BY page_key, page_path
-- ORDER BY page_key;
