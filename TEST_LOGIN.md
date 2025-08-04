# 🧪 TEST DE CONNEXION SIMPLIFIÉ

## Instructions de test

### 1. Exécuter les scripts SQL dans Supabase
- Allez dans Supabase Dashboard → SQL Editor
- Exécutez `create_test_user.sql`
- Exécutez `create_simple_buckets.sql`

### 2. Tester la connexion
- Allez sur http://localhost:5174/
- Cliquez sur "Connexion"
- Entrez n'importe quel email (ex: `test@test.com`)
- Entrez n'importe quel mot de passe
- Cliquez sur "Se connecter"

### 3. Ce qui va se passer
- Si l'utilisateur n'existe pas → il sera créé automatiquement
- Si l'utilisateur existe → connexion directe
- Pas de vérification de mot de passe
- Pas de restrictions de sécurité

### 4. Utilisateurs de test créés
- `test@musiclinks.com` (artist)
- `test2@musiclinks.com` (provider)

### 5. Tester l'envoi d'images
- Allez dans la messagerie
- Essayez d'envoyer une image
- Ça devrait fonctionner maintenant

## ⚠️ ATTENTION
- Aucune sécurité
- Connexion avec n'importe quel email
- Création automatique d'utilisateurs
- Pour le développement uniquement

## Si ça ne marche toujours pas
1. Vérifiez que les scripts SQL ont été exécutés
2. Vérifiez que les buckets existent dans Supabase Storage
3. Redémarrez le serveur : `npm run dev` 