# Photo URL Issue - Root Cause Analysis & Solutions

## Diagnosis Flowchart

### Test 1: Is photo_url being saved to database?

**Action**: Create student with photo, open browser DevTools Console
**Look for**: "Saved photo_url in database: https://..."

- **If NULL or undefined**: → Go to Solution A
- **If shows valid URL**: → Go to Solution B

---

## Solution A: photo_url is NULL in Database

### Cause 1: RLS Policy Preventing INSERT
The admin role might not be properly assigned, preventing the INSERT operation.

**Check**:
1. Go to Supabase Dashboard → Authentication → Users
2. Find your admin user account
3. Go to Admin panel (near Users) → user_roles table
4. Check if a row exists with: user_id = [your_id], role = 'admin'

**Fix if missing**:
```sql
-- In Supabase SQL Editor, run:
INSERT INTO public.user_roles (user_id, role)
VALUES ('[your_user_uuid]', 'admin'::app_role);
```

### Cause 2: photo_url Column Default Issue
If RLS prevents reading back the inserted value.

**Check**:
1. In Supabase SQL Editor, run:
```sql
SELECT id, student_id, full_name, photo_url FROM public.students LIMIT 5;
```
2. Do you see the student? Does photo_url show a URL or NULL?

**Fix if NULL**:
The issue is in handleAddStudent() - the photo_url isn't being provided to INSERT.

Verify in browser console that it logs:
- "Generated photo URL: https://buqwtrshkmjpueofcfac..."
- "Creating student with photo_url: https://..." 

If it says "Creating student with photo_url: null", the upload failed silently.

---

## Solution B: photo_url is saved but not displaying

### Cause 1: Query not including photo_url
The useStudents hook uses `*` which should include photo_url, but RLS might block it.

**Check**:
1. Open DevTools Console
2. In Supabase SQL Editor, run:
```sql
SELECT * FROM public.students LIMIT 1;
```
3. Can you see the photo_url column?

**Fix**:
Update `src/hooks/useStudents.ts` to explicitly request photo_url:

```typescript
.select(`
  id,
  student_id,
  full_name,
  class_id,
  department_id,
  photo_url,  // <-- Add this explicitly
  date_of_birth,
  phone_number,
  classes:class_id (...),
  departments:department_id (...)
`)
```

### Cause 2: Image URL is valid but won't load (403 Forbidden)
The storage bucket isn't actually public or RLS policy blocks access.

**Check Network Tab**:
1. DevTools → Network tab
2. Look for request to "student-photos/..."
3. What status code? 403? 404? 200?

**Fix for 403**:
In Supabase Storage → student-photos bucket:
1. Click the bucket
2. Go to Policies tab
3. Check "Authenticated users can read from public bucket"
4. If not present, add:
```sql
CREATE POLICY "Public read access to student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');
```

### Cause 3: CORS Issue
Image URL is valid and accessible but browser blocks it.

**Check Browser Console**: Look for CORS errors
**Fix**: 
1. Check Supabase Dashboard → Storage Settings → CORS
2. Ensure your domain is allowed
3. Or try: Add `crossOrigin="anonymous"` to img tags

---

## Immediate Action Items

### 1. Check if you're logged in as admin
```
In browser console run:
supabase.auth.getUser().then(res => console.log(res))
```
Note the user UUID.

### 2. Verify admin role is assigned
```sql
-- In Supabase SQL Editor:
SELECT * FROM public.user_roles WHERE role = 'admin';
```
If no results, run the INSERT command above with your user UUID.

### 3. Create a test student with photo
1. Go to Student Management
2. Add a new student WITH a photo
3. Check console for all logs

### 4. Direct database query to verify
```sql
-- In Supabase SQL Editor:
SELECT id, student_id, full_name, photo_url 
FROM public.students 
WHERE student_id = '101'  -- or whatever ID you just created
LIMIT 1;
```
What do you see in the photo_url column?

### 5. Test image URL directly
1. Copy the photo_url from the database query result
2. Open it in a new browser tab
3. Does the image load or do you see an error?

---

## Latest Fixes Applied

The StudentManagementTab.tsx now includes:
- Better error messages
- Enhanced console logging at every step
- File details logging (name, type, size)
- URL validation
- Response logging from database

## Next Steps

1. **First**: Run the tests above and capture all console output
2. **Then**: Run the database queries and note results
3. **Finally**: Check the Network tab for any 403/404 errors
4. **Share**: The console logs, database query results, and any error messages

This will help pinpoint exactly where the photo URL is being lost.
