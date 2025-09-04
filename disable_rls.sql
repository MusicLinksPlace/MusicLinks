-- Désactiver RLS sur toutes les tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "UserLikes" DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques
DROP POLICY IF EXISTS "Allow all" ON "User";
DROP POLICY IF EXISTS "Allow authenticated users" ON "User";
DROP POLICY IF EXISTS "Allow all operations" ON "User";
DROP POLICY IF EXISTS "Allow all" ON "Message";
DROP POLICY IF EXISTS "Allow authenticated users" ON "Message";
DROP POLICY IF EXISTS "Allow all operations" ON "Message";
DROP POLICY IF EXISTS "Allow all" ON "UserLikes";
DROP POLICY IF EXISTS "Allow authenticated users" ON "UserLikes";
DROP POLICY IF EXISTS "Allow all operations" ON "UserLikes";

-- Vérifier la configuration
SELECT 'RLS disabled on all tables' as status;
