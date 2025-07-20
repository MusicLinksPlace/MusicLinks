-- =====================================================
-- CORRECTION SIMPLE DES POLITIQUES RLS POUR USERLIKES
-- =====================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own likes" ON "UserLikes";
DROP POLICY IF EXISTS "Users can add likes" ON "UserLikes";
DROP POLICY IF EXISTS "Users can remove own likes" ON "UserLikes";

-- Désactiver temporairement RLS
ALTER TABLE "UserLikes" DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS
ALTER TABLE "UserLikes" ENABLE ROW LEVEL SECURITY;

-- Créer des politiques permissives
CREATE POLICY "Allow all operations" ON "UserLikes"
    FOR ALL USING (true) WITH CHECK (true);

-- Vérifier
SELECT * FROM pg_policies WHERE tablename = 'UserLikes'; 