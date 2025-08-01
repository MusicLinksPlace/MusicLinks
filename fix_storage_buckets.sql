-- Script pour créer les buckets de stockage manquants dans Supabase
-- À exécuter dans l'interface SQL de Supabase

-- 1. Créer le bucket "avatars" pour les photos de profil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer le bucket "gallery" pour les images de galerie
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Créer le bucket "videos" pour les vidéos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Politiques RLS pour le bucket "avatars"
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 5. Politiques RLS pour le bucket "gallery"
CREATE POLICY "Users can upload to their own gallery" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own gallery" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own gallery" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Gallery images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery');

-- 6. Politiques RLS pour le bucket "videos"
CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Videos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- 7. Vérifier que les buckets existent
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('avatars', 'gallery', 'videos'); 