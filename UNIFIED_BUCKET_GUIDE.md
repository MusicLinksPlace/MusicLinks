# UNIFIED MEDIA BUCKET - media-files only

## CHANGES MADE

### 1. Code Changes
- Replaced all "chat-uploads" with "media-files" in src/
- All file uploads now use single bucket: media-files
- Simplified bucket selection logic

### 2. Files Modified
- src/pages/Chat.tsx: Now uses only media-files bucket
- All uploads (images, videos, audio, PDF) go to media-files

### 3. SQL Script Created
- unified_media_bucket.sql: Configures media-files bucket
- Removes chat-uploads policies
- Sets up permissive access

## TESTING

### 1. Execute SQL Script
- Go to Supabase Dashboard → SQL Editor
- Execute unified_media_bucket.sql
- Verify bucket configuration

### 2. Test File Uploads
- Connect with test@test.com
- Go to chat
- Try uploading:
  - Images (PNG, JPG)
  - Videos (MP4)
  - Audio (MP3)
  - PDF files
  - Documents (DOC, DOCX)

### 3. Expected Results
- All files upload to media-files bucket
- No more "bucket not found" errors
- All file types work
- No restrictions

## BUCKET CONFIGURATION

### media-files bucket:
- Public: true
- Size limit: 100MB
- Allowed types: images, videos, audio, PDF, documents, text

### Removed:
- chat-uploads bucket references
- Old restrictive policies
- Complex bucket selection logic

## VERIFICATION

Check that:
- Only media-files bucket is used
- All file uploads work
- No 400/403 errors
- Messages send successfully
- Files display correctly 