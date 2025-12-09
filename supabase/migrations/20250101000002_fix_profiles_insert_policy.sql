-- Drop existing INSERT policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create INSERT policy that allows users to insert their own profile
-- This allows users to create their profile during signup
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND id = auth.uid());

-- Allow users to assign themselves the teacher role during signup
-- This is needed for staff signup flow
CREATE POLICY "Users can assign themselves teacher role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'teacher'
);

