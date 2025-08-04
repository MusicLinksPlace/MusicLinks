-- Créer le bucket pour les médias (vidéos et audio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/m4a'
  ]
);

-- Politique RLS pour permettre l'upload des médias
CREATE POLICY "Allow authenticated users to upload media files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media-files' 
  AND auth.role() = 'authenticated'
);

-- Politique RLS pour permettre la lecture des médias
CREATE POLICY "Allow public read access to media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media-files');

-- Politique RLS pour permettre la suppression de ses propres médias
CREATE POLICY "Allow users to delete their own media files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 