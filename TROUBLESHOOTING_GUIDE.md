# 🔧 Guide de Dépannage - Authentification

## 🚨 Erreurs Courantes

### 1. "column does not exist"
**Erreur** : `ERROR: 42703: column "subcategory" of relation "User" does not exist`

**Cause** : PostgreSQL est sensible à la casse

**Solution** :
```sql
-- ❌ Incorrect
subCategory

-- ✅ Correct
"subCategory"
```

### 2. "unterminated dollar-quoted string"
**Erreur** : `ERROR: 42601: unterminated dollar-quoted string`

**Cause** : Conflit avec la syntaxe `$$`

**Solution** :
```sql
-- ❌ Incorrect
$$ BEGIN ... END; $$

-- ✅ Correct
$func$ BEGIN ... END; $func$
```

### 3. "Email not confirmed"
**Erreur** : `AuthApiError: Email not confirmed`

**Cause** : Utilisateur pas connecté après inscription

**Solutions** :
1. Vérifier configuration Supabase Dashboard
2. S'assurer que "Enable email confirmations" est activé
3. Vérifier les URLs de redirection

### 4. "verified = 0"
**Cause** : Trigger de synchronisation pas exécuté

**Solutions** :
```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Recréer le trigger si nécessaire
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();
```

### 5. "new row violates row-level security policy"
**Cause** : Politiques RLS trop restrictives

**Solution** :
```sql
-- Désactiver RLS temporairement
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Ou créer une politique permissive
CREATE POLICY "Allow all" ON "User" FOR ALL USING (true) WITH CHECK (true);
```

## 🔍 Diagnostic

### 1. Vérifier la Synchronisation
```sql
-- Compter les utilisateurs
SELECT 
    'Synchronisation' as info,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM "User") as public_users,
    (SELECT COUNT(*) FROM "User" WHERE verified = 1) as verified_users;
```

### 2. Vérifier les Utilisateurs Non Synchronisés
```sql
-- Utilisateurs dans auth.users mais pas dans User
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN "User" u ON au.id = u.id
WHERE u.id IS NULL;
```

### 3. Vérifier les Politiques RLS
```sql
-- Lister les politiques
SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'User';
```

### 4. Vérifier les Triggers
```sql
-- Lister les triggers
SELECT 
    trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
```

## 🛠️ Solutions Rapides

### Reset Complet
```sql
-- 1. Désactiver RLS
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques
DROP POLICY IF EXISTS "Allow all" ON "User";
DROP POLICY IF EXISTS "Allow authenticated users" ON "User";

-- 3. Créer une politique simple
CREATE POLICY "Allow all" ON "User" FOR ALL USING (true) WITH CHECK (true);

-- 4. Réactiver RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
```

### Forcer la Synchronisation
```sql
-- Synchroniser tous les utilisateurs existants
INSERT INTO "User" (
    id, email, name, verified, disabled, role, "subCategory", created_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END,
    0, NULL, NULL, au.created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = au.id);
```

### Nettoyer les Données de Test
```sql
-- Supprimer les utilisateurs de test
DELETE FROM "User" WHERE email LIKE '%test%' OR email LIKE '%example%';
DELETE FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%example%';
```

## 📊 Logs de Debug

### Frontend (Console Navigateur)
```
🔐 Starting simple signup process
✅ Supabase Auth user created
📧 Email de confirmation envoyé
🌐 CALLBACK - Page chargée
✅ CALLBACK - Session trouvée
📧 CALLBACK - Email confirmé
✅ CALLBACK - Statut verified mis à jour
```

### Backend (Supabase Logs)
- Vérifier les logs d'authentification
- Vérifier les erreurs de base de données
- Vérifier les exécutions de triggers

## ⚡ Commandes de Test

### Test d'Inscription
1. Aller sur `/signup`
2. Remplir le formulaire
3. Vérifier les logs dans la console
4. Vérifier la création dans `auth.users`
5. Vérifier la synchronisation dans `User`

### Test de Confirmation
1. Cliquer sur le lien email
2. Vérifier la redirection vers `/auth/callback`
3. Vérifier la mise à jour `verified = 1`
4. Vérifier la redirection vers `/signup/continue`

### Test d'Onboarding
1. Sélectionner un rôle
2. Sélectionner une sous-catégorie (si nécessaire)
3. Vérifier la mise à jour dans `User`
4. Vérifier la redirection vers `/mon-compte`

## 🔄 Processus de Récupération

### Si Tout est Cassé
1. **Exécuter** `sync_auth_database.sql`
2. **Vérifier** la synchronisation
3. **Tester** l'inscription
4. **Vérifier** les logs

### Si Seulement la Synchronisation
1. **Recréer** le trigger
2. **Forcer** la synchronisation
3. **Vérifier** les résultats

### Si Seulement les Politiques RLS
1. **Désactiver** RLS temporairement
2. **Créer** une politique permissive
3. **Réactiver** RLS

## 📞 Support

### Informations à Fournir
1. Message d'erreur exact
2. Logs de la console
3. État des tables (`auth.users` et `User`)
4. Configuration Supabase
5. Étapes pour reproduire

### Fichiers de Log
- Console du navigateur
- Logs Supabase
- Résultats des requêtes SQL de diagnostic

---

**💡 Conseil** : Toujours commencer par vérifier la synchronisation et les politiques RLS !
