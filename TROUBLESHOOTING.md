# Guide de dépannage - MusicLinks

## Problèmes courants et solutions

### 1. Erreur "bucket not found" lors de l'envoi de fichiers

**Problème :** `Failed to load resource: the server responded with a status of 400 ()`

**Solution :**
1. Exécutez le fichier `create_all_buckets.sql` dans votre base de données Supabase
2. Vérifiez que tous les buckets sont créés dans l'interface Supabase Storage

**Buckets nécessaires :**
- `avatars` - Photos de profil
- `gallery` - Images de galerie
- `user-videos` - Vidéos de profil
- `attachments` - Fichiers de chat
- `media-files` - Vidéos et audio de chat

### 2. Erreur Brevo API (notifications email)

**Problème :** `Erreur Brevo pour notification de message: Object`

**Solutions :**
1. Vérifiez que la clé API Brevo est correcte dans `.env`
2. Vérifiez que le compte Brevo est actif
3. Les notifications email sont optionnelles et n'empêchent pas l'envoi de messages

### 3. Erreur de connexion localhost (400)

**Problème :** `Failed to load resource: the server responded with a status of 400 ()`

**Solutions :**
1. Vérifiez que les variables d'environnement sont correctes dans `.env`
2. Redémarrez le serveur de développement : `npm run dev`
3. Vérifiez que Supabase est accessible

### 4. Problèmes Git LFS

**Problème :** `git-lfs was not found on your path`

**Solution :**
```bash
git lfs install
```

### 5. Fichiers trop volumineux

**Problème :** Erreur lors de l'upload de gros fichiers

**Limites par défaut :**
- Images : 5-10MB
- Vidéos : 50-100MB
- Audio : 50MB
- Documents : 50MB

## Configuration requise

### Variables d'environnement (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
BREVO_API_KEY=your-brevo-key
VITE_BREVO_API_KEY=your-brevo-key
```

### Base de données Supabase
- Tous les buckets de stockage créés
- Politiques RLS configurées
- Tables User, Message, Review créées

## Support

Si les problèmes persistent, vérifiez :
1. Les logs de la console navigateur
2. Les logs Supabase
3. La configuration des variables d'environnement 