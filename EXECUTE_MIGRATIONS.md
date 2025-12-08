# 406 Error - Database Migration Required

## Root Cause
The 406 "Not Acceptable" error from Supabase PostgREST API indicates that the tables being queried don't exist or are not properly set up.

This error is happening because **the database migrations have NOT been executed yet**.

## Why This Happens
1. You created students and data in the app
2. The app is trying to query tables like `academic_years`
3. But these tables don't exist in the Supabase database
4. Supabase returns 406 because the API can't properly handle the request

## Solution: Execute Database Migrations

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Login with your account
   - Select your project (smartgrade)

2. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query" button
   - This opens a blank SQL editor

3. **Copy the Migration SQL**
   - Open this file: `MIGRATION_COMBINED.sql` in your project
   - Select ALL the SQL code (Ctrl+A)
   - Copy it (Ctrl+C)

4. **Paste into Supabase SQL Editor**
   - Click in the SQL editor text area
   - Paste the code (Ctrl+V)

5. **Execute the Migration**
   - Click the blue "RUN" button (or Ctrl+Enter)
   - Wait for it to complete
   - You should see: "Query executed successfully"

6. **Verify Success**
   - Go to Database → Tables in left sidebar
   - You should now see these tables:
     - academic_years
     - assessments_types
     - classes
     - departments
     - profiles
     - students
     - subjects
     - user_roles
     - (and others)

### After Migration Complete

7. **Create Admin User**
   - Go to Authentication → Users
   - Create a new user (if you haven't already)
   - Note the UUID of your user

8. **Assign Admin Role**
   - Go back to SQL Editor
   - Run this query (replace with your actual user UUID):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_UUID_HERE', 'admin'::app_role);
   ```

9. **Create Admin Profile**
   - Run this query (replace YOUR_USER_UUID):
   ```sql
   INSERT INTO public.profiles (id, user_id, full_name, email)
   VALUES ('YOUR_USER_UUID_HERE', 'YOUR_USER_UUID_HERE', 'Admin', 'your-email@example.com');
   ```

10. **Create Academic Year (Required!)**
    - Run this query:
    ```sql
    INSERT INTO public.academic_years (year_name, start_date, end_date, is_current)
    VALUES ('2024/2025', '2024-09-01', '2025-08-31', true);
    ```

11. **Create a Department**
    - Run this query:
    ```sql
    INSERT INTO public.departments (name, description)
    VALUES ('Secondary School', 'High school students');
    ```

12. **Create a Class**
    - First, get your academic_year UUID:
    ```sql
    SELECT id FROM public.academic_years LIMIT 1;
    ```
    - Then create a class (replace UUIDs):
    ```sql
    INSERT INTO public.classes (name, department_id, academic_year_id)
    VALUES ('Grade 10-A', 'DEPARTMENT_UUID', 'ACADEMIC_YEAR_UUID');
    ```

## Quick Fixes to Try

If you still get 406 errors after migration:

1. **Clear browser cache**
   - Ctrl+Shift+Delete
   - Clear "All time"
   - Close and reopen app

2. **Restart dev server**
   - Stop: Ctrl+C in terminal
   - Restart: `npm run dev`

3. **Check table permissions**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify RLS policies exist for each table

## Status Check

To verify everything is working:

1. In Supabase SQL Editor, run:
```sql
SELECT * FROM public.academic_years;
SELECT COUNT(*) as total_students FROM public.students;
SELECT COUNT(*) as total_classes FROM public.classes;
```

If you get results with no errors, the database is properly set up!

## Important Notes

- **One-time setup**: You only need to do this once
- **Migrations are idempotent**: Running them twice is safe (they won't duplicate data)
- **Order matters**: Run the full MIGRATION_COMBINED.sql as one block
- **Don't edit migrations manually** after they're run in production
