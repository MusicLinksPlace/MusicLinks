-- Fix simple - Desactiver RLS sur toutes les tables
-- Script sans caracteres speciaux

-- 1. Desactiver RLS sur toutes les tables principales
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can insert own profile" ON "User";
DROP POLICY IF EXISTS "Users can delete own profile" ON "User";
DROP POLICY IF EXISTS "Enable read access for all users" ON "User";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "User";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "User";
DROP POLICY IF EXISTS "Enable delete for users based on id" ON "User";
DROP POLICY IF EXISTS "Allow all operations on User" ON "User";

DROP POLICY IF EXISTS "Users can view messages" ON "Message";
DROP POLICY IF EXISTS "Users can insert messages" ON "Message";
DROP POLICY IF EXISTS "Users can update messages" ON "Message";
DROP POLICY IF EXISTS "Users can delete messages" ON "Message";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Message";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "Message";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "Message";
DROP POLICY IF EXISTS "Enable delete for users based on id" ON "Message";
DROP POLICY IF EXISTS "Allow all operations on Message" ON "Message";

DROP POLICY IF EXISTS "Users can view reviews" ON "Review";
DROP POLICY IF EXISTS "Users can insert reviews" ON "Review";
DROP POLICY IF EXISTS "Users can update reviews" ON "Review";
DROP POLICY IF EXISTS "Users can delete reviews" ON "Review";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Review";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "Review";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "Review";
DROP POLICY IF EXISTS "Enable delete for users based on id" ON "Review";
DROP POLICY IF EXISTS "Allow all operations on Review" ON "Review";

DROP POLICY IF EXISTS "Users can view projects" ON "Project";
DROP POLICY IF EXISTS "Users can insert projects" ON "Project";
DROP POLICY IF EXISTS "Users can update projects" ON "Project";
DROP POLICY IF EXISTS "Users can delete projects" ON "Project";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Project";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "Project";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "Project";
DROP POLICY IF EXISTS "Enable delete for users based on id" ON "Project";
DROP POLICY IF EXISTS "Allow all operations on Project" ON "Project";

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow everything on storage objects" ON storage.objects;

-- 3. Creer des politiques permissives
CREATE POLICY "Allow everything on User" ON "User"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow everything on Message" ON "Message"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow everything on Review" ON "Review"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow everything on Project" ON "Project"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow everything on storage objects" ON storage.objects
FOR ALL USING (true) WITH CHECK (true);

-- 4. Verifier que RLS est desactive
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('User', 'Message', 'Review', 'Project') 
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename;

-- 5. Verifier les politiques
SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies 
WHERE tablename IN ('User', 'Message', 'Review', 'Project') 
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename; 