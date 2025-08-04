# 🔧 FIX CHAT - Envoi de fichiers

## ✅ **Problème résolu :**
- Le code utilisait `attachments` mais vos buckets sont `chat-uploads` et `media-files`
- J'ai corrigé le code pour utiliser les bons buckets

## 🚀 **Instructions :**

### 1. Exécuter le script SQL
- Allez dans Supabase Dashboard → SQL Editor
- Exécutez `fix_chat_buckets.sql`
- Vérifiez que tous les buckets sont listés

### 2. Tester l'envoi de fichiers
- Connectez-vous avec n'importe quel email
- Allez dans la messagerie
- Essayez d'envoyer :
  - 📷 **Image** (PNG, JPG) → bucket `chat-uploads`
  - 📄 **PDF** → bucket `chat-uploads`
  - 📹 **Vidéo** (MP4) → bucket `media-files`
  - 🎵 **Audio** (MP3) → bucket `media-files`

### 3. Buckets utilisés maintenant :
- `chat-uploads` : Images, PDF, documents, textes
- `media-files` : Vidéos et audio
- `avatars` : Photos de profil
- `gallery` : Galerie utilisateur
- `user-videos` : Vidéos de profil

## 🎯 **Test rapide :**
1. Connectez-vous
2. Allez dans chat
3. Cliquez sur l'icône 📎 (pièce jointe)
4. Sélectionnez une image
5. Envoyez le message

**Ça devrait marcher maintenant !** 🎉

## ⚠️ Si ça ne marche toujours pas :
1. Vérifiez que `fix_chat_buckets.sql` a été exécuté
2. Vérifiez que les buckets existent dans Supabase Storage
3. Redémarrez le serveur : `npm run dev` 