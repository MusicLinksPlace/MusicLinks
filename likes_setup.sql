-- =====================================================
-- SETUP COMPLET POUR LA FONCTIONNALITÉ DE LIKES
-- =====================================================

-- 1. Créer la table UserLikes
CREATE TABLE IF NOT EXISTS "UserLikes" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "fromUserId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "toUserId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("fromUserId", "toUserId")
);

-- 2. Ajouter la colonne likeCount à la table User si elle n'existe pas
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER DEFAULT 0;

-- 3. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_userlikes_fromuserid ON "UserLikes"("fromUserId");
CREATE INDEX IF NOT EXISTS idx_userlikes_touserid ON "UserLikes"("toUserId");
CREATE INDEX IF NOT EXISTS idx_userlikes_createdat ON "UserLikes"("createdAt");

-- 4. Fonction pour mettre à jour le likeCount
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

-- 5. Créer les triggers
DROP TRIGGER IF EXISTS trigger_update_like_count_insert ON "UserLikes";
DROP TRIGGER IF EXISTS trigger_update_like_count_delete ON "UserLikes";

CREATE TRIGGER trigger_update_like_count_insert
    AFTER INSERT ON "UserLikes"
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

CREATE TRIGGER trigger_update_like_count_delete
    AFTER DELETE ON "UserLikes"
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

-- 6. Fonction pour initialiser le likeCount existant
CREATE OR REPLACE FUNCTION initialize_like_counts()
RETURNS void AS $$
BEGIN
    UPDATE "User" 
    SET "likeCount" = (
        SELECT COUNT(*) 
        FROM "UserLikes" 
        WHERE "toUserId" = "User".id
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Exécuter l'initialisation
SELECT initialize_like_counts();

-- 8. Politiques RLS pour UserLikes
ALTER TABLE "UserLikes" ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs de voir leurs propres likes
CREATE POLICY "Users can view own likes" ON "UserLikes"
    FOR SELECT USING (
        auth.uid() = "fromUserId" OR auth.uid() = "toUserId"
    );

-- Permettre aux utilisateurs d'ajouter des likes
CREATE POLICY "Users can add likes" ON "UserLikes"
    FOR INSERT WITH CHECK (
        auth.uid() = "fromUserId" AND "fromUserId" != "toUserId"
    );

-- Permettre aux utilisateurs de supprimer leurs propres likes
CREATE POLICY "Users can remove own likes" ON "UserLikes"
    FOR DELETE USING (
        auth.uid() = "fromUserId"
    );

-- 9. Fonction pour obtenir les profils likés par un utilisateur
CREATE OR REPLACE FUNCTION get_liked_profiles(user_id UUID)
RETURNS TABLE (
    "userId" UUID,
    "name" TEXT,
    "profilepicture" TEXT,
    "role" TEXT,
    "location" TEXT,
    "likeCount" INTEGER,
    "likedAt" TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as "userId",
        u.name,
        u.profilepicture,
        u.role,
        u.location,
        u."likeCount",
        ul."createdAt" as "likedAt"
    FROM "UserLikes" ul
    JOIN "User" u ON ul."toUserId" = u.id
    WHERE ul."fromUserId" = user_id
    AND u.verified = 1 
    AND u.disabled = 0
    ORDER BY ul."createdAt" DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour obtenir les utilisateurs qui ont liké un profil
CREATE OR REPLACE FUNCTION get_users_who_liked(profile_id UUID, limit_count INTEGER DEFAULT 10, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
    "userId" UUID,
    "name" TEXT,
    "profilepicture" TEXT,
    "role" TEXT,
    "location" TEXT,
    "likedAt" TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as "userId",
        u.name,
        u.profilepicture,
        u.role,
        u.location,
        ul."createdAt" as "likedAt"
    FROM "UserLikes" ul
    JOIN "User" u ON ul."fromUserId" = u.id
    WHERE ul."toUserId" = profile_id
    AND u.verified = 1 
    AND u.disabled = 0
    ORDER BY ul."createdAt" DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Politiques pour permettre l'accès aux fonctions
GRANT EXECUTE ON FUNCTION get_liked_profiles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_who_liked(UUID, INTEGER, INTEGER) TO authenticated;

-- 12. Nettoyer les fonctions temporaires
DROP FUNCTION IF EXISTS initialize_like_counts();

-- =====================================================
-- FIN DU SETUP
-- ===================================================== 