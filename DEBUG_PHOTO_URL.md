# Photo URL Debug Guide

## Issue
Photos are being uploaded but not displaying in report cards or when editing students.

## Root Cause Analysis

1. **Photo Upload**: Working correctly - file is being uploaded to `student-photos` bucket
2. **URL Generation**: Using `getPublicUrl()` - returns a URL like:
   ```
   https://buqwtrshkmjpueofcfac.supabase.co/storage/v1/object/public/student-photos/student-100-1733356892391
   ```

3. **Storage RLS Policy**: Public read access is allowed:
   ```sql
   CREATE POLICY "Anyone can view student photos"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'student-photos');
   ```

4. **Display Issues**:
   - Avatar component receives the URL
   - Image might not be loading due to CORS issues
   - Or the photo_url field is NULL/not being returned from database

## Test Steps

1. Open browser DevTools → Network tab
2. Create a new student with photo
3. Check console logs for:
   - "Generated photo URL: [URL]"
   - "Student created: [data]"
4. In Network tab, check if the image URL returns 200 or 403
5. Click Edit on the student - check if photo_url appears in console log

## Potential Fixes

If photo URLs show in console but images don't display:
- The issue is CORS or image loading
- Solution: Ensure Supabase storage bucket is public
- May need to add CORS headers to bucket

If photo_url is NULL or empty:
- The issue is database RLS
- Solution: Check if admins can read the photo_url field from students table
- May need to add explicit column-level RLS

If everything seems correct but photos still don't show:
- Cache issue - try hard refresh (Ctrl+Shift+R)
- Storage bucket issue - verify in Supabase dashboard
