-- Script pour des politiques RLS plus permissives (version simplifiée)
-- À exécuter dans l'interface SQL de Supabase

-- 1. Supprimer toutes les politiques existantes pour le bucket avatars
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;

-- 2. Créer des politiques très permissives pour le bucket avatars
-- Permettre l'upload pour tous les utilisateurs authentifiés
CREATE POLICY "Allow all avatar uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Permettre la mise à jour pour tous les utilisateurs authentifiés
CREATE POLICY "Allow all avatar updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

-- Permettre la suppression pour tous les utilisateurs authentifiés
CREATE POLICY "Allow all avatar deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Permettre la lecture publique
CREATE POLICY "Allow public avatar reads" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Vérifier que les politiques sont créées
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- 4. S'assurer que RLS est activé
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier que le bucket avatars existe et est public
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'avatars'; 