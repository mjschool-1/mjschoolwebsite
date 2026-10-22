-- ==============================================================================
-- MJ School, Shahapur — Faculty & Staff Directory Migration
-- File: supabase/migrations/20261022_create_faculty_staff_table.sql
-- Goal: Create persistent public.faculty_staff table with RLS and seed initial 10 records.
-- ==============================================================================

-- 1. Create public.faculty_staff table
CREATE TABLE IF NOT EXISTS public.faculty_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    qualification TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add columns if migrating from partial schema
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS department TEXT NOT NULL;
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS qualification TEXT NOT NULL DEFAULT '';
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.faculty_staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Performance index on display_order
CREATE INDEX IF NOT EXISTS idx_faculty_staff_display_order 
ON public.faculty_staff (display_order ASC);

-- 4. PostgreSQL Grants (Layer 1 Security)
GRANT SELECT ON TABLE public.faculty_staff TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.faculty_staff TO authenticated;

-- 5. Helper function is_admin() (re-verify or create safely)
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

-- 6. Row Level Security (Layer 2 Security)
ALTER TABLE public.faculty_staff ENABLE ROW LEVEL SECURITY;

-- Policy: Public visitors can view all faculty & staff records
DROP POLICY IF EXISTS "Allow public read of faculty_staff" ON public.faculty_staff;
CREATE POLICY "Allow public read of faculty_staff"
    ON public.faculty_staff
    FOR SELECT
    USING (true);

-- Policy: Authorized staff can insert new faculty & staff records
DROP POLICY IF EXISTS "Allow authorized staff insert faculty_staff" ON public.faculty_staff;
CREATE POLICY "Allow authorized staff insert faculty_staff"
    ON public.faculty_staff
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Policy: Authorized staff can update faculty & staff records
DROP POLICY IF EXISTS "Allow authorized staff update faculty_staff" ON public.faculty_staff;
CREATE POLICY "Allow authorized staff update faculty_staff"
    ON public.faculty_staff
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy: Authorized staff can delete faculty & staff records
DROP POLICY IF EXISTS "Allow authorized staff delete faculty_staff" ON public.faculty_staff;
CREATE POLICY "Allow authorized staff delete faculty_staff"
    ON public.faculty_staff
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 7. Seed initial 10 directory placeholder records if table is currently empty
INSERT INTO public.faculty_staff (id, name, department, qualification, image_url, display_order)
SELECT 
    seed.id, seed.name, seed.department, seed.qualification, seed.image_url, seed.display_order
FROM (
    VALUES
        ('11111111-0001-4000-8000-000000000001'::uuid, 'Staff Member 01', 'Headmistress', 'Qualification to be added', NULL::text, 0),
        ('11111111-0002-4000-8000-000000000002'::uuid, 'Staff Member 02', 'English', 'Qualification to be added', NULL::text, 1),
        ('11111111-0003-4000-8000-000000000003'::uuid, 'Staff Member 03', 'Mathematics', 'Qualification to be added', NULL::text, 2),
        ('11111111-0004-4000-8000-000000000004'::uuid, 'Staff Member 04', 'Science & Technology', 'Qualification to be added', NULL::text, 3),
        ('11111111-0005-4000-8000-000000000005'::uuid, 'Staff Member 05', 'Social Studies', 'Qualification to be added', NULL::text, 4),
        ('11111111-0006-4000-8000-000000000006'::uuid, 'Staff Member 06', 'General Knowledge', 'Qualification to be added', NULL::text, 5),
        ('11111111-0007-4000-8000-000000000007'::uuid, 'Staff Member 07', 'Hindi', 'Qualification to be added', NULL::text, 6),
        ('11111111-0008-4000-8000-000000000008'::uuid, 'Staff Member 08', 'Nursery', 'Qualification to be added', NULL::text, 7),
        ('11111111-0009-4000-8000-000000000009'::uuid, 'Staff Member 09', 'Marathi', 'Qualification to be added', NULL::text, 8),
        ('11111111-0010-4000-8000-000000000010'::uuid, 'Staff Member 10', 'Peon', 'Qualification to be added', NULL::text, 9)
) AS seed(id, name, department, qualification, image_url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faculty_staff LIMIT 1)
ON CONFLICT (id) DO NOTHING;
