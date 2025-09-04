# Test du Flux d'Inscription avec Email de Confirmation

## 🎯 Objectif
Tester le flux complet : Inscription → Email de confirmation → Onboarding → Compte activé

## 📋 Étapes de Test

### 1. Inscription de Base
- Aller sur `http://localhost:5173/signup`
- Remplir seulement :
  - Email : `test@example.com`
  - Mot de passe : `password123`
  - Nom : `Test User`
- Cliquer sur "Créer mon compte"
- **Résultat attendu** : Message de succès + redirection vers page de confirmation

### 2. Vérification Email
- Vérifier la boîte email `test@example.com`
- Cliquer sur le lien de confirmation
- **Résultat attendu** : Redirection vers `/signup/continue` (onboarding)

### 3. Onboarding
- Sélectionner un rôle (Artiste, Prestataire, ou Partenaire)
- Si Prestataire/Partenaire : Sélectionner une sous-catégorie
- **Résultat attendu** : Redirection vers `/mon-compte` avec profil complet

### 4. Vérification Finale
- Vérifier que l'utilisateur est connecté
- Vérifier que le profil est complet dans la base de données
- Vérifier que l'email de bienvenue a été envoyé

## 🔧 Configuration Supabase Requise

### URLs de Redirection
Dans Supabase Dashboard → Authentication → URL Configuration :

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

### Email Templates
Vérifier que les templates d'email sont configurés :
- Confirmation d'email
- Réinitialisation de mot de passe

## 🐛 Problèmes Potentiels

### 1. Email non reçu
- Vérifier les logs Supabase
- Vérifier le dossier spam
- Vérifier la configuration SMTP

### 2. Redirection incorrecte
- Vérifier les URLs de redirection dans Supabase
- Vérifier les logs de la page callback

### 3. Onboarding ne s'affiche pas
- Vérifier que l'utilisateur a `role: null` dans la DB
- Vérifier les logs de SignUpContinue

## 📊 Logs à Surveiller

### Console Browser
- `🔐 Starting signup process`
- `✅ Supabase Auth user created`
- `📧 Email de confirmation envoyé`
- `✅ Email verified successfully`
- `🎭 Utilisateur doit compléter son profil`

### Supabase Logs
- Signup events
- Email confirmation events
- Database updates

## ✅ Critères de Succès

1. ✅ Inscription réussie avec email de confirmation
2. ✅ Email reçu et lien fonctionnel
3. ✅ Redirection vers onboarding après confirmation
4. ✅ Onboarding complet (rôle + sous-catégorie)
5. ✅ Compte finalement activé et connecté
6. ✅ Email de bienvenue envoyé
7. ✅ Profil complet dans la base de données

## 🔧 Corrections Apportées

### Problème Identifié
- Supabase redirige vers `/` au lieu de `/auth/callback`
- Le statut `verified` reste à 0 même après confirmation d'email
- L'onboarding ne se déclenche pas

### Solution Implémentée
- **Page d'accueil modifiée** : Détecte automatiquement les confirmations d'email
- **Mise à jour automatique** : `verified: 0` → `verified: 1` après confirmation
- **Redirection intelligente** : Vers onboarding si pas de rôle, sinon connexion automatique

## 🧪 Test du Flux Corrigé

### 1. Nettoyer la Base de Données
```sql
-- Supprimer l'utilisateur de test précédent
DELETE FROM "User" WHERE email = 'test@example.com';
```

### 2. Test Complet
1. Aller sur `http://localhost:5173/signup`
2. Inscription avec email + mot de passe + nom
3. Cliquer sur le lien dans l'email
4. **Résultat attendu** : Redirection vers `/signup/continue` (onboarding)
5. Sélectionner rôle et sous-catégorie
6. **Résultat attendu** : Compte activé et connecté

### 3. Vérifications
- ✅ `verified: 1` dans la table User
- ✅ `role` défini après onboarding
- ✅ Utilisateur connecté automatiquement
