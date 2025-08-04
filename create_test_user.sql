-- Créer un utilisateur de test et simplifier l'authentification
-- Ce script crée un utilisateur de test et désactive toutes les restrictions

-- 1. Créer un utilisateur de test dans la table User
INSERT INTO "User" (id, email, name, role, verified, disabled, createdat)
VALUES (
  'test-user-123',
  'test@musiclinks.com',
  'Utilisateur Test',
  'artist',
  1,
  0,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer un autre utilisateur de test
INSERT INTO "User" (id, email, name, role, verified, disabled, createdat)
VALUES (
  'test-user-456',
  'test2@musiclinks.com',
  'Utilisateur Test 2',
  'provider',
  1,
  0,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Désactiver complètement RLS sur toutes les tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" DISABLE ROW LEVEL SECURITY;

-- 4. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can insert own profile" ON "User";
DROP POLICY IF EXISTS "Users can delete own profile" ON "User";
DROP POLICY IF EXISTS "Enable read access for all users" ON "User";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "User";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "User";
DROP POLICY IF EXISTS "Enable delete for users based on id" ON "User";

-- 5. Créer des politiques permissives pour permettre tout accès
CREATE POLICY "Allow all operations on User" ON "User"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on Message" ON "Message"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on Review" ON "Review"
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on Project" ON "Project"
FOR ALL USING (true) WITH CHECK (true);

-- 6. Vérifier que les utilisateurs de test sont créés
SELECT id, email, name, role FROM "User" WHERE id IN ('test-user-123', 'test-user-456');

-- 7. Créer un message de test
INSERT INTO "Message" (id, senderId, receiverId, content, createdAt)
VALUES (
  'test-message-123',
  'test-user-123',
  'test-user-456',
  'Message de test',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Vérifier que le message est créé
SELECT * FROM "Message" WHERE id = 'test-message-123'; 