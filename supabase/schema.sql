-- ==============================================================================
-- MJ School, Shahapur — Supabase Database & Storage Hardened Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- ==============================================================================
-- 1. Administrative Users & Staff Authorization Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'office_staff')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to evaluate staff authorization with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
      AND is_active = true
  );
$$;

-- Helper function to evaluate super administrator status with SECURITY DEFINER (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

-- Security Definer RPC function to reliably return staff authorization status
CREATE OR REPLACE FUNCTION public.get_staff_authorization_status()
RETURNS TABLE (
    is_authorized BOOLEAN,
    role TEXT,
    email TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT true, au.role, au.email
  FROM public.admin_users au
  WHERE au.id = auth.uid()
    AND au.is_active = true
  LIMIT 1;
$$;

-- RLS: Authenticated user can check their own active admin authorization
DROP POLICY IF EXISTS "Users can check their own admin status" ON public.admin_users;
CREATE POLICY "Users can check their own admin status"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = id
      AND is_active = true
    );

-- RLS: Only super_admin accounts can insert, update, or remove administrative roles
DROP POLICY IF EXISTS "Super admins manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins manage admin_users"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ==============================================================================
-- 2. site_banners Table & Hardened Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT NOT NULL DEFAULT 'homepage',
    page_path TEXT NOT NULL DEFAULT '/',
    title TEXT NOT NULL DEFAULT 'Homepage Hero Banner',
    desktop_image_path TEXT NOT NULL,
    mobile_image_path TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by TEXT
);

ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Homepage Hero Banner';
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.site_banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.site_banners DROP CONSTRAINT IF EXISTS site_banners_page_key_key;

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Public visitors can ONLY read published banners
DROP POLICY IF EXISTS "Allow public read of published banners" ON public.site_banners;
CREATE POLICY "Allow public read of published banners"
    ON public.site_banners
    FOR SELECT
    USING (is_published = true);

-- Policy: Authorized staff can view all banners (including drafts)
DROP POLICY IF EXISTS "Allow authorized staff read all banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff read all banners"
    ON public.site_banners
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Policy: Authorized staff can insert banners
DROP POLICY IF EXISTS "Allow authorized staff insert banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff insert banners"
    ON public.site_banners
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Policy: Authorized staff can update banners
DROP POLICY IF EXISTS "Allow authorized staff update banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff update banners"
    ON public.site_banners
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy: Authorized staff can delete banners
DROP POLICY IF EXISTS "Allow authorized staff delete banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff delete banners"
    ON public.site_banners
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_site_banners_updated_at ON public.site_banners;
CREATE TRIGGER trigger_site_banners_updated_at
    BEFORE UPDATE ON public.site_banners
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Seed initial record for Homepage banner (uses verified default assets)
INSERT INTO public.site_banners (
    page_key,
    page_path,
    desktop_image_path,
    mobile_image_path,
    is_published,
    updated_by
) VALUES (
    'homepage',
    '/',
    '/hero-desktop.png',
    '/hero-mobile.png',
    true,
    'MJ School Setup'
) ON CONFLICT (page_key) DO NOTHING;

-- ==============================================================================
-- 3. Storage Bucket Configuration: site-banners
-- ==============================================================================

-- Create public storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-banners', 'site-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Public read access to all objects in site-banners bucket
DROP POLICY IF EXISTS "Public can view site-banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public download of site-banners" ON storage.objects;
CREATE POLICY "Public can view site-banners"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'site-banners');

-- Policy: Only verified active school staff can upload banner assets
DROP POLICY IF EXISTS "Authorized staff upload site-banners" ON storage.objects;
CREATE POLICY "Authorized staff upload site-banners"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-banners' AND public.is_admin());

-- Policy: Only verified active school staff can update / replace banner assets
DROP POLICY IF EXISTS "Authorized staff update site-banners" ON storage.objects;
CREATE POLICY "Authorized staff update site-banners"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-banners' AND public.is_admin())
    WITH CHECK (bucket_id = 'site-banners' AND public.is_admin());

-- Policy: Only verified active school staff can delete banner assets
DROP POLICY IF EXISTS "Authorized staff delete site-banners" ON storage.objects;
CREATE POLICY "Authorized staff delete site-banners"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-banners' AND public.is_admin());

-- ==============================================================================
-- 4. Confidential Student Database & Hardened Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gr_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    grade_class TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Alumni', 'Pending Verification')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Students are strictly confidential: ONLY authorized staff can access
DROP POLICY IF EXISTS "Authorized staff select students" ON public.students;
CREATE POLICY "Authorized staff select students"
    ON public.students
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Authorized staff insert students" ON public.students;
CREATE POLICY "Authorized staff insert students"
    ON public.students
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authorized staff update students" ON public.students;
CREATE POLICY "Authorized staff update students"
    ON public.students
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authorized staff delete students" ON public.students;
CREATE POLICY "Authorized staff delete students"
    ON public.students
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 5. Confidential Fee Receipts & Hardened Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.fee_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    gr_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL,
    payment_mode TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Pending Clearance', 'Failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.fee_receipts ENABLE ROW LEVEL SECURITY;

-- Fee receipts are strictly confidential: ONLY authorized staff can access
DROP POLICY IF EXISTS "Authorized staff select fee_receipts" ON public.fee_receipts;
CREATE POLICY "Authorized staff select fee_receipts"
    ON public.fee_receipts
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Authorized staff insert fee_receipts" ON public.fee_receipts;
CREATE POLICY "Authorized staff insert fee_receipts"
    ON public.fee_receipts
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authorized staff update fee_receipts" ON public.fee_receipts;
CREATE POLICY "Authorized staff update fee_receipts"
    ON public.fee_receipts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. Explicit Table & Function Grants (Least Privilege alongside RLS)
-- ==============================================================================

-- Revoke default public/anon privileges on internal authorization functions
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_staff_authorization_status() FROM anon, PUBLIC;

-- Function execution privileges: Authenticated users only
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_authorization_status() TO authenticated;

-- Revoke all table privileges from anon and public by default (Defense-in-depth)
REVOKE ALL ON TABLE public.admin_users FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.students FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.fee_receipts FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.site_banners FROM anon, PUBLIC;

-- site_banners: anon can ONLY read published banners (filtered by RLS)
GRANT SELECT ON TABLE public.site_banners TO anon;

-- Authenticated staff privileges (strictly filtered and enforced by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_banners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.fee_receipts TO authenticated;

-- ==============================================================================
-- 7. Initial Administrator Bootstrap & Synchronization Guide
-- ==============================================================================
-- 1. Ensure existing admin_users row is synchronized with auth.users UUID:
--    UPDATE public.admin_users au
--    SET id = u.id
--    FROM auth.users u
--    WHERE LOWER(au.email) = LOWER(u.email)
--      AND au.id != u.id;
--
-- 2. To bootstrap a new super_admin account:
--    INSERT INTO public.admin_users (id, email, role, is_active)
--    SELECT id, email, 'super_admin', true
--    FROM auth.users
--    WHERE email = 'admin@mjschool.in'
--    ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'super_admin';

-- ==============================================================================
-- 8. Notices and Events Board Table (Single Source of Truth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    is_new BOOLEAN NOT NULL DEFAULT TRUE,
    grades TEXT[] NOT NULL DEFAULT ARRAY['All Grades']::TEXT[],
    description TEXT NOT NULL DEFAULT '',
    has_attachment BOOLEAN NOT NULL DEFAULT FALSE,
    attachment_url TEXT,
    file_size TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_notices_published_order 
ON public.notices (is_published, display_order ASC, created_at DESC);

GRANT SELECT ON TABLE public.notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices TO authenticated;

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of published notices" ON public.notices;
CREATE POLICY "Allow public read of published notices"
    ON public.notices
    FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Allow authorized staff read all notices" ON public.notices;
CREATE POLICY "Allow authorized staff read all notices"
    ON public.notices
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff insert notices" ON public.notices;
CREATE POLICY "Allow authorized staff insert notices"
    ON public.notices
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff update notices" ON public.notices;
CREATE POLICY "Allow authorized staff update notices"
    ON public.notices
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff delete notices" ON public.notices;
CREATE POLICY "Allow authorized staff delete notices"
    ON public.notices
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 9. Facilities Gallery Table & Hardened Policies
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.facility_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

ALTER TABLE public.facility_images ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

GRANT SELECT ON TABLE public.facility_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.facility_images TO authenticated;

ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of facility_images" ON public.facility_images;
CREATE POLICY "Allow public read of facility_images"
    ON public.facility_images
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow authorized staff read all facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff read all facility_images"
    ON public.facility_images
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff insert facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff insert facility_images"
    ON public.facility_images
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff update facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff update facility_images"
    ON public.facility_images
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff delete facility_images" ON public.facility_images;
CREATE POLICY "Allow authorized staff delete facility_images"
    ON public.facility_images
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

INSERT INTO public.facility_images (facility_key, title, image_url, display_order)
VALUES
    ('classrooms', 'Classrooms & Learning Spaces', NULL, 0),
    ('hygiene', 'Cleanliness & Hygiene', NULL, 1),
    ('play-swimming', 'Early Years Play & Swimming', NULL, 2),
    ('traditions', 'Indian Values & Traditions', NULL, 3)
ON CONFLICT (facility_key) DO NOTHING;




