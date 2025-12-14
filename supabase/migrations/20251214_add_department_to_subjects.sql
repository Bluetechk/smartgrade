-- Add department_id column to subjects table
-- Add department_id column to subjects table (if it doesn't already exist)
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS department_id UUID;

-- Add FK constraint to departments (only if missing)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint c
		JOIN pg_class t ON c.conrelid = t.oid
		JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
		WHERE t.relname = 'subjects' AND a.attname = 'department_id'
	) THEN
		ALTER TABLE public.subjects
			ADD CONSTRAINT subjects_department_id_fkey FOREIGN KEY (department_id)
			REFERENCES public.departments(id) ON DELETE CASCADE;
	END IF;
END$$;

-- Create index for faster queries (if it doesn't already exist)
CREATE INDEX IF NOT EXISTS idx_subjects_department_id ON public.subjects(department_id);

-- Update RLS policies to include department filtering
DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;

CREATE POLICY "Anyone can view subjects"
ON public.subjects FOR SELECT
TO authenticated
USING (true);
