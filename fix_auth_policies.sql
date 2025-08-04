-- Supprimer toutes les politiques RLS restrictives pour permettre la connexion
-- ATTENTION: Ceci supprime les restrictions de sécurité

-- 1. Supprimer les politiques RLS sur la table User
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can insert own profile" ON "User";
DROP POLICY IF EXISTS "Users can delete own profile" ON "User";
DROP POLICY IF EXISTS "Enable read access for all users" ON "User";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "User";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "User";
DROP POLICY IF EXISTS "Enable delete for users based on id" ON "User";

-- 2. Désactiver RLS sur la table User pour permettre l'accès complet
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer les politiques RLS sur la table Message
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON "Message";
DROP POLICY IF EXISTS "Users can insert messages" ON "Message";
DROP POLICY IF EXISTS "Users can update their own messages" ON "Message";
DROP POLICY IF EXISTS "Users can delete their own messages" ON "Message";

-- 4. Désactiver RLS sur la table Message
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;

-- 5. Supprimer les politiques RLS sur la table Review
DROP POLICY IF EXISTS "Users can view all reviews" ON "Review";
DROP POLICY IF EXISTS "Users can insert reviews" ON "Review";
DROP POLICY IF EXISTS "Users can update their own reviews" ON "Review";
DROP POLICY IF EXISTS "Users can delete their own reviews" ON "Review";

-- 6. Désactiver RLS sur la table Review
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;

-- 7. Supprimer les politiques RLS sur la table Project
DROP POLICY IF EXISTS "Users can view all projects" ON "Project";
DROP POLICY IF EXISTS "Users can insert projects" ON "Project";
DROP POLICY IF EXISTS "Users can update their own projects" ON "Project";
DROP POLICY IF EXISTS "Users can delete their own projects" ON "Project";

-- 8. Désactiver RLS sur la table Project
ALTER TABLE "Project" DISABLE ROW LEVEL SECURITY;

-- 9. Permettre l'accès public à tous les buckets de stockage
-- Supprimer toutes les politiques restrictives sur storage.objects
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own gallery images" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload user videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to user videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own user videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own user videos" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own attachments" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own media files" ON storage.objects;

-- 10. Créer des politiques permissives pour le stockage
CREATE POLICY "Allow all operations on storage" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- 11. Vérifier que l'authentification Supabase est configurée correctement
-- Cette requête devrait retourner tous les utilisateurs
SELECT id, email, name, role FROM "User" LIMIT 10; 