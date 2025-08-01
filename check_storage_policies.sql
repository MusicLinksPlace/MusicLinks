-- Script simple pour vérifier les politiques de stockage
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier que le bucket avatars existe
SELECT 'Bucket avatars exists:' as info, id, name, public FROM storage.buckets WHERE id = 'avatars';

-- 2. Vérifier les politiques RLS sur storage.objects
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 3. Vérifier que RLS est activé
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 4. Créer une politique simple pour permettre l'upload d'avatars
-- (à exécuter seulement si les politiques n'existent pas)
DO $$
BEGIN
  -- Vérifier si la politique existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow avatar uploads'
  ) THEN
    -- Créer une politique simple pour permettre l'upload
    EXECUTE 'CREATE POLICY "Allow avatar uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''avatars'')';
    RAISE NOTICE 'Politique "Allow avatar uploads" créée';
  ELSE
    RAISE NOTICE 'Politique "Allow avatar uploads" existe déjà';
  END IF;
END $$; 