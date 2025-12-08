# Quick Start - Database Setup (5 Minutes)

## What You Need to Do NOW

The app is showing 406 errors because the database hasn't been created yet.

### Step 1: Open Supabase
1. Go to https://app.supabase.com/
2. Click on your project "smartgrade"

### Step 2: Get the SQL Migration
1. In your project folder, open `MIGRATION_COMBINED.sql`
2. Select all text (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 3: Execute in Supabase
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"** button
3. Paste the SQL (Ctrl+V)
4. Click the blue **"RUN"** button
5. Wait for it to complete (should say "Query executed successfully")

### Step 4: Create Initial Data
Go back to SQL Editor, create a new query, and paste this:

```sql
-- Create current academic year
INSERT INTO public.academic_years (year_name, start_date, end_date, is_current)
VALUES ('2024/2025', '2024-09-01', '2025-08-31', true);

-- Create a department
INSERT INTO public.departments (name)
VALUES ('Secondary School');

-- Create a sample class
-- First, get these IDs by running queries separately:
-- SELECT id FROM public.academic_years LIMIT 1;
-- SELECT id FROM public.departments LIMIT 1;
-- Then use those IDs in this insert (replace the UUID placeholders)
INSERT INTO public.classes (name, department_id, academic_year_id)
VALUES ('Grade 10-A', '[dept-id-here]', '[year-id-here]');
```

**For the class insert:**
1. Run: `SELECT id FROM public.academic_years LIMIT 1;` → Copy the id
2. Run: `SELECT id FROM public.departments LIMIT 1;` → Copy the id
3. Replace `[dept-id-here]` and `[year-id-here]` with those IDs
4. Run the insert

### Step 5: Make Yourself Admin
1. Go to **Authentication** → **Users** (in Supabase sidebar)
2. Click on your user email
3. **Copy the UUID** (User ID)
4. Go back to **SQL Editor** → **New Query**
5. Paste this (replace with your UUID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-uuid-here', 'admin'::app_role);

INSERT INTO public.profiles (id, user_id, full_name, email)
VALUES ('your-user-uuid-here', 'your-user-uuid-here', 'Admin', 'your@email.com');
```

### Step 6: Refresh App
1. Go back to your app in browser
2. Hard refresh: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
3. The 406 errors should be gone! ✅

## Done!

Your database is now set up. The app should:
- ✅ Stop showing 406 errors
- ✅ Allow you to create students
- ✅ Allow you to upload student photos
- ✅ Display photos in student management and reports
- ✅ Show dashboard statistics

## If Something Breaks

1. Check browser console (F12 → Console tab) for errors
2. Verify academic year is set to `is_current = true`
3. Make sure your user has admin role in user_roles table
4. Hard refresh browser cache (Ctrl+Shift+Delete)

## Still Having Issues?

Check these files in your project for detailed troubleshooting:
- `ERROR_406_SOLUTION.md` - Full explanation
- `EXECUTE_MIGRATIONS.md` - Detailed step-by-step
- `PHOTO_TROUBLESHOOTING.md` - Photo upload issues
