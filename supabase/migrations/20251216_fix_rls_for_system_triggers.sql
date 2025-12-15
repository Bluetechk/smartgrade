-- Fix RLS policies to allow system triggers (auth.uid() IS NULL) to insert/update period and yearly totals
-- Without this, the trigger function's INSERT/UPDATE fails silently due to RLS

DROP POLICY IF EXISTS "Admins can manage period totals" ON public.student_period_totals;
CREATE POLICY "Admins can manage period totals"
ON public.student_period_totals FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL
);

DROP POLICY IF EXISTS "Admins can manage yearly totals" ON public.student_yearly_totals;
CREATE POLICY "Admins can manage yearly totals"
ON public.student_yearly_totals FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL
);
