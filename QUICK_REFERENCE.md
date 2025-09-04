# ⚡ Référence Rapide - Authentification

## 🚨 Erreurs Courantes & Solutions

### 1. "column does not exist"
```sql
-- ❌ Incorrect
subCategory

-- ✅ Correct  
"subCategory"
```

### 2. "unterminated dollar-quoted string"
```sql
-- ❌ Incorrect
$$ BEGIN ... END; $$

-- ✅ Correct
$func$ BEGIN ... END; $func$
```

### 3. "Email not confirmed"
- Vérifier configuration Supabase Dashboard
- S'assurer que "Enable email confirmations" est activé

## 🔧 Scripts SQL Essentiels

### Synchronisation Complète
```sql
-- Exécuter sync_auth_database.sql
-- Contient : trigger, politiques RLS, synchronisation
```

### Nettoyage Rapide
```sql
-- Désactiver RLS
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Politique simple
CREATE POLICY "Allow all" ON "User" FOR ALL USING (true) WITH CHECK (true);

-- Réactiver RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
```

### Vérification
```sql
-- Compter les utilisateurs
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM "User") as public_users,
    (SELECT COUNT(*) FROM "User" WHERE verified = 1) as verified_users;
```

## 📋 Structure Table User

```sql
-- Colonnes principales (avec casse exacte)
id: uuid (PK)
email: text
name: text
verified: int4 (0/1)
disabled: int4 (0/1)
role: text
"subCategory": text  -- ⚠️ Avec guillemets !
created_at: timestamp
```

## 🔄 Flux d'Authentification

```
1. Inscription → auth.users + User (via trigger)
2. Email confirmation → /auth/callback
3. Callback → verified = 1 (via trigger)
4. Redirection → /signup/continue
5. Onboarding → role + subCategory
6. Finalisation → /mon-compte
```

## ⚙️ Configuration Supabase

### URLs
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/auth/callback`

### Auth Settings
- Enable email confirmations: ✅
- Enable phone confirmations: ❌

## 🐛 Debug

### Logs à Surveiller
- `🔐 Starting simple signup process`
- `✅ Supabase Auth user created`
- `📧 Email de confirmation envoyé`
- `🌐 CALLBACK - Page chargée`
- `✅ CALLBACK - Session trouvée`

### Vérifications
1. Utilisateur dans `auth.users` ?
2. Utilisateur dans `User` ?
3. `verified = 1` ?
4. Trigger fonctionne ?
5. Politiques RLS OK ?

---

**💡 Rappel** : Toujours utiliser `"subCategory"` avec guillemets !
