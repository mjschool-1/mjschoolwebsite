-- ==============================================================================
-- Migration: Minimal Fix for Banner Uploads & Saves (site_banners)
-- File: supabase/migrations/20261018_fix_banner_table_permissions.sql
-- Goal: Fix "permission denied for table site_banners" without altering unrelated tables
-- ==============================================================================

-- 1. Ensure helper function public.is_admin() has security definer, clean search path,
--    and email fallback so admin authorization succeeds even if UUID sync is pending.
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

-- 2. Grant function execution to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 3. Grant table privileges on public.site_banners
-- In PostgreSQL, grants (Layer 1) are required before RLS (Layer 2) is evaluated.
GRANT SELECT ON TABLE public.site_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_banners TO authenticated;

-- 4. Ensure Row Level Security is active on site_banners
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- 5. Standardized RLS policies for site_banners
DROP POLICY IF EXISTS "Allow public read of published banners" ON public.site_banners;
CREATE POLICY "Allow public read of published banners"
    ON public.site_banners
    FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Allow authorized staff read all banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff read all banners"
    ON public.site_banners
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff insert banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff insert banners"
    ON public.site_banners
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff update banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff update banners"
    ON public.site_banners
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized staff delete banners" ON public.site_banners;
CREATE POLICY "Allow authorized staff delete banners"
    ON public.site_banners
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
