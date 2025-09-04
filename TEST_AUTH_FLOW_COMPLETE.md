# 🧪 Test Complet du Flux d'Authentification

## 📋 Prérequis

1. **Exécuter le script SQL** : `fix_auth_flow_complete.sql` dans Supabase
2. **Vérifier la configuration Supabase** :
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/auth/callback`, `http://localhost:5173/signup/continue`, `http://localhost:5173/`

## 🔄 Test du Flux Complet

### 1. Test d'Inscription

1. **Aller sur** `http://localhost:5173/signup`
2. **Remplir le formulaire** :
   - Email: `test@example.com`
   - Mot de passe: `password123`
   - Nom: `Test User`
3. **Cliquer sur "S'inscrire"**
4. **Vérifier** :
   - ✅ Message "Vérifiez votre email"
   - ✅ Email reçu dans la boîte de réception
   - ✅ Utilisateur créé dans la table `User` avec `verified: 0`

### 2. Test de Confirmation d'Email

1. **Ouvrir l'email** reçu
2. **Cliquer sur le lien** de confirmation
3. **Vérifier la redirection** :
   - ✅ URL: `http://localhost:5173/auth/callback`
   - ✅ Puis redirection vers `http://localhost:5173/signup/continue`
4. **Vérifier dans la base** :
   - ✅ `verified: 1` dans la table `User`
   - ✅ Session Supabase active

### 3. Test de l'Onboarding

1. **Sur la page** `/signup/continue`
2. **Sélectionner un rôle** (ex: Artiste)
3. **Si prestataire/partenaire** : sélectionner une sous-catégorie
4. **Vérifier** :
   - ✅ Redirection vers `/mon-compte`
   - ✅ `role` et `subCategory` mis à jour dans la base
   - ✅ Utilisateur connecté et authentifié

### 4. Test de Connexion

1. **Se déconnecter**
2. **Aller sur** `http://localhost:5173/login`
3. **Se connecter** avec les mêmes identifiants
4. **Vérifier** :
   - ✅ Redirection vers `/`
   - ✅ Utilisateur connecté et authentifié

## 🐛 Dépannage

### Problème : "Pas de session Supabase"
- **Cause** : Problème de configuration des URLs de redirection
- **Solution** : Vérifier la configuration Supabase Dashboard

### Problème : "Profil utilisateur non trouvé"
- **Cause** : Synchronisation entre `auth.users` et `User` échouée
- **Solution** : Exécuter le script SQL de synchronisation

### Problème : "Redirection vers /login"
- **Cause** : Session expirée ou invalide
- **Solution** : Vérifier les logs dans la console du navigateur

## 📊 Vérifications dans Supabase

### Table `User`
```sql
SELECT id, email, name, verified, role, "subCategory", disabled 
FROM "User" 
ORDER BY created_at DESC 
LIMIT 5;
```

### Table `auth.users`
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🔍 Logs à Surveiller

### Console du Navigateur
- `🔐 Starting simple signup process`
- `✅ Supabase Auth user created`
- `📧 Email de confirmation envoyé`
- `🌐 AuthCallback - Page chargée`
- `✅ AuthCallback - Session valide trouvée`
- `➡️ AuthCallback - Redirection vers /signup/continue`

### Console Supabase
- Vérifier les logs d'authentification
- Vérifier les erreurs de base de données

## ✅ Checklist de Validation

- [ ] Inscription fonctionne
- [ ] Email de confirmation reçu
- [ ] Clic sur le lien redirige vers `/auth/callback`
- [ ] Redirection vers `/signup/continue`
- [ ] Onboarding fonctionne
- [ ] Redirection vers `/mon-compte`
- [ ] Connexion fonctionne
- [ ] Utilisateur reste connecté

## 🚨 En Cas de Problème

1. **Vérifier les logs** dans la console du navigateur
2. **Vérifier la configuration** Supabase
3. **Exécuter le script SQL** de correction
4. **Nettoyer les données de test** si nécessaire
5. **Redémarrer le serveur** de développement
