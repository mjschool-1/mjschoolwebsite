-- ==============================================================================
-- Migration: Add display_order Column to facility_images Table
-- File: supabase/migrations/20261019_add_facility_display_order.sql
-- Goal: Support custom reordering of the four facilities cards on /facilities/
-- ==============================================================================

-- 1. Safely add display_order column if not present
ALTER TABLE public.facility_images 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- 2. Populate default sequential display_order for initial 4 facility cards
UPDATE public.facility_images SET display_order = 0 WHERE facility_key = 'classrooms';
UPDATE public.facility_images SET display_order = 1 WHERE facility_key = 'hygiene';
UPDATE public.facility_images SET display_order = 2 WHERE facility_key = 'play-swimming';
UPDATE public.facility_images SET display_order = 3 WHERE facility_key = 'traditions';
