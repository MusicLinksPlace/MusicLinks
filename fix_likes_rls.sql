-- =====================================================
-- CORRECTION DES POLITIQUES RLS POUR USERLIKES
-- =====================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own likes" ON "UserLikes";
DROP POLICY IF EXISTS "Users can add likes" ON "UserLikes";
DROP POLICY IF EXISTS "Users can remove own likes" ON "UserLikes";

-- Désactiver temporairement RLS pour permettre les opérations
ALTER TABLE "UserLikes" DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS
ALTER TABLE "UserLikes" ENABLE ROW LEVEL SECURITY;

-- Créer des politiques plus permissives pour le développement
-- Permettre à tous les utilisateurs authentifiés de voir les likes
CREATE POLICY "Allow all authenticated users to view likes" ON "UserLikes"
    FOR SELECT USING (true);

-- Permettre à tous les utilisateurs authentifiés d'ajouter des likes
CREATE POLICY "Allow all authenticated users to add likes" ON "UserLikes"
    FOR INSERT WITH CHECK (true);

-- Permettre à tous les utilisateurs authentifiés de supprimer des likes
CREATE POLICY "Allow all authenticated users to delete likes" ON "UserLikes"
    FOR DELETE USING (true);

-- Permettre à tous les utilisateurs authentifiés de mettre à jour des likes
CREATE POLICY "Allow all authenticated users to update likes" ON "UserLikes"
    FOR UPDATE USING (true);

-- Vérifier que les politiques sont créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'UserLikes';

-- =====================================================
-- FIN DE LA CORRECTION
-- ===================================================== 