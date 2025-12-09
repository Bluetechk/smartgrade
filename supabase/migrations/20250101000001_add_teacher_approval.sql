-- Add teacher approval status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update existing teachers to be approved by default (optional - you may want to review them)
UPDATE public.profiles 
SET is_approved = true 
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.user_roles 
  WHERE role = 'teacher'
);

-- Create index for faster queries on is_approved column
CREATE INDEX IF NOT EXISTS idx_profiles_is_approved 
ON public.profiles(is_approved) 
WHERE is_approved = false;

