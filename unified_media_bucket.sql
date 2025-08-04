-- Unified Media Bucket - Use only media-files
-- Remove chat-uploads references and policies

-- 1. Drop chat-uploads bucket if it exists
DROP POLICY IF EXISTS "Public Access" ON storage.objects WHERE bucket_id = 'chat-uploads';
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects WHERE bucket_id = 'chat-uploads';
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects WHERE bucket_id = 'chat-uploads';
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects WHERE bucket_id = 'chat-uploads';
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects WHERE bucket_id = 'chat-uploads';

-- 2. Ensure media-files bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  104857600, -- 100MB
  ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

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

-- 5. Create permissive policy for media-files
CREATE POLICY "Allow everything on media-files" ON storage.objects
FOR ALL USING (bucket_id = 'media-files') WITH CHECK (bucket_id = 'media-files');

-- 6. Verify media-files bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'media-files';

-- 7. Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 8. Test access to media-files bucket
SELECT 
  'media-files bucket test' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets WHERE id = 'media-files'
    ) THEN 'BUCKET EXISTS'
    ELSE 'BUCKET MISSING'
  END as result; 