-- Fix media-files bucket MIME types
-- Allow all file types for upload

-- 1. Update media-files bucket to accept all MIME types
UPDATE storage.buckets 
SET 
  allowed_mime_types = NULL,  -- NULL means accept all MIME types
  file_size_limit = 104857600  -- 100MB
WHERE id = 'media-files';

-- 2. If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  104857600, -- 100MB
  NULL  -- NULL = accept all MIME types
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = NULL;

-- 3. Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow everything on storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow everything on media-files" ON storage.objects;

-- 5. Create ultra-permissive policy for all storage
CREATE POLICY "Allow everything on all storage" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- 6. Verify bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  CASE 
    WHEN allowed_mime_types IS NULL THEN 'ACCEPTS ALL MIME TYPES'
    ELSE 'RESTRICTED MIME TYPES'
  END as mime_status
FROM storage.buckets 
WHERE id = 'media-files';

-- 7. Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 8. Test bucket access
SELECT 
  'media-files bucket test' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets WHERE id = 'media-files' AND allowed_mime_types IS NULL
    ) THEN 'BUCKET ACCEPTS ALL MIME TYPES'
    ELSE 'BUCKET HAS MIME RESTRICTIONS'
  END as result; 