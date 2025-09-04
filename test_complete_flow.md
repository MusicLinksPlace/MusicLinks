# Test Complet du Flux d'Inscription

## 🎯 Objectif
Tester le flux complet : Inscription → Email de confirmation → Onboarding → Compte activé

## 📋 Étapes de Configuration

### 1. Exécuter le Script SQL
```bash
# Dans Supabase Dashboard → SQL Editor
# Copier et exécuter le contenu de fix_database_config.sql
```

### 2. Configurer les URLs Supabase
Dans **Supabase Dashboard** → **Authentication** → **URL Configuration** :

**Site URL :**
```
http://localhost:5173
```

**Redirect URLs :**
```
http://localhost:5173/auth/callback
http://localhost:5173/signup/continue
http://localhost:5173/
```

### 3. Vérifier les Templates d'Email
Dans **Authentication** → **Email Templates** → **Confirm signup** :
- Vérifier que le template est activé
- Vérifier que l'URL de redirection est : `{{ .ConfirmationURL }}`

## 🧪 Test du Flux

### Étape 1 : Inscription
1. Aller sur `http://localhost:5173/signup`
2. Remplir :
   - Email : `test@example.com`
   - Mot de passe : `password123`
   - Nom : `Test User`
3. Cliquer sur "Créer mon compte"
4. **Résultat attendu** : Message de succès + redirection vers page de confirmation

### Étape 2 : Vérification Email
1. Vérifier la boîte email `test@example.com`
2. Cliquer sur le lien de confirmation
3. **Résultat attendu** : Redirection vers `/signup/continue` (onboarding)

### Étape 3 : Onboarding
1. Sélectionner un rôle (Artiste, Prestataire, ou Partenaire)
2. Si Prestataire/Partenaire : Sélectionner une sous-catégorie
3. **Résultat attendu** : Redirection vers `/mon-compte` avec profil complet

## 📊 Vérifications

### Base de Données
```sql
-- Vérifier que l'utilisateur est créé
SELECT id, email, name, role, verified, disabled FROM "User" WHERE email = 'test@example.com';

-- Résultat attendu :
-- id: [UUID]
-- email: test@example.com
-- name: Test User
-- role: [rôle sélectionné]
-- verified: 1
-- disabled: 0
```

### Console Browser
Logs attendus :
- `🔐 Starting signup process for: test@example.com`
- `✅ Supabase Auth user created: [UUID]`
- `📧 Email de confirmation envoyé via Supabase`
- `🔍 Index - Vérification de confirmation d'email`
- `📧 Index - Email confirmé détecté`
- `✅ Index - Statut verified mis à jour`
- `🎭 Index - Pas de rôle, redirection vers onboarding`

## 🐛 Dépannage

### Problème : Email non reçu
- Vérifier le dossier spam
- Vérifier les logs Supabase → Logs
- Vérifier la configuration SMTP

### Problème : Redirection incorrecte
- Vérifier les URLs de redirection dans Supabase
- Vérifier les logs de la console browser
- Vérifier que la page d'accueil détecte la confirmation

### Problème : Onboarding ne s'affiche pas
- Vérifier que l'utilisateur a `role: null` dans la DB
- Vérifier les logs de SignUpContinue
- Vérifier que la session Supabase est valide

## ✅ Critères de Succès

1. ✅ Inscription réussie avec email de confirmation
2. ✅ Email reçu et lien fonctionnel
3. ✅ Redirection vers onboarding après confirmation
4. ✅ Onboarding complet (rôle + sous-catégorie)
5. ✅ Compte finalement activé et connecté
6. ✅ Email de bienvenue envoyé
7. ✅ Profil complet dans la base de données

## 🚨 Si ça ne fonctionne toujours pas

1. **Vérifier les logs Supabase** → Logs → Authentication
2. **Vérifier la console browser** pour les erreurs
3. **Vérifier la base de données** avec les requêtes SQL ci-dessus
4. **Tester avec un nouvel email** pour éviter les conflits

