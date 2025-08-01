-- =====================================================
-- DIAGNOSTIC ET CORRECTION DES PROBLÈMES D'UPLOAD D'IMAGES
-- =====================================================

-- 1. Vérifier la structure de la table User
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('profilepicture', 'galleryimages', 'galleryVideo')
ORDER BY ordinal_position;

-- 2. Vérifier les permissions RLS sur la table User
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
WHERE tablename = 'User';

-- 3. Vérifier les buckets de stockage existants
-- (Cette requête nécessite des permissions admin sur Supabase)
-- SELECT * FROM storage.buckets WHERE name = 'avatars';

-- 4. Vérifier les politiques de stockage
-- SELECT * FROM storage.policies WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars');

-- 5. Nettoyer les URLs de profil invalides
UPDATE "User" 
SET profilepicture = NULL 
WHERE profilepicture IS NOT NULL 
AND (
    profilepicture = '' OR 
    profilepicture NOT LIKE 'http%' OR
    profilepicture LIKE '%undefined%' OR
    profilepicture LIKE '%null%'
);

-- 6. Nettoyer les galeries d'images invalides
UPDATE "User" 
SET galleryimages = NULL 
WHERE galleryimages IS NOT NULL 
AND (
    galleryimages = '{}' OR 
    galleryimages = '[]' OR
    galleryimages @> '[""]' OR
    galleryimages @> '["undefined"]' OR
    galleryimages @> '["null"]'
);

-- 7. Vérifier les utilisateurs avec des données d'image problématiques
SELECT 
    id,
    name,
    email,
    profilepicture,
    galleryimages,
    galleryVideo,
    createdat
FROM "User" 
WHERE 
    profilepicture IS NOT NULL OR 
    galleryimages IS NOT NULL OR 
    galleryVideo IS NOT NULL
ORDER BY createdat DESC
LIMIT 20;

-- 8. Statistiques sur les uploads d'images
SELECT 
    COUNT(*) as total_users,
    COUNT(profilepicture) as users_with_profile_pic,
    COUNT(galleryimages) as users_with_gallery,
    COUNT(galleryVideo) as users_with_video,
    ROUND(
        (COUNT(profilepicture)::float / COUNT(*)::float) * 100, 2
    ) as profile_pic_percentage
FROM "User";

-- 9. Créer une politique RLS pour permettre l'upload d'images (si nécessaire)
-- DROP POLICY IF EXISTS "Users can update their own profile" ON "User";
-- CREATE POLICY "Users can update their own profile" ON "User"
--     FOR UPDATE USING (auth.uid() = id)
--     WITH CHECK (auth.uid() = id);

-- 10. Vérifier les contraintes de la table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'User'::regclass;

-- 11. Optimiser les index pour les requêtes d'upload
-- CREATE INDEX IF NOT EXISTS idx_user_profilepicture ON "User"(profilepicture) WHERE profilepicture IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_user_galleryimages ON "User" USING GIN(galleryimages) WHERE galleryimages IS NOT NULL;

-- 12. Vérifier les logs d'erreur récents (nécessite des permissions admin)
-- SELECT * FROM pg_stat_activity 
-- WHERE query LIKE '%User%' 
-- AND state = 'active' 
-- ORDER BY query_start DESC;

-- =====================================================
-- REQUÊTES DE DIAGNOSTIC SUPPLÉMENTAIRES
-- =====================================================

-- A. Vérifier les utilisateurs récents avec des erreurs d'upload
SELECT 
    id,
    name,
    email,
    profilepicture,
    createdat,
    CASE 
        WHEN profilepicture IS NULL THEN 'Aucune photo'
        WHEN profilepicture LIKE 'http%' THEN 'URL valide'
        ELSE 'URL invalide'
    END as profile_status
FROM "User" 
WHERE createdat >= NOW() - INTERVAL '7 days'
ORDER BY createdat DESC;

-- B. Identifier les patterns d'erreur dans les URLs
SELECT 
    profilepicture,
    COUNT(*) as count
FROM "User" 
WHERE profilepicture IS NOT NULL 
AND profilepicture NOT LIKE 'http%'
GROUP BY profilepicture
ORDER BY count DESC
LIMIT 10;

-- C. Vérifier la cohérence des données
SELECT 
    'profilepicture' as field,
    COUNT(*) as total,
    COUNT(CASE WHEN profilepicture IS NOT NULL THEN 1 END) as not_null,
    COUNT(CASE WHEN profilepicture LIKE 'http%' THEN 1 END) as valid_urls
FROM "User"
UNION ALL
SELECT 
    'galleryimages' as field,
    COUNT(*) as total,
    COUNT(CASE WHEN galleryimages IS NOT NULL THEN 1 END) as not_null,
    COUNT(CASE WHEN galleryimages != '[]' THEN 1 END) as non_empty
FROM "User"; 