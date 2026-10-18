-- ==============================================================================
-- MJ School, Shahapur — Security Hardening Migration
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor)
-- Safe for brand-new or existing Supabase projects.
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

-- Helper function to check admin status with SECURITY DEFINER
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

-- RLS: Authenticated user can check their own active admin authorization
DROP POLICY IF EXISTS "Users can check their own admin status" ON public.admin_users;
CREATE POLICY "Users can check their own admin status"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id AND is_active = true);

-- RLS: Only super_admin accounts can insert, update, or remove administrative roles
DROP POLICY IF EXISTS "Super admins manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins manage admin_users"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
          AND role = 'super_admin'
          AND is_active = true
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
          AND role = 'super_admin'
          AND is_active = true
      )
    );

-- ==============================================================================
-- 2. site_banners Table & Hardened Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT UNIQUE NOT NULL,
    page_path TEXT NOT NULL,
    desktop_image_path TEXT NOT NULL,
    mobile_image_path TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by TEXT
);

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Remove old open authenticated policy if present from previous iterations
DROP POLICY IF EXISTS "Allow staff full access to site_banners" ON public.site_banners;

-- Public can read ONLY published banners
DROP POLICY IF EXISTS "Allow public read of published banners" ON public.site_banners;
CREATE POLICY "Allow public read of published banners"
    ON public.site_banners
    FOR SELECT
    USING (is_published = true);

-- Only authorized staff can view draft/unpublished banners
DROP POLICY IF EXISTS "Allow authorized staff read all banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff read all banners"
    ON public.site_banners
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only authorized staff can insert banner records
DROP POLICY IF EXISTS "Allow authorized staff insert banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff insert banners"
    ON public.site_banners
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Only authorized staff can update banner records
DROP POLICY IF EXISTS "Allow authorized staff update banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff update banners"
    ON public.site_banners
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only authorized staff can delete banner records
DROP POLICY IF EXISTS "Allow authorized staff delete banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff delete banners"
    ON public.site_banners
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Remove old open authenticated storage policies if present
DROP POLICY IF EXISTS "Staff can upload site-banners" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update site-banners" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete site-banners" ON storage.objects;

-- Ensure public view is maintained for website display
DROP POLICY IF EXISTS "Public can view site-banners" ON storage.objects;
CREATE POLICY "Public can view site-banners"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'site-banners');

-- Only verified active school staff can upload banner assets
DROP POLICY IF EXISTS "Authorized staff upload site-banners" ON storage.objects;
CREATE POLICY "Authorized staff upload site-banners"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-banners' AND public.is_admin());

-- Only verified active school staff can update banner assets
DROP POLICY IF EXISTS "Authorized staff update site-banners" ON storage.objects;
CREATE POLICY "Authorized staff update site-banners"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-banners' AND public.is_admin())
    WITH CHECK (bucket_id = 'site-banners' AND public.is_admin());

-- Only verified active school staff can delete banner assets
DROP POLICY IF EXISTS "Authorized staff delete site-banners" ON storage.objects;
CREATE POLICY "Authorized staff delete site-banners"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-banners' AND public.is_admin());

-- ==============================================================================
-- 4. Harden students Table Policies (Strictly Confidential)
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

-- Remove old open policy if present
DROP POLICY IF EXISTS "Staff only access to students" ON public.students;

-- Authorized staff only: SELECT
DROP POLICY IF EXISTS "Authorized staff select students" ON public.students;
CREATE POLICY "Authorized staff select students"
    ON public.students
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Authorized staff only: INSERT
DROP POLICY IF EXISTS "Authorized staff insert students" ON public.students;
CREATE POLICY "Authorized staff insert students"
    ON public.students
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Authorized staff only: UPDATE
DROP POLICY IF EXISTS "Authorized staff update students" ON public.students;
CREATE POLICY "Authorized staff update students"
    ON public.students
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Authorized staff only: DELETE
DROP POLICY IF EXISTS "Authorized staff delete students" ON public.students;
CREATE POLICY "Authorized staff delete students"
    ON public.students
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 5. Harden fee_receipts Table Policies (Strictly Confidential)
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

-- Remove old open policy if present
DROP POLICY IF EXISTS "Staff only access to fee receipts" ON public.fee_receipts;

-- Authorized staff only: SELECT
DROP POLICY IF EXISTS "Authorized staff select fee_receipts" ON public.fee_receipts;
CREATE POLICY "Authorized staff select fee_receipts"
    ON public.fee_receipts
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Authorized staff only: INSERT
DROP POLICY IF EXISTS "Authorized staff insert fee_receipts" ON public.fee_receipts;
CREATE POLICY "Authorized staff insert fee_receipts"
    ON public.fee_receipts
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Authorized staff only: UPDATE
DROP POLICY IF EXISTS "Authorized staff update fee_receipts" ON public.fee_receipts;
CREATE POLICY "Authorized staff update fee_receipts"
    ON public.fee_receipts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. Initial Administrator Bootstrap Guide
-- ==============================================================================
-- To authorize the first administrator account:
-- 1. Create the user in Supabase Dashboard -> Authentication -> Users.
-- 2. Execute the following in SQL Editor, replacing 'admin@mjschool.in' with that user's email:
--
--    INSERT INTO public.admin_users (id, email, role, is_active)
--    SELECT id, email, 'super_admin', true
--    FROM auth.users
--    WHERE email = 'admin@mjschool.in'
--    ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'super_admin';
