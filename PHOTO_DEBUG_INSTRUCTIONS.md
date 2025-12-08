# Photo Upload Debugging - Test Instructions

## Changes Made

1. **Enhanced logging in `handleAddStudent()`**:
   - Logs file details (name, type, size)
   - Logs upload response
   - Logs generated public URL
   - Logs student creation response
   - Logs saved photo_url in database
   - Better error messages

2. **Enhanced logging in `handleUpdateStudent()`**:
   - Logs current photo_url before update
   - Logs file details for new photo
   - Logs generated new URL
   - Logs update response
   - Better error messages

3. **Enhanced logging in `handleEditClick()`**:
   - Logs full student object
   - Logs photo_url value and type
   - Logs what's being set to preview
   - Helps diagnose if photo_url is missing from query result

## Testing Steps

### Step 1: Create a Student with Photo
1. Navigate to Admin → Student Management
2. Click "Add Student"
3. Fill in student details (full name, class, etc.)
4. **Important**: Upload a photo (small JPG/PNG preferred)
5. Click "Add Student"
6. **Open DevTools → Console** and look for logs:
   - "Uploading photo to: student-photos/student-100-[timestamp]"
   - "Generated photo URL: https://buqwtrshkmjpueofcfac.supabase.co/storage/v1/object/public/student-photos/..."
   - "Student created successfully: {...}"
   - "Saved photo_url in database: [URL]"

### Step 2: Verify Photo is Saved
1. Look in the student list - does the avatar show?
   - If YES: Photo URL is working
   - If NO: Photo URL might be NULL or invalid

### Step 3: Edit the Student
1. Click Edit on the student you just created
2. **Open DevTools → Console** and look for:
   - "=== EDIT CLICK DEBUG ==="
   - "Full student object: {...}"
   - "student.photo_url: [should show URL or null]"
   - "Setting photo preview to: [URL or empty string]"
3. Does the edit dialog show the photo?
   - If YES: Photo URL is being retrieved correctly
   - If NO: photo_url is NULL in database (data not saved)

### Step 4: Check in Report
1. Go to Reports page
2. Click on the student's report card
3. Check if photo appears in the report header
4. If not, **Open DevTools → Network** tab and check:
   - Is the image URL being requested? (look for student-photos/...)
   - What HTTP status does it return? (200 = OK, 403 = forbidden, 404 = not found)

## Common Issues & Solutions

### Issue: Photo uploads but console shows "photo_url: null"
**Cause**: RLS policy preventing read of photo_url field
**Solution**: 
```sql
-- In Supabase SQL Editor, run:
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
-- Then enable again after checking policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
```

### Issue: Photo URL looks invalid (not Supabase domain)
**Cause**: getPublicUrl() returned malformed URL
**Solution**: Check browser console for warning about URL format

### Issue: URL shows in console but image doesn't load (Network returns 403)
**Cause**: Storage bucket public read policy is too restrictive
**Solution**: Check Supabase dashboard → Storage → Policies
Ensure "Anyone can view student photos" policy exists

### Issue: URL shows in console but image doesn't load (Network returns 404)
**Cause**: File wasn't actually uploaded to storage
**Solution**: Check Supabase dashboard → Storage → student-photos bucket
Look for uploaded files with names like "student-100-1733356892391"

## Debugging Network Issues

If images appear to have valid URLs but don't load:

1. Copy the photo URL from console
2. Open it in a new tab
3. If you get 403 Forbidden:
   - Storage bucket isn't actually public
   - RLS policies are blocking access
4. If you get 404 Not Found:
   - File wasn't uploaded
   - Wrong bucket name
5. If you get image loaded:
   - CORS issue in the app
   - Try hard refresh (Ctrl+Shift+R)
   - Clear browser cache
