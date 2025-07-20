-- =====================================================
-- CORRECTION COMPLÈTE DU SYSTÈME DE LIKES
-- =====================================================

-- 1. Supprimer les anciennes politiques RLS
DROP POLICY IF EXISTS "Users can view own likes" ON "UserLikes";
DROP POLICY IF EXISTS "Users can add likes" ON "UserLikes";
DROP POLICY IF EXISTS "Users can remove own likes" ON "UserLikes";

-- 2. Désactiver temporairement RLS
ALTER TABLE "UserLikes" DISABLE ROW LEVEL SECURITY;

-- 3. Réactiver RLS
ALTER TABLE "UserLikes" ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques permissives
CREATE POLICY "Allow all operations" ON "UserLikes"
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Vérifier que la colonne likeCount existe sur User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER DEFAULT 0;

-- 6. Créer les triggers pour mettre à jour likeCount
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrémenter le likeCount du profil liké
        UPDATE "User" 
        SET "likeCount" = "likeCount" + 1 
        WHERE id = NEW."toUserId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Décrémenter le likeCount du profil liké
        UPDATE "User" 
        SET "likeCount" = GREATEST("likeCount" - 1, 0) 
        WHERE id = OLD."toUserId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS trigger_update_like_count_insert ON "UserLikes";
DROP TRIGGER IF EXISTS trigger_update_like_count_delete ON "UserLikes";

-- 8. Créer les nouveaux triggers
CREATE TRIGGER trigger_update_like_count_insert
    AFTER INSERT ON "UserLikes"
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

CREATE TRIGGER trigger_update_like_count_delete
    AFTER DELETE ON "UserLikes"
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

-- 9. Initialiser les likeCount existants
UPDATE "User" 
SET "likeCount" = (
    SELECT COUNT(*) 
    FROM "UserLikes" 
    WHERE "toUserId" = "User".id
);

-- 10. Vérifier les politiques
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

-- 11. Vérifier les triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'UserLikes';

-- =====================================================
-- FIN DE LA CORRECTION
-- ===================================================== 