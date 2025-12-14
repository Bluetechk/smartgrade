-- Add department_id column to assessment_types table (if it doesn't already exist)
ALTER TABLE public.assessment_types ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE;

-- Create index for faster queries (if it doesn't already exist)
CREATE INDEX IF NOT EXISTS idx_assessment_types_department_id ON public.assessment_types(department_id);
