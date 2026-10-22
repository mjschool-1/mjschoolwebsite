-- ==============================================================================
-- MJ School, Shahapur — Rename 'Science' to 'Science & Technology' and Add Marathi
-- Migration File: supabase/migrations/20261022_rename_science_to_science_and_technology_and_add_marathi.sql
-- Goal: 
--   1. Migrate existing staff records from 'Science' to 'Science & Technology'.
--   2. Ensure deduplication so no duplicate department entries occur.
--   3. Synchronize both departments TEXT[] and legacy department TEXT columns.
--   4. Preserve all primary keys, photographs, names, qualifications, and other fields.
-- ==============================================================================

-- 1. Ensure departments TEXT[] column exists (idempotent check)
ALTER TABLE public.faculty_staff 
ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

-- 2. Update departments array: replace 'Science' with 'Science & Technology'
UPDATE public.faculty_staff
SET departments = ARRAY(
    SELECT DISTINCT CASE 
        WHEN elem = 'Science' THEN 'Science & Technology' 
        ELSE elem 
    END
    FROM unnest(departments) AS elem
)
WHERE 'Science' = ANY(departments);

-- 3. Synchronize legacy single department column with updated array
UPDATE public.faculty_staff
SET department = array_to_string(departments, ' · ')
WHERE departments IS NOT NULL AND array_length(departments, 1) > 0;

-- 4. Fallback update for any record where 'Science' was only in the legacy text column
UPDATE public.faculty_staff
SET department = REGEXP_REPLACE(department, '\yScience\y', 'Science & Technology', 'g'),
    departments = ARRAY(
        SELECT DISTINCT CASE 
            WHEN elem = 'Science' THEN 'Science & Technology' 
            ELSE elem 
        END
        FROM unnest(CASE 
            WHEN department LIKE '% · %' THEN string_to_array(department, ' · ')
            ELSE ARRAY[TRIM(department)]
        END) AS elem
    )
WHERE department LIKE '%Science%' 
  AND department NOT LIKE '%Science & Technology%';
