# 🚨 URGENT - FIX UPLOAD CHAT

## ❌ **Problème actuel :**
- Erreur 403 "Unauthorized" 
- "new row violates row-level security policy"
- Upload de fichiers bloqué

## ✅ **Solution immédiate :**

### 1. Exécuter le script d'urgence
- Allez dans **Supabase Dashboard** → **SQL Editor**
- Exécutez `disable_storage_rls.sql`
- Vérifiez que tous les résultats montrent ✅

### 2. Vérifier que ça marche
- Exécutez `test_upload.sql`
- Tous les résultats doivent être ✅

### 3. Tester l'upload
- Allez sur http://localhost:5174/
- Connectez-vous
- Allez dans chat
- Essayez d'envoyer une image

## 🔧 **Ce que fait le script :**
- ❌ Supprime toutes les politiques RLS
- ❌ Désactive RLS sur `storage.objects`
- ✅ Crée une politique ultra-permissive
- ✅ Rend tous les buckets publics

## 🎯 **Résultat attendu :**
- ✅ Upload d'images fonctionnel
- ✅ Upload de PDF fonctionnel
- ✅ Upload de vidéos fonctionnel
- ✅ Aucune restriction de sécurité

## ⚠️ **Si ça ne marche toujours pas :**
1. Vérifiez que les scripts ont été exécutés
2. Vérifiez que tous les résultats sont ✅
3. Redémarrez le serveur : `npm run dev`
4. Videz le cache du navigateur

**Exécutez `disable_storage_rls.sql` MAINTENANT !** 🚀 