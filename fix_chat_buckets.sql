-- Configuration des buckets pour le chat
-- Basé sur les buckets réels : chat-uploads, media-files, avatars, gallery, user-videos

-- 1. Créer le bucket chat-uploads s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-uploads',
  'chat-uploads',
  true,
  52428800, -- 50MB
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer le bucket media-files s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  104857600, -- 100MB
  ARRAY['video/*', 'audio/*']
) ON CONFLICT (id) DO NOTHING;

-- 3. Créer le bucket avatars s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/*']
) ON CONFLICT (id) DO NOTHING;

-- 4. Créer le bucket gallery s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  52428800, -- 50MB
  ARRAY['image/*', 'video/*']
) ON CONFLICT (id) DO NOTHING;

-- 5. Créer le bucket user-videos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-videos',
  'user-videos',
  true,
  104857600, -- 100MB
  ARRAY['video/*']
) ON CONFLICT (id) DO NOTHING;

-- 6. Supprimer toutes les politiques existantes sur ces buckets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 7. Créer des politiques permissives pour tous les buckets
CREATE POLICY "Allow all operations on storage objects" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- 8. Vérifier que tous les buckets sont créés
SELECT id, name, public, file_size_limit FROM storage.buckets 
WHERE id IN ('chat-uploads', 'media-files', 'avatars', 'gallery', 'user-videos')
ORDER BY id;

-- 9. Vérifier les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'; 