# 🔥 CORRECTION URGENTE - Problèmes de connexion et buckets

## Problème 1: Impossible de se connecter
**Erreur:** "Invalid login credentials"

### Solution:
1. Allez dans Supabase Dashboard → SQL Editor
2. Exécutez le fichier `fix_auth_policies.sql`
3. Cela supprime toutes les restrictions de sécurité

## Problème 2: Bucket not found
**Erreur:** "Impossible d'envoyer le message: Bucket not found"

### Solution:
1. Allez dans Supabase Dashboard → SQL Editor
2. Exécutez le fichier `create_simple_buckets.sql`
3. Cela crée tous les buckets nécessaires

## Étapes à suivre:

### 1. Ouvrir Supabase Dashboard
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet MusicLinks

### 2. Exécuter les scripts SQL
- Cliquez sur "SQL Editor" dans le menu de gauche
- Copiez et collez le contenu de `fix_auth_policies.sql`
- Cliquez sur "Run"
- Puis copiez et collez le contenu de `create_simple_buckets.sql`
- Cliquez sur "Run"

### 3. Vérifier les buckets
- Allez dans "Storage" dans le menu de gauche
- Vérifiez que ces buckets existent:
  - ✅ avatars
  - ✅ gallery  
  - ✅ user-videos
  - ✅ attachments
  - ✅ media-files

### 4. Tester
- Rechargez votre application
- Essayez de vous connecter
- Essayez d'envoyer une image dans le chat

## ⚠️ ATTENTION
Ces scripts suppriment TOUTES les restrictions de sécurité. 
C'est pour le développement uniquement.

## Si ça ne marche toujours pas:
1. Vérifiez que vous êtes sur le bon projet Supabase
2. Vérifiez que les variables d'environnement sont correctes
3. Redémarrez le serveur: `npm run dev` 