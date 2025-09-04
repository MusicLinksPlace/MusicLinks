# 🔐 Documentation Authentification & Base de Données

## 📋 Structure de la Base de Données

### Table `auth.users` (Supabase Auth)
```sql
-- Table gérée par Supabase Auth
id: uuid (PK)
email: text
email_confirmed_at: timestamp
created_at: timestamp
raw_user_meta_data: jsonb
```

### Table `User` (Publique)
```sql
-- Table publique avec les noms EXACTS des colonnes
id: uuid (PK)                    -- Clé primaire
email: text                      -- Email utilisateur
name: text                       -- Nom complet
verified: int4                   -- 0 = non vérifié, 1 = vérifié
disabled: int4                   -- 0 = actif, 1 = désactivé
role: text                       -- 'artist', 'provider', 'partner'
subCategory: text                -- Sous-catégorie (avec C majuscule)
bio: text                        -- Biographie
location: text                   -- Localisation
profilepicture: text             -- URL photo de profil
galleryimages: _text             -- Array d'images
created_at: timestamp            -- Date de création
portfolio_url: text              -- Lien portfolio
social_links: _text              -- Array de liens sociaux
musicStyle: text                 -- Style musical
galleryVideo: text               -- Vidéo de galerie
star: int2                       -- Note étoiles
isAdmin: bool                    -- Admin ou non
price: numeric                   -- Prix
serviceDescription: text         -- Description du service
likeCount: int4                  -- Nombre de likes
```

## 🔄 Synchronisation Automatique

### Trigger de Synchronisation
```sql
-- Fonction de synchronisation
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $func$
BEGIN
    INSERT INTO "User" (
        id, email, name, verified, disabled, role, "subCategory", created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END,
        0, NULL, NULL, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        verified = CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();
```

## 🚨 Points Critiques à Retenir

### 1. **Casse des Colonnes PostgreSQL**
- ✅ **Correct** : `"subCategory"` (avec guillemets)
- ❌ **Incorrect** : `subCategory` (sans guillemets)
- ❌ **Incorrect** : `subcategory` (tout minuscule)

### 2. **Syntaxe Dollar-Quoted Strings**
- ✅ **Correct** : `$func$ ... $func$`
- ❌ **Incorrect** : `$$ ... $$` (peut causer des conflits)

### 3. **Noms de Colonnes Sensibles à la Casse**
```sql
-- Colonnes qui nécessitent des guillemets
"subCategory"    -- Pas subCategory
"createdAt"      -- Pas createdAt (si utilisé)
"updatedAt"      -- Pas updatedAt (si utilisé)
```

## 🔧 Configuration Supabase

### URLs de Redirection
```
Site URL: http://localhost:5173
Redirect URLs:
- http://localhost:5173/auth/callback
- http://localhost:5173/signup/continue
- http://localhost:5173/
```

### Paramètres d'Authentification
- ✅ **Enable email confirmations** : Activé
- ✅ **Enable phone confirmations** : Désactivé
- ✅ **Enable email change** : Activé

## 📝 Flux d'Authentification

### 1. Inscription
```
1. Utilisateur remplit le formulaire
2. authServiceSimple.signUp() appelé
3. Utilisateur créé dans auth.users
4. Trigger synchronise vers User
5. Email de confirmation envoyé
6. Redirection vers /signup/continue
```

### 2. Confirmation d'Email
```
1. Utilisateur clique sur le lien email
2. Redirection vers /auth/callback
3. Callback vérifie la session
4. Trigger met à jour verified = 1
5. Redirection vers /signup/continue
```

### 3. Onboarding
```
1. Page /signup/continue
2. Sélection du rôle
3. Sélection de la sous-catégorie (si nécessaire)
4. Mise à jour de la table User
5. Redirection vers /mon-compte
```

## 🐛 Dépannage Courant

### Erreur : "column does not exist"
- **Cause** : Casse incorrecte des colonnes
- **Solution** : Utiliser des guillemets `"subCategory"`

### Erreur : "unterminated dollar-quoted string"
- **Cause** : Conflit avec `$$`
- **Solution** : Utiliser `$func$` ou `$trigger$`

### Erreur : "Email not confirmed"
- **Cause** : Utilisateur pas connecté après inscription
- **Solution** : Vérifier la configuration Supabase

### Erreur : "verified = 0"
- **Cause** : Trigger pas exécuté
- **Solution** : Vérifier que le trigger existe et fonctionne

## 📁 Fichiers Importants

### Scripts SQL
- `sync_auth_database.sql` - Synchronisation complète
- `clean_auth_simple.sql` - Nettoyage simple
- `disable_email_confirmation.sql` - Désactiver confirmation email

### Code Frontend
- `src/lib/authServiceSimple.ts` - Service d'authentification
- `src/pages/auth/callback.tsx` - Gestion callback email
- `src/pages/SignUpContinue.tsx` - Page onboarding

## ✅ Checklist de Vérification

### Avant de Déployer
- [ ] Trigger de synchronisation créé
- [ ] Politiques RLS configurées
- [ ] URLs de redirection correctes
- [ ] Noms de colonnes avec guillemets
- [ ] Test d'inscription complet

### Après Déploiement
- [ ] Test inscription nouvel utilisateur
- [ ] Test confirmation email
- [ ] Test onboarding complet
- [ ] Test connexion existant
- [ ] Vérification synchronisation tables

## 🔍 Commandes de Vérification

### Vérifier la Synchronisation
```sql
SELECT 
    'Synchronisation' as info,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM "User") as public_users,
    (SELECT COUNT(*) FROM "User" WHERE verified = 1) as verified_users;
```

### Vérifier les Utilisateurs Récents
```sql
SELECT 
    u.id, u.email, u.name, u.verified, u.role, u.created_at
FROM "User" u
ORDER BY u.created_at DESC 
LIMIT 5;
```

### Vérifier les Politiques RLS
```sql
SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'User';
```

## 🚀 Commandes Rapides

### Nettoyer et Resynchroniser
```sql
-- Désactiver RLS
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Supprimer politiques
DROP POLICY IF EXISTS "Allow authenticated users" ON "User";

-- Recréer politique
CREATE POLICY "Allow authenticated users" ON "User"
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Réactiver RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
```

### Forcer la Synchronisation
```sql
-- Synchroniser tous les utilisateurs existants
INSERT INTO "User" (id, email, name, verified, disabled, role, "subCategory", created_at)
SELECT 
    au.id, au.email, COALESCE(au.raw_user_meta_data->>'name', au.email),
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END,
    0, NULL, NULL, au.created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = au.id);
```

---

**💡 Conseil** : Toujours vérifier la casse des colonnes et utiliser des guillemets pour les noms avec casse mixte !
