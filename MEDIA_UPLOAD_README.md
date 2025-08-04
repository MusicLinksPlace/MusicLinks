# Configuration des médias pour la messagerie

## Bucket de stockage

Le système utilise maintenant deux buckets pour les fichiers :

1. **`attachments`** : Pour les images et documents
2. **`media-files`** : Pour les vidéos et fichiers audio

## Configuration SQL

Exécutez le fichier `create_media_bucket.sql` dans votre base de données Supabase pour créer le bucket `media-files` avec les bonnes politiques RLS.

## Types de fichiers supportés

### Images
- JPG, PNG, GIF, WebP
- Taille max : 50MB

### Vidéos
- MP4, AVI, MOV, WebM, QuickTime
- Taille max : 50MB

### Audio
- MP3, WAV, OGG, AAC, FLAC, M4A
- Taille max : 50MB

### Documents
- PDF, DOC, DOCX, TXT
- Taille max : 50MB

## Fonctionnalités

- ✅ Prévisualisation des images, vidéos et audio avant envoi
- ✅ Lecteur vidéo intégré dans les messages
- ✅ Lecteur audio intégré dans les messages
- ✅ Validation des types de fichiers
- ✅ Limitation de taille
- ✅ Messages d'erreur informatifs

## Utilisation

1. Cliquez sur l'icône trombone dans la messagerie
2. Sélectionnez un fichier (image, vidéo, audio ou document)
3. Prévisualisez le fichier si c'est un média
4. Envoyez le message avec le fichier joint

Le système détecte automatiquement le type de fichier et utilise le bon bucket de stockage. 