-- =====================================================
-- TEST DE LA CONFIGURATION DES LIKES
-- =====================================================

-- 1. Vérifier que la table UserLikes existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'UserLikes'
ORDER BY ordinal_position;

-- 2. Vérifier que la colonne likeCount existe dans User
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'likeCount';

-- 3. Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'UserLikes';

-- 4. Vérifier les triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'UserLikes';

-- 5. Vérifier les politiques RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'UserLikes';

-- 6. Vérifier les fonctions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_liked_profiles', 'get_users_who_liked', 'update_like_count');

-- 7. Test de la fonction get_liked_profiles (si des données existent)
-- SELECT * FROM get_liked_profiles('00000000-0000-0000-0000-000000000000') LIMIT 5;

-- 8. Vérifier les permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'UserLikes';

-- =====================================================
-- RÉSULTATS ATTENDUS
-- =====================================================
/*
1. Table UserLikes avec 4 colonnes : id, fromUserId, toUserId, createdAt
2. Colonne likeCount dans User (INTEGER, DEFAULT 0)
3. Index sur fromUserId, toUserId, createdAt
4. Triggers pour INSERT et DELETE
5. Politiques RLS pour SELECT, INSERT, DELETE
6. Fonctions get_liked_profiles, get_users_who_liked, update_like_count
7. Permissions pour authenticated users
*/ 