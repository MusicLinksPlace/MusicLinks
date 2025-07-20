-- Optimisation des performances pour la fonctionnalité de likes
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter une colonne likeCount à la table User pour éviter les requêtes COUNT
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "likeCount" INTEGER DEFAULT 0;

-- 2. Créer une fonction pour mettre à jour automatiquement le compteur de likes
CREATE OR REPLACE FUNCTION update_user_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrémenter le compteur quand un like est ajouté
    UPDATE "User" 
    SET "likeCount" = "likeCount" + 1 
    WHERE id = NEW."toUserId";
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Décrémenter le compteur quand un like est supprimé
    UPDATE "User" 
    SET "likeCount" = "likeCount" - 1 
    WHERE id = OLD."toUserId";
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer les triggers pour maintenir automatiquement le compteur
DROP TRIGGER IF EXISTS trigger_update_like_count_insert ON "UserLikes";
CREATE TRIGGER trigger_update_like_count_insert
  AFTER INSERT ON "UserLikes"
  FOR EACH ROW
  EXECUTE FUNCTION update_user_like_count();

DROP TRIGGER IF EXISTS trigger_update_like_count_delete ON "UserLikes";
CREATE TRIGGER trigger_update_like_count_delete
  AFTER DELETE ON "UserLikes"
  FOR EACH ROW
  EXECUTE FUNCTION update_user_like_count();

-- 4. Initialiser le compteur pour les utilisateurs existants
UPDATE "User" 
SET "likeCount" = (
  SELECT COUNT(*) 
  FROM "UserLikes" 
  WHERE "UserLikes"."toUserId" = "User".id
);

-- 5. Créer un index composite pour optimiser les requêtes de likes
CREATE INDEX IF NOT EXISTS "UserLikes_fromUserId_toUserId_idx" 
ON "UserLikes"("fromUserId", "toUserId");

-- 6. Créer un index pour les requêtes de comptage par utilisateur
CREATE INDEX IF NOT EXISTS "UserLikes_toUserId_createdAt_idx" 
ON "UserLikes"("toUserId", "createdAt" DESC);

-- 7. Fonction pour obtenir les profils likés avec pagination
CREATE OR REPLACE FUNCTION get_liked_profiles(
  user_id UUID,
  page_size INTEGER DEFAULT 20,
  page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  profilepicture TEXT,
  location TEXT,
  role TEXT,
  subcategory TEXT,
  subCategory TEXT,
  musicStyle TEXT,
  rating NUMERIC,
  reviewCount INTEGER,
  likedAt TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.profilepicture,
    u.location,
    u.role,
    u.subcategory,
    u."subCategory",
    u."musicStyle",
    u.rating,
    u."reviewCount",
    ul."createdAt" as likedAt
  FROM "UserLikes" ul
  JOIN "User" u ON ul."toUserId" = u.id
  WHERE ul."fromUserId" = user_id
  ORDER BY ul."createdAt" DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour obtenir les utilisateurs qui ont liké un profil
CREATE OR REPLACE FUNCTION get_users_who_liked(
  target_user_id UUID,
  page_size INTEGER DEFAULT 20,
  page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  profilepicture TEXT,
  role TEXT,
  likedAt TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.profilepicture,
    u.role,
    ul."createdAt" as likedAt
  FROM "UserLikes" ul
  JOIN "User" u ON ul."fromUserId" = u.id
  WHERE ul."toUserId" = target_user_id
  ORDER BY ul."createdAt" DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- 9. Vue pour les statistiques de likes (optionnel, pour l'admin)
CREATE OR REPLACE VIEW user_likes_stats AS
SELECT 
  u.id,
  u.name,
  u.role,
  u."likeCount" as likes_received,
  (SELECT COUNT(*) FROM "UserLikes" WHERE "fromUserId" = u.id) as likes_given,
  u."createdAt"
FROM "User" u
ORDER BY u."likeCount" DESC;

-- 10. Politique RLS pour permettre la lecture du compteur de likes
CREATE POLICY "Users can view like counts" ON "User"
  FOR SELECT USING (true);

-- Commentaires pour la documentation
COMMENT ON COLUMN "User"."likeCount" IS 'Nombre de likes reçus par l''utilisateur (mis à jour automatiquement)';
COMMENT ON FUNCTION update_user_like_count() IS 'Fonction trigger pour maintenir automatiquement le compteur de likes';
COMMENT ON FUNCTION get_liked_profiles(UUID, INTEGER, INTEGER) IS 'Fonction pour récupérer les profils likés avec pagination';
COMMENT ON FUNCTION get_users_who_liked(UUID, INTEGER, INTEGER) IS 'Fonction pour récupérer les utilisateurs qui ont liké un profil';
COMMENT ON VIEW user_likes_stats IS 'Vue pour les statistiques de likes (admin)'; 