-- ==============================================================================
-- MJ School, Shahapur — Faculty & Staff Multi-Department Migration
-- Migration File: supabase/migrations/20261022_add_departments_array_to_faculty_staff.sql
-- Goal: Add PostgreSQL TEXT[] support for multiple departments per staff member,
--       migrate existing single department records into 1-element arrays,
--       and maintain complete backward compatibility and RLS policies.
-- ==============================================================================

-- 1. Add departments TEXT[] column if it does not already exist
ALTER TABLE public.faculty_staff 
ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

-- 2. Populate departments from existing department text column
-- Converts existing department values into TEXT[] without losing any data.
-- If the text already has dot-separated departments, splits them cleanly.
UPDATE public.faculty_staff
SET departments = CASE
    WHEN department LIKE '% · %' THEN string_to_array(department, ' · ')
    WHEN department IS NOT NULL AND TRIM(department) <> '' THEN ARRAY[TRIM(department)]
    ELSE '{}'::TEXT[]
END
WHERE (departments IS NULL OR departments = '{}')
  AND department IS NOT NULL;

-- 3. Make legacy single 'department' column nullable so inserts without it succeed
ALTER TABLE public.faculty_staff 
ALTER COLUMN department DROP NOT NULL;

-- 4. Create GIN index for high-performance multi-department filtering
CREATE INDEX IF NOT EXISTS idx_faculty_staff_departments_gin 
ON public.faculty_staff USING GIN (departments);

-- 5. Create or replace a trigger function to keep legacy department column in sync
CREATE OR REPLACE FUNCTION public.sync_faculty_staff_department_compat()
RETURNS TRIGGER AS $$
BEGIN
    -- If departments array is provided, sync legacy department column
    IF NEW.departments IS NOT NULL AND array_length(NEW.departments, 1) > 0 THEN
        IF NEW.department IS NULL OR NEW.department = '' THEN
            NEW.department := array_to_string(NEW.departments, ' · ');
        END IF;
    -- If only legacy department is provided, sync departments array
    ELSIF NEW.department IS NOT NULL AND TRIM(NEW.department) <> '' THEN
        IF NEW.departments IS NULL OR NEW.departments = '{}' THEN
            NEW.departments := ARRAY[TRIM(NEW.department)];
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_faculty_staff_department ON public.faculty_staff;
CREATE TRIGGER trg_sync_faculty_staff_department
BEFORE INSERT OR UPDATE ON public.faculty_staff
FOR EACH ROW
EXECUTE FUNCTION public.sync_faculty_staff_department_compat();
