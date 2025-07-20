-- Ajouter la colonne serviceDescription à la table User
ALTER TABLE "User" ADD COLUMN "serviceDescription" TEXT;

-- Mettre à jour les politiques RLS si nécessaire
-- (Les politiques existantes devraient déjà couvrir cette nouvelle colonne) 