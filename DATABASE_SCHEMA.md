# 🗄️ Schéma de Base de Données

## Table `User` (Publique)

```sql
CREATE TABLE "User" (
    id uuid PRIMARY KEY,
    email text NOT NULL,
    name text,
    verified int4 DEFAULT 0,
    disabled int4 DEFAULT 0,
    role text,
    "subCategory" text,  -- ⚠️ Casse mixte - nécessite guillemets
    bio text,
    location text,
    profilepicture text,
    galleryimages _text,  -- Array de text
    created_at timestamp DEFAULT NOW(),
    portfolio_url text,
    social_links _text,   -- Array de text
    musicStyle text,
    galleryVideo text,
    star int2 DEFAULT 0,
    isAdmin bool DEFAULT false,
    price numeric,
    serviceDescription text,
    likeCount int4 DEFAULT 0
);
```

## Table `auth.users` (Supabase Auth)

```sql
-- Gérée automatiquement par Supabase
-- Structure interne :
id uuid PRIMARY KEY,
email text,
email_confirmed_at timestamp,
created_at timestamp,
raw_user_meta_data jsonb
```

## Relations

```
auth.users (1) ←→ (1) User
     ↓              ↓
   Supabase      Application
   Auth          Data
```

## Index Recommandés

```sql
-- Performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_verified ON "User"(verified);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_created_at ON "User"(created_at);
```

## Contraintes

```sql
-- Clé étrangère (optionnelle)
ALTER TABLE "User" 
ADD CONSTRAINT fk_user_auth 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## Politiques RLS

```sql
-- Politique permissive pour développement
CREATE POLICY "Allow authenticated users" ON "User"
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Politique plus restrictive pour production
CREATE POLICY "Users can manage own data" ON "User"
    FOR ALL USING (auth.uid() = id);
```

## Trigger de Synchronisation

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

## Types de Données

### PostgreSQL Types
- `uuid` - Identifiant unique
- `text` - Texte libre
- `int4` - Entier 32-bit
- `int2` - Entier 16-bit
- `bool` - Booléen
- `numeric` - Nombre décimal
- `timestamp` - Date/heure
- `_text` - Array de text

### Valeurs par Défaut
- `verified`: 0 (non vérifié), 1 (vérifié)
- `disabled`: 0 (actif), 1 (désactivé)
- `star`: 0-5 (note étoiles)
- `likeCount`: 0 (compteur de likes)
- `isAdmin`: false (pas admin par défaut)

## Rôles Utilisateurs

### Valeurs Possibles
- `artist` - Artiste
- `provider` - Prestataire de service
- `partner` - Partenaire stratégique

### Sous-catégories
- **Artist**: Pas de sous-catégorie
- **Provider**: Domaines + Spécialités
- **Partner**: Label, Manager

## Champs Sensibles à la Casse

```sql
-- ⚠️ Nécessitent des guillemets
"subCategory"    -- Pas subCategory
"createdAt"      -- Pas createdAt (si utilisé)
"updatedAt"      -- Pas updatedAt (si utilisé)
```

## Requêtes Utiles

### Vérifier la Synchronisation
```sql
SELECT 
    'Synchronisation' as info,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM "User") as public_users,
    (SELECT COUNT(*) FROM "User" WHERE verified = 1) as verified_users;
```

### Utilisateurs par Rôle
```sql
SELECT 
    role,
    COUNT(*) as count,
    COUNT(CASE WHEN verified = 1 THEN 1 END) as verified
FROM "User" 
GROUP BY role
ORDER BY count DESC;
```

### Utilisateurs Récents
```sql
SELECT 
    id, email, name, verified, role, "subCategory", created_at
FROM "User" 
ORDER BY created_at DESC 
LIMIT 10;
```

---

**💡 Important** : Toujours utiliser des guillemets pour les colonnes avec casse mixte !
