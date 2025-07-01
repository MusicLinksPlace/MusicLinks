-- Ajouter la colonne isAdmin à la table User
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN DEFAULT FALSE;

-- Mettre à jour l'email admin
UPDATE "User" SET "isAdmin" = TRUE WHERE email = 'musiclinksplatform@gmail.com';

-- Créer une vue pour les IDs admin (à faire une seule fois)
CREATE OR REPLACE VIEW admin_ids AS
  SELECT id FROM "User" WHERE "isAdmin" = TRUE;

-- Supprimer les anciennes politiques problématiques si elles existent
DROP POLICY IF EXISTS "Admins can view all users" ON "User";
DROP POLICY IF EXISTS "Admins can update all users" ON "User";

-- Politique RLS simple pour permettre aux admins de voir tous les utilisateurs
-- Utilise une approche différente pour éviter la récursion
CREATE POLICY "Admins can view all users" ON "User"
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_ids)
  );

-- Politique RLS simple pour permettre aux admins de modifier tous les utilisateurs
CREATE POLICY "Admins can update all users" ON "User"
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_ids)
  );

-- Politique RLS pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (
    auth.uid() = id
  );

-- Politique RLS pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Politique RLS pour permettre l'insertion de nouveaux utilisateurs
CREATE POLICY "Users can insert own profile" ON "User"
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Politique RLS pour permettre la lecture publique des profils vérifiés et actifs
CREATE POLICY "Public can view verified active users" ON "User"
  FOR SELECT USING (
    verified = 1 AND disabled = 0
  );
