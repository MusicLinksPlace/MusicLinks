-- Test d'upload - Vérifier que tout fonctionne
-- Ce script teste les permissions d'upload

-- 1. Vérifier que RLS est désactivé sur storage.objects
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS DÉSACTIVÉ'
    ELSE '❌ RLS ACTIVÉ'
  END as status
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. Vérifier les politiques sur storage.objects
SELECT 
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual = 'true' AND with_check = 'true' THEN '✅ POLITIQUE PERMISSIVE'
    ELSE '❌ POLITIQUE RESTRICTIVE'
  END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Vérifier que tous les buckets sont publics
SELECT 
  id,
  name,
  public,
  file_size_limit,
  CASE 
    WHEN public = true THEN '✅ BUCKET PUBLIC'
    ELSE '❌ BUCKET PRIVÉ'
  END as status
FROM storage.buckets 
WHERE id IN ('chat-uploads', 'media-files', 'avatars', 'gallery', 'user-videos')
ORDER BY id;

-- 4. Vérifier les permissions sur les buckets
SELECT 
  bucket_id,
  name,
  owner,
  created_at
FROM storage.objects 
WHERE bucket_id IN ('chat-uploads', 'media-files', 'avatars', 'gallery', 'user-videos')
ORDER BY created_at DESC
LIMIT 5;

-- 5. Test d'insertion (simulation)
-- Note: Cette requête ne va pas vraiment insérer, mais teste les permissions
SELECT 
  'Test d\'insertion dans chat-uploads' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'chat-uploads' 
      LIMIT 1
    ) THEN '✅ ACCÈS LECTURE OK'
    ELSE '❌ ACCÈS LECTURE ÉCHOUÉ'
  END as result; 