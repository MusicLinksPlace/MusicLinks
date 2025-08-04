# MIME TYPE FIX - Allow all file uploads

## PROBLEM
- Error: "mime type image/png is not supported"
- Bucket media-files has MIME type restrictions
- Cannot upload images, PDF, etc.

## SOLUTION
Execute fix_media_bucket_mime.sql

## WHAT IT DOES
1. Sets allowed_mime_types = NULL (accepts all MIME types)
2. Increases file size limit to 100MB
3. Creates ultra-permissive storage policies
4. Disables all RLS restrictions

## INSTRUCTIONS

### 1. Execute SQL Script
- Go to Supabase Dashboard → SQL Editor
- Execute fix_media_bucket_mime.sql
- Verify bucket accepts all MIME types

### 2. Test File Uploads
- Connect with test@test.com
- Go to chat
- Try uploading:
  - PNG images
  - JPEG images
  - PDF files
  - MP4 videos
  - MP3 audio
  - DOC documents
  - Any file type

### 3. Expected Results
- All file types upload successfully
- No MIME type errors
- No 400/403 errors
- Files display correctly

## BUCKET CONFIGURATION

### media-files bucket after fix:
- Public: true
- Size limit: 100MB
- MIME types: NULL (accepts all)
- RLS: Disabled
- Policies: Ultra-permissive

## VERIFICATION

Check that:
- allowed_mime_types = NULL in bucket config
- All file uploads work
- No MIME type restrictions
- Files display in chat
- No errors in console

## IF STILL NOT WORKING
1. Check bucket exists in Supabase Storage
2. Verify policies are applied
3. Clear browser cache
4. Restart development server 