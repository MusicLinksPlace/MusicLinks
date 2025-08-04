-- Désactiver complètement RLS sur les buckets de storage
-- Ce script supprime toutes les restrictions sur l'upload de fichiers

-- 1. Supprimer toutes les politiques existantes sur storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on id" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON storage.objects;

-- 2. Désactiver RLS sur storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 3. Créer une politique ultra-permissive
CREATE POLICY "Allow everything on storage objects" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- 4. S'assurer que tous les buckets sont publics
UPDATE storage.buckets SET public = true WHERE id IN ('chat-uploads', 'media-files', 'avatars', 'gallery', 'user-videos');

-- 5. Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 6. Vérifier les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 7. Vérifier que les buckets sont publics
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('chat-uploads', 'media-files', 'avatars', 'gallery', 'user-videos'); 