-- SmartGrade Database Schema - All Migrations Combined
-- Execute this in Supabase SQL Editor to create all tables and functions

-- Create enum types (if not already exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.department_type AS ENUM ('elementary', 'junior_high', 'senior_high');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.period_type AS ENUM ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'exam_s1', 'exam_s2', 'semester1', 'semester2', 'yearly');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Academic years
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_name TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name, academic_year_id)
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Assessment types with weights
CREATE TABLE IF NOT EXISTS public.assessment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    max_points INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_types ENABLE ROW LEVEL SECURITY;

-- Insert default assessment types (if not already exists)
INSERT INTO public.assessment_types (name, max_points, display_order) VALUES
('Attendance', 5, 1),
('Participation', 5, 2),
('Project', 10, 3),
('Assignment', 10, 4),
('Quiz', 20, 5),
('Test', 50, 6)
ON CONFLICT DO NOTHING;

-- Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    student_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id),
    date_of_birth DATE,
    photo_url TEXT,
    phone_number text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Class subjects (linking classes to subjects)
CREATE TABLE IF NOT EXISTS public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id),
    period_number INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (class_id, subject_id, period_number)
);

ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

-- Student grades
CREATE TABLE IF NOT EXISTS public.student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_subject_id UUID NOT NULL REFERENCES public.class_subjects(id) ON DELETE CASCADE,
    period period_type NOT NULL,
    assessment_type_id UUID NOT NULL REFERENCES public.assessment_types(id),
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(5,2) NOT NULL,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_subject_id, period, assessment_type_id)
);

ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;

-- Student period totals (calculated totals per period)
CREATE TABLE IF NOT EXISTS public.student_period_totals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_subject_id UUID NOT NULL REFERENCES public.class_subjects(id) ON DELETE CASCADE,
    period period_type NOT NULL,
    total_score NUMERIC(6,2) NOT NULL DEFAULT 0,
    class_rank INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_subject_id, period)
);

ALTER TABLE public.student_period_totals ENABLE ROW LEVEL SECURITY;

-- Student yearly totals
CREATE TABLE IF NOT EXISTS public.student_yearly_totals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_subject_id UUID NOT NULL REFERENCES public.class_subjects(id) ON DELETE CASCADE,
    semester1_avg NUMERIC(6,2),
    semester2_avg NUMERIC(6,2),
    yearly_avg NUMERIC(6,2),
    class_rank INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_subject_id)
);

ALTER TABLE public.student_yearly_totals ENABLE ROW LEVEL SECURITY;

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Insert default passing threshold (if not already exists)
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('passing_threshold', '50', 'Minimum percentage required to pass')
ON CONFLICT DO NOTHING;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_student_grades_updated_at ON public.student_grades;
CREATE TRIGGER update_student_grades_updated_at BEFORE UPDATE ON public.student_grades
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_student_period_totals_updated_at ON public.student_period_totals;
CREATE TRIGGER update_student_period_totals_updated_at BEFORE UPDATE ON public.student_period_totals
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_student_yearly_totals_updated_at ON public.student_yearly_totals;
CREATE TRIGGER update_student_yearly_totals_updated_at BEFORE UPDATE ON public.student_yearly_totals
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate and update period totals with ranks
CREATE OR REPLACE FUNCTION calculate_period_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id UUID;
  v_period TEXT;
  v_class_subject_id UUID;
  v_class_id UUID;
  v_total_score NUMERIC;
  v_rank INTEGER;
BEGIN
  -- Get the affected student_id and period
  IF TG_OP = 'DELETE' THEN
    v_student_id := OLD.student_id;
    v_period := OLD.period;
    v_class_subject_id := OLD.class_subject_id;
  ELSE
    v_student_id := NEW.student_id;
    v_period := NEW.period;
    v_class_subject_id := NEW.class_subject_id;
  END IF;

  -- Get the class_id for this student
  SELECT class_id INTO v_class_id
  FROM students
  WHERE id = v_student_id;

  -- Calculate total score for this student in this period and class_subject
  SELECT COALESCE(SUM(score), 0) INTO v_total_score
  FROM student_grades
  WHERE student_id = v_student_id
    AND period = v_period
    AND class_subject_id = v_class_subject_id;

  -- Insert or update the period total
  INSERT INTO student_period_totals (student_id, class_subject_id, period, total_score)
  VALUES (v_student_id, v_class_subject_id, v_period, v_total_score)
  ON CONFLICT (student_id, class_subject_id, period)
  DO UPDATE SET 
    total_score = EXCLUDED.total_score,
    updated_at = now();

  -- Calculate ranks for all students in this class, period, and subject
  WITH ranked_students AS (
    SELECT 
      spt.id,
      RANK() OVER (ORDER BY spt.total_score DESC) as new_rank
    FROM student_period_totals spt
    JOIN students s ON s.id = spt.student_id
    WHERE s.class_id = v_class_id
      AND spt.period = v_period
      AND spt.class_subject_id = v_class_subject_id
  )
  UPDATE student_period_totals spt
  SET class_rank = rs.new_rank
  FROM ranked_students rs
  WHERE spt.id = rs.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on student_grades
DROP TRIGGER IF EXISTS trigger_calculate_period_totals ON student_grades;
CREATE TRIGGER trigger_calculate_period_totals
AFTER INSERT OR UPDATE OR DELETE ON student_grades
FOR EACH ROW
EXECUTE FUNCTION calculate_period_totals();

-- RLS Policies

-- user_roles: Admins can manage roles, first admin bootstrap allowed
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow first admin assignment" ON public.user_roles;
CREATE POLICY "Allow first admin assignment"
ON public.user_roles FOR INSERT
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- profiles: Users can view their own, admins view all
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- academic_years: Everyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view academic years" ON public.academic_years;
CREATE POLICY "Anyone can view academic years"
ON public.academic_years FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage academic years" ON public.academic_years;
CREATE POLICY "Admins can manage academic years"
ON public.academic_years FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- departments: Everyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
CREATE POLICY "Anyone can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- classes: Everyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view classes" ON public.classes;
CREATE POLICY "Anyone can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes"
ON public.classes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- subjects: Everyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;
CREATE POLICY "Anyone can view subjects"
ON public.subjects FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects"
ON public.subjects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- assessment_types: Everyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view assessment types" ON public.assessment_types;
CREATE POLICY "Anyone can view assessment types"
ON public.assessment_types FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage assessment types" ON public.assessment_types;
CREATE POLICY "Admins can manage assessment types"
ON public.assessment_types FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- students: Role-based access
DROP POLICY IF EXISTS "Authenticated students can view their own record" ON public.students;
CREATE POLICY "Authenticated students can view their own record"
ON public.students FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;
CREATE POLICY "Teachers can view students in their classes"
ON public.students FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
CREATE POLICY "Admins can view all students"
ON public.students FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students"
ON public.students FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- class_subjects: Admins and teachers can manage
DROP POLICY IF EXISTS "Anyone can view class subjects" ON public.class_subjects;
CREATE POLICY "Anyone can view class subjects"
ON public.class_subjects FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins and teachers can manage class subjects" ON public.class_subjects;
CREATE POLICY "Admins and teachers can manage class subjects"
ON public.class_subjects FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- student_grades: Role-based access
DROP POLICY IF EXISTS "Students can view their own grades" ON public.student_grades;
CREATE POLICY "Students can view their own grades"
ON public.student_grades FOR SELECT
TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Teachers can view grades for their students" ON public.student_grades;
CREATE POLICY "Teachers can view grades for their students"
ON public.student_grades FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND
  class_subject_id IN (
    SELECT cs.id 
    FROM public.class_subjects cs
    JOIN public.classes c ON cs.class_id = c.id
    WHERE c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can view all grades" ON public.student_grades;
CREATE POLICY "Admins can view all grades"
ON public.student_grades FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins and teachers can manage grades" ON public.student_grades;
CREATE POLICY "Admins and teachers can manage grades"
ON public.student_grades FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- student_period_totals: Everyone can read, system manages
DROP POLICY IF EXISTS "Anyone can view period totals" ON public.student_period_totals;
CREATE POLICY "Anyone can view period totals"
ON public.student_period_totals FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage period totals" ON public.student_period_totals;
CREATE POLICY "Admins can manage period totals"
ON public.student_period_totals FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- student_yearly_totals: Everyone can read, system manages
DROP POLICY IF EXISTS "Anyone can view yearly totals" ON public.student_yearly_totals;
CREATE POLICY "Anyone can view yearly totals"
ON public.student_yearly_totals FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage yearly totals" ON public.student_yearly_totals;
CREATE POLICY "Admins can manage yearly totals"
ON public.student_yearly_totals FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- system_settings: Everyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view settings" ON public.system_settings;
CREATE POLICY "Anyone can view settings"
ON public.system_settings FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.system_settings;
CREATE POLICY "Admins can manage settings"
ON public.system_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload student photos
DROP POLICY IF EXISTS "Admins can upload student photos" ON storage.objects;
CREATE POLICY "Admins can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-photos' 
  AND has_role(auth.uid(), 'admin')
);

-- Allow public read access to student photos
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

-- Allow admins to update student photos
DROP POLICY IF EXISTS "Admins can update student photos" ON storage.objects;
CREATE POLICY "Admins can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos' AND has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'student-photos' AND has_role(auth.uid(), 'admin'));

-- Allow admins to delete student photos
DROP POLICY IF EXISTS "Admins can delete student photos" ON storage.objects;
CREATE POLICY "Admins can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-photos' AND has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_types_department_id ON public.assessment_types(department_id);

-- MIGRATION COMPLETE
-- Next steps:
-- 1. Create an admin user via Auth
-- 2. Insert a profile for that user in the profiles table
-- 3. Manually insert their user_id and 'admin' role in user_roles table
-- 4. Start managing departments, classes, subjects, and students through the app
