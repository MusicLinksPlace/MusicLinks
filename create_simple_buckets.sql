-- Créer les buckets de manière simple sans restrictions
-- Ce script crée tous les buckets nécessaires avec des politiques permissives

-- 1. Bucket avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Bucket gallery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 3. Bucket user-videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-videos',
  'user-videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- 4. Bucket attachments (IMPORTANT pour le chat)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 5. Bucket media-files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  52428800, -- 50MB
  ARRAY[
    'video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Politique permissive pour TOUS les buckets
-- Cette politique permet tout accès à tous les buckets
CREATE POLICY "Allow all storage operations" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- Vérification que les buckets sont créés
SELECT id, name, public FROM storage.buckets WHERE id IN ('avatars', 'gallery', 'user-videos', 'attachments', 'media-files'); 