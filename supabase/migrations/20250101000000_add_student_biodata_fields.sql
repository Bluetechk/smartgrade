-- Add comprehensive biodata fields to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS parent_number TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS tribe TEXT,
ADD COLUMN IF NOT EXISTS place_of_residence TEXT,
ADD COLUMN IF NOT EXISTS disability TEXT;

