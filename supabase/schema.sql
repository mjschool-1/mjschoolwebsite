-- ==============================================================================
-- MJ School, Shahapur — Supabase Database & Storage Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Create site_banners table
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

-- Enable Row Level Security (RLS) on site_banners
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (including unauthenticated public visitors) can read published banners
DROP POLICY IF EXISTS "Allow public read of published banners" ON public.site_banners;
CREATE POLICY "Allow public read of published banners"
    ON public.site_banners
    FOR SELECT
    USING (is_published = true);

-- Policy: Only authenticated staff can view all banners (including drafts), insert, update, or delete
DROP POLICY IF EXISTS "Allow staff full access to site_banners" ON public.site_banners;
CREATE POLICY "Allow staff full access to site_banners"
    ON public.site_banners
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

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
-- 2. Storage Bucket Configuration: site-banners
-- ==============================================================================

-- Create public storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-banners', 'site-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Public read access to all objects in site-banners bucket
DROP POLICY IF EXISTS "Public can view site-banners" ON storage.objects;
CREATE POLICY "Public can view site-banners"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'site-banners');

-- Policy: Authenticated staff can upload banner assets
DROP POLICY IF EXISTS "Staff can upload site-banners" ON storage.objects;
CREATE POLICY "Staff can upload site-banners"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'site-banners');

-- Policy: Authenticated staff can update / replace banner assets
DROP POLICY IF EXISTS "Staff can update site-banners" ON storage.objects;
CREATE POLICY "Staff can update site-banners"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'site-banners');

-- Policy: Authenticated staff can delete banner assets
DROP POLICY IF EXISTS "Staff can delete site-banners" ON storage.objects;
CREATE POLICY "Staff can delete site-banners"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'site-banners');


-- ==============================================================================
-- 3. Preparation for Student Database & Fee Receipts (Future Modules)
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

-- Students are strictly confidential: ONLY authenticated staff can access
CREATE POLICY "Staff only access to students"
    ON public.students
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

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

-- Fee receipts are strictly confidential: ONLY authenticated staff can access
CREATE POLICY "Staff only access to fee receipts"
    ON public.fee_receipts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
