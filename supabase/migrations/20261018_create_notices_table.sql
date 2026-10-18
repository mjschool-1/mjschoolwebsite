-- ==============================================================================
-- Migration: Create and Configure Notices & Circulars Table with RLS
-- File: supabase/migrations/20261018_create_notices_table.sql
-- Goal: Dedicated, single-source-of-truth table for MJ School notices and events
-- ==============================================================================

-- 1. Create public.notices table if it does not already exist
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

-- 2. Add columns if migrating from any partial schema
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Notice Announcement';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS date TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'Mon DD, YYYY');
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS grades TEXT[] NOT NULL DEFAULT ARRAY['All Grades']::TEXT[];
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS has_attachment BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- 3. Performance index for active notices ordered by display_order & creation
CREATE INDEX IF NOT EXISTS idx_notices_published_order 
ON public.notices (is_published, display_order ASC, created_at DESC);

-- 4. Ensure admin authorization check helper exists
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

-- 5. Grant PostgreSQL table privileges
GRANT SELECT ON TABLE public.notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices TO authenticated;

-- 6. Row Level Security policies
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

-- 7. Remove dummy demo notice records if any were created during previous testing
DELETE FROM public.notices 
WHERE title IN (
    'Schedule for Term I Practical & Assessment Evaluation',
    'Advisory on Monsoon Precautionary School Bus Commute',
    'Inter-School Science Olympiad 2025: List of Selected Candidates',
    'Circular: Revised Winter Uniform Guidelines effective November 1st',
    'Annual Sports Day 2025 Selection Trials & Schedule',
    'Foundational Literacy & Phonics Workshop for Parents',
    'Robotics & AI Innovation Expo - Call for Student Projects',
    'Primary Wing Inter-House Art & Handwriting Competition'
);

-- 8. Seed the three authentic school notices if not already present
INSERT INTO public.notices (
    title,
    date,
    category,
    is_new,
    grades,
    description,
    has_attachment,
    file_size,
    is_published,
    display_order,
    updated_by
)
SELECT
    'Admission Schedule & Verification Guidelines for Session 2025-26',
    'Oct 04, 2025',
    'Admissions',
    true,
    ARRAY['All Grades']::TEXT[],
    'Detailed instructions regarding document submission, verification timeline, and registration confirmation for all prospective students for the upcoming academic session 2025-26.',
    true,
    '340 KB',
    true,
    1,
    'System Migration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.notices WHERE title = 'Admission Schedule & Verification Guidelines for Session 2025-26'
);

INSERT INTO public.notices (
    title,
    date,
    category,
    is_new,
    grades,
    description,
    has_attachment,
    file_size,
    is_published,
    display_order,
    updated_by
)
SELECT
    'Kindergarten Rhyme & Storytelling Celebration 2025',
    'Oct 01, 2025',
    'Events',
    true,
    ARRAY['Jr. KG', 'Sr. KG']::TEXT[],
    'An interactive stage event celebrating early speech, recitation, and dramatic storytelling for pre-primary scholars. Parents are cordially invited to attend the morning assembly.',
    true,
    '180 KB',
    true,
    2,
    'System Migration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.notices WHERE title = 'Kindergarten Rhyme & Storytelling Celebration 2025'
);

INSERT INTO public.notices (
    title,
    date,
    category,
    is_new,
    grades,
    description,
    has_attachment,
    file_size,
    is_published,
    display_order,
    updated_by
)
SELECT
    'Datesheet for Half-Yearly Examinations - Grade VI to XII',
    'Sep 28, 2025',
    'Exams',
    true,
    ARRAY['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']::TEXT[],
    'Official schedule for the Term-I / Half-Yearly theoretical and practical examinations. Students are advised to review reporting times and syllabus portions with respective subject teachers.',
    true,
    '512 KB',
    true,
    3,
    'System Migration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.notices WHERE title = 'Datesheet for Half-Yearly Examinations - Grade VI to XII'
);
