# Test du Flux Corrigé - Version Simplifiée

## 🎯 Problème Résolu
- **Erreur 500** lors de l'inscription Supabase Auth
- **Trigger problématique** qui causait des conflits
- **Configuration RLS** trop restrictive

## 🔧 Corrections Apportées

### 1. Service d'Authentification Simplifié
- **Nouveau fichier** : `src/lib/authServiceSimple.ts`
- **Pas de metadata** dans l'inscription Supabase Auth
- **Création manuelle** de l'utilisateur dans la table User
- **Gestion d'erreur** améliorée

### 2. Configuration Base de Données
- **RLS désactivé** temporairement
- **Trigger supprimé** pour éviter les conflits
- **Politiques simplifiées**

## 📋 Étapes de Test

### 1. Exécuter le Script de Correction
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Copier et exécuter le contenu de fix_auth_error.sql
```

### 2. Vérifier la Configuration
```sql
-- Vérifier que la table User est prête
SELECT 'Table User prête' as status, COUNT(*) as user_count FROM "User";

-- Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'User';
```

### 3. Test du Flux

#### Étape 1 : Inscription
1. Aller sur `http://localhost:5173/signup`
2. Remplir :
   - Email : `test@example.com`
   - Mot de passe : `password123`
   - Nom : `Test User`
3. Cliquer sur "Créer mon compte"
4. **Résultat attendu** : Message de succès + redirection vers page de confirmation

#### Étape 2 : Vérification Email
1. Vérifier la boîte email `test@example.com`
2. Cliquer sur le lien de confirmation
3. **Résultat attendu** : Redirection vers `/signup/continue` (onboarding)

#### Étape 3 : Onboarding
1. Sélectionner un rôle (Artiste, Prestataire, ou Partenaire)
2. Si Prestataire/Partenaire : Sélectionner une sous-catégorie
3. **Résultat attendu** : Redirection vers `/mon-compte` avec profil complet

## 📊 Vérifications

### Console Browser
Logs attendus :
- `🔐 Starting simple signup process for: test@example.com`
- `✅ Supabase Auth user created: [UUID]`
- `📝 Creating user in database: {...}`
- `✅ User created in database successfully`
- `📧 Email de confirmation envoyé via Supabase`

### Base de Données
```sql
-- Vérifier que l'utilisateur est créé
SELECT id, email, name, role, verified, disabled FROM "User" WHERE email = 'test@example.com';

-- Résultat attendu :
-- id: [UUID]
-- email: test@example.com
-- name: Test User
-- role: null (avant onboarding)
-- verified: 0 (avant confirmation email)
-- disabled: 0
```

## 🐛 Dépannage

### Si l'erreur 500 persiste :
1. **Vérifier les logs Supabase** → Logs → Authentication
2. **Exécuter le script** `fix_auth_error.sql` à nouveau
3. **Vérifier que RLS est désactivé** sur la table User

### Si l'email n'est pas reçu :
1. **Vérifier le dossier spam**
2. **Vérifier la configuration SMTP** dans Supabase
3. **Tester avec un autre email**

### Si la redirection ne fonctionne pas :
1. **Vérifier les URLs de redirection** dans Supabase Dashboard
2. **Vérifier les logs** de la console browser
3. **Tester la page d'accueil** qui détecte les confirmations

## ✅ Critères de Succès

1. ✅ **Inscription réussie** sans erreur 500
2. ✅ **Email de confirmation** reçu
3. ✅ **Redirection vers onboarding** après confirmation
4. ✅ **Onboarding complet** (rôle + sous-catégorie)
5. ✅ **Compte activé** et connecté
6. ✅ **Profil complet** dans la base de données

## 🚨 Si ça ne fonctionne toujours pas

1. **Vérifier les logs Supabase** → Logs → Authentication
2. **Vérifier la console browser** pour les erreurs
3. **Exécuter le script** `fix_auth_error.sql` à nouveau
4. **Tester avec un nouvel email** pour éviter les conflits
5. **Vérifier que le serveur** `npm run dev` fonctionne

