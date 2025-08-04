-- Créer tous les buckets nécessaires pour MusicLinks

-- 1. Bucket pour les avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Bucket pour les images de galerie
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 3. Bucket pour les vidéos utilisateur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-videos',
  'user-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- 4. Bucket pour les uploads de chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 5. Bucket pour les médias (vidéos et audio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour le bucket avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow users to update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques RLS pour le bucket gallery
CREATE POLICY "Allow authenticated users to upload gallery images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Allow users to update their own gallery images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own gallery images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques RLS pour le bucket user-videos
CREATE POLICY "Allow authenticated users to upload user videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to user videos" ON storage.objects
FOR SELECT USING (bucket_id = 'user-videos');

CREATE POLICY "Allow users to update their own user videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own user videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques RLS pour le bucket attachments
CREATE POLICY "Allow authenticated users to upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Allow users to delete their own attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politiques RLS pour le bucket media-files
CREATE POLICY "Allow authenticated users to upload media files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media-files');

CREATE POLICY "Allow users to delete their own media files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 