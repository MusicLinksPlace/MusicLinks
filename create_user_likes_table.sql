-- Création de la table UserLikes pour gérer les likes entre utilisateurs
CREATE TABLE IF NOT EXISTS "UserLikes" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "fromUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "toUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("fromUserId", "toUserId")
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "UserLikes_fromUserId_idx" ON "UserLikes"("fromUserId");
CREATE INDEX IF NOT EXISTS "UserLikes_toUserId_idx" ON "UserLikes"("toUserId");
CREATE INDEX IF NOT EXISTS "UserLikes_createdAt_idx" ON "UserLikes"("createdAt");

-- Politique RLS pour la sécurité
ALTER TABLE "UserLikes" ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres likes
CREATE POLICY "Users can view their own likes" ON "UserLikes"
    FOR SELECT USING (auth.uid() = "fromUserId");

-- Politique pour permettre aux utilisateurs de créer leurs propres likes
CREATE POLICY "Users can create their own likes" ON "UserLikes"
    FOR INSERT WITH CHECK (auth.uid() = "fromUserId");

-- Politique pour permettre aux utilisateurs de supprimer leurs propres likes
CREATE POLICY "Users can delete their own likes" ON "UserLikes"
    FOR DELETE USING (auth.uid() = "fromUserId");

-- Politique pour permettre aux utilisateurs de voir combien de likes ils ont reçus
CREATE POLICY "Users can view likes they received" ON "UserLikes"
    FOR SELECT USING (auth.uid() = "toUserId");

-- Commentaire sur la table
COMMENT ON TABLE "UserLikes" IS 'Table pour gérer les likes entre utilisateurs';
COMMENT ON COLUMN "UserLikes"."fromUserId" IS 'ID de l''utilisateur qui like';
COMMENT ON COLUMN "UserLikes"."toUserId" IS 'ID de l''utilisateur liké';
COMMENT ON COLUMN "UserLikes"."createdAt" IS 'Date de création du like'; 