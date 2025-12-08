# Error 406 - Solution Summary

## What Happened
You're seeing 406 errors when the app tries to fetch academic years data:
```
Failed to load resource: the server responded with a status of 406
buqwtrshkmjpueofcfac.supabase.co/rest/v1/academic_years?select=*&is_current=eq.true:1
```

## Root Cause
The database tables (academic_years, classes, students, etc.) **have not been created yet**. 

The migrations file was created (`MIGRATION_COMBINED.sql`) but the SQL statements were never executed in your Supabase database.

## Solution Required

### ⚠️ CRITICAL: Execute the Database Migrations

Before the app can work, you MUST run the migrations:

1. **Go to Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**: smartgrade
3. **Open SQL Editor**: Click "SQL Editor" in sidebar → "New Query"
4. **Copy all SQL** from: `MIGRATION_COMBINED.sql` in your project folder
5. **Paste into Supabase SQL Editor**
6. **Click RUN** (or Ctrl+Enter)
7. **Wait for completion** - You should see "Query executed successfully"

### ✅ After Migrations Complete

You also need to set up initial data:

```sql
-- 1. Create an academic year (REQUIRED for dashboard)
INSERT INTO public.academic_years (year_name, start_date, end_date, is_current)
VALUES ('2024/2025', '2024-09-01', '2025-08-31', true);

-- 2. Create a department
INSERT INTO public.departments (name, description)
VALUES ('Secondary School', 'High school students');

-- 3. Get the IDs (run these queries):
SELECT id FROM public.academic_years LIMIT 1;  -- copy this ID
SELECT id FROM public.departments LIMIT 1;     -- copy this ID

-- 4. Create a class (replace UUIDs with values from step 3)
INSERT INTO public.classes (name, department_id, academic_year_id, created_at)
VALUES ('Grade 10-A', '[DEPARTMENT_ID]', '[ACADEMIC_YEAR_ID]', NOW());

-- 5. Make your user an admin
-- Get your user ID from: Authentication → Users → click your user
-- Then run (replace with your actual UUID):
INSERT INTO public.user_roles (user_id, role)
VALUES ('[YOUR_USER_UUID]', 'admin'::app_role);

-- 6. Create your admin profile (replace with your UUID)
INSERT INTO public.profiles (id, user_id, full_name, email)
VALUES ('[YOUR_USER_UUID]', '[YOUR_USER_UUID]', 'Admin User', 'your-email@example.com');
```

## Code Changes Made

To handle missing tables gracefully while you execute migrations, I've updated these hooks:

1. **useDashboardStats.ts** - Returns default values if tables don't exist
2. **useClasses.ts** - Returns empty array if tables don't exist
3. **useStudents.ts** - Returns empty array if tables don't exist

These changes prevent the app from crashing while you set up the database.

## Expected Timeline

- **With migrations executed**: App works fully ✅
- **Without migrations**: You'll see empty data but app won't crash ⚠️

## Next Steps

1. **Execute migrations immediately** (this is blocking all app functionality)
2. **Insert sample data** (academic year, department, class)
3. **Assign admin role** to your user
4. **Refresh the app** in browser
5. Photo uploads will work properly once tables exist

## Status Check

After executing migrations, run this in Supabase SQL Editor to verify:

```sql
-- Should see 0 or more rows
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('academic_years', 'classes', 'departments', 'students', 'profiles', 'user_roles');

-- Should see your academic year
SELECT * FROM public.academic_years;

-- Should see your class
SELECT * FROM public.classes;
```

If all these return data successfully, the database is ready!

## Photo Issue Resolution

Once the database is set up:
1. Photos will upload to the `student-photos` storage bucket ✅
2. URLs will be saved to the `photo_url` column ✅
3. Photos will display in student management and reports ✅
4. Edit dialog will show saved photos ✅

The photo functionality was implemented correctly - it was just waiting for the database schema to exist.
