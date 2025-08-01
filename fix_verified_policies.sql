-- Script pour corriger les politiques RLS qui filtrent les utilisateurs non vérifiés
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier les politiques existantes sur la table User
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'User' 
AND schemaname = 'public'
ORDER BY policyname;

-- 2. Supprimer les politiques qui filtrent par verified = 1
DROP POLICY IF EXISTS "Users can view verified profiles" ON "User";
DROP POLICY IF EXISTS "Users can view public profiles" ON "User";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "User";

-- 3. Créer une nouvelle politique qui permet de voir tous les profils non désactivés
CREATE POLICY "Users can view all active profiles" ON "User"
FOR SELECT USING (
  disabled = 0
);

-- 4. Vérifier que la nouvelle politique est créée
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'User' 
AND schemaname = 'public'
AND policyname = 'Users can view all active profiles';

-- 5. S'assurer que RLS est activé sur la table User
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- 6. Vérifier que RLS est activé
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'User'; 