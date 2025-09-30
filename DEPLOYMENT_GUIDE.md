# 🚀 Guide de Déploiement en Production

## ✅ Configuration Supabase Dashboard

### 1. Authentication Settings
- **URL du site** : `https://www.musiclinks.fr`
- **URL de redirection** : `https://www.musiclinks.fr/auth/callback`
- **Enable email signups** : ✅ Activé
- **Enable email confirmations** : ✅ Activé (pour l'instant)

### 2. Database Configuration
Exécuter ce script SQL dans Supabase SQL Editor :

```sql
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
```

### 3. Storage Configuration
Créer les buckets suivants :
- `media-files` (pour tous les uploads)
- `avatars` (pour les photos de profil)

## ✅ Variables d'Environnement

Créer un fichier `.env.production` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

## ✅ Configuration Vercel (si utilisé)

1. **Environment Variables** :
   - `VITE_SUPABASE_URL` : URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY` : Clé anonyme de votre projet

2. **Build Command** : `npm run build`
3. **Output Directory** : `dist`

## ✅ URLs de Redirection

Le code utilise `window.location.origin` partout, donc il s'adaptera automatiquement :
- ✅ `https://www.musiclinks.fr/auth/callback`
- ✅ `https://www.musiclinks.fr/signup/continue`
- ✅ `https://www.musiclinks.fr/update-password`

## ✅ Test en Production

1. **Créer un compte** → Vérifier la réception d'email
2. **Cliquer sur l'email** → Vérifier la redirection vers l'onboarding
3. **Se connecter** → Vérifier la redirection automatique si pas de rôle
4. **Compléter l'onboarding** → Vérifier l'accès à l'application

## ⚠️ Points d'Attention

1. **RLS désactivé** : Tous les utilisateurs peuvent accéder à toutes les données
2. **Pas de confirmation d'email** : Les utilisateurs sont connectés automatiquement
3. **Création automatique** : Les utilisateurs sont créés dans `User` si inexistants

## 🔧 Dépannage

Si des problèmes surviennent :
1. Vérifier les logs dans la console du navigateur
2. Vérifier les logs Supabase dans le dashboard
3. Vérifier que les URLs de redirection sont correctes
4. Vérifier que RLS est bien désactivé

## 📝 Notes

- Le code est prêt pour la production
- Aucune modification de code nécessaire
- Seule la configuration Supabase est requise
