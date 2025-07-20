# Fonctionnalité de Likes - MusicLinks

## 🎯 Vue d'ensemble

La fonctionnalité de likes permet aux utilisateurs de :
- **Liker** les profils d'autres utilisateurs
- **Voir** leurs profils likés dans leur espace personnel
- **Afficher** discrètement le nombre de likes reçus sur leur profil
- **Gérer** leurs favoris avec pagination

## 🗄️ Structure de la base de données

### Table `UserLikes`
```sql
CREATE TABLE "UserLikes" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "fromUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "toUserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("fromUserId", "toUserId")
);
```

### Colonne `likeCount` dans la table `User`
```sql
ALTER TABLE "User" ADD COLUMN "likeCount" INTEGER DEFAULT 0;
```

## ⚡ Optimisations de performance

### 1. Compteur automatique
- **Trigger** qui met à jour automatiquement `likeCount` lors des INSERT/DELETE
- **Évite** les requêtes COUNT coûteuses
- **Mise à jour en temps réel**

### 2. Index optimisés
```sql
-- Index composite pour les requêtes de likes
CREATE INDEX "UserLikes_fromUserId_toUserId_idx" ON "UserLikes"("fromUserId", "toUserId");

-- Index pour les requêtes de comptage
CREATE INDEX "UserLikes_toUserId_createdAt_idx" ON "UserLikes"("toUserId", "createdAt" DESC);
```

### 3. Fonctions SQL optimisées
- `get_liked_profiles()` - Récupère les profils likés avec pagination
- `get_users_who_liked()` - Récupère les utilisateurs qui ont liké un profil

## 🎨 Interface utilisateur

### Affichage discret du nombre de likes
- **Badge rouge** sur le bouton like (ex: "5", "99+")
- **Texte discret** à côté de la note (ex: "5 likes")
- **Visible** sur mobile et desktop

### Boutons de like
- **Cœur vide** : Pas liké
- **Cœur rouge rempli** : Liké
- **Animation** lors du toggle
- **Badge** avec le nombre de likes reçus

## 🔧 Utilisation technique

### Hook `useLikes`
```typescript
const { 
  isLiked, 
  toggleLike, 
  likeCount, 
  loading, 
  getLikedProfiles 
} = useLikes(targetUserId);
```

### Composants disponibles
- `LikedProfiles` - Liste des profils likés
- `UsersWhoLiked` - Liste des utilisateurs qui ont liké (optionnel)

## 📱 Fonctionnalités

### ✅ Implémentées
- [x] Like/unlike des profils
- [x] Affichage discret du nombre de likes
- [x] Liste des profils likés dans les paramètres
- [x] Optimisations de performance
- [x] Pagination des résultats
- [x] Badges visuels
- [x] Animations et transitions

### 🔮 Futures améliorations possibles
- [ ] Notifications de nouveaux likes
- [ ] Statistiques de likes (admin)
- [ ] Export des favoris
- [ ] Partage de listes de favoris
- [ ] Filtres par catégorie dans les favoris

## 🚀 Installation

### 1. Exécuter les requêtes SQL
```bash
# Dans Supabase SQL Editor
# Exécuter le contenu de optimize_likes_performance.sql
```

### 2. Vérifier les politiques RLS
```sql
-- Politiques déjà configurées dans create_user_likes_table.sql
-- Vérifier qu'elles sont actives
```

### 3. Tester la fonctionnalité
- Liker un profil
- Vérifier l'affichage du compteur
- Consulter la liste des favoris

## 🔒 Sécurité

### Politiques RLS
- **Lecture** : Utilisateurs peuvent voir leurs propres likes et le compteur public
- **Écriture** : Utilisateurs peuvent créer/supprimer leurs propres likes
- **Suppression** : Cascade automatique si un utilisateur est supprimé

### Validation
- **Unicité** : Un utilisateur ne peut liker qu'une fois le même profil
- **Authentification** : Vérification de l'utilisateur connecté
- **Autorisation** : Contrôle des permissions via RLS

## 📊 Métriques

### Performance
- **Requêtes optimisées** : Utilisation d'index et de fonctions SQL
- **Cache** : Compteur mis à jour automatiquement
- **Pagination** : Chargement progressif des résultats

### Utilisation
- **Compteur de likes** : Mis à jour en temps réel
- **Liste des favoris** : Pagination de 20 éléments par page
- **Interface responsive** : Mobile et desktop

## 🐛 Dépannage

### Problèmes courants
1. **Compteur incorrect** : Vérifier les triggers SQL
2. **Likes non sauvegardés** : Vérifier les politiques RLS
3. **Performance lente** : Vérifier les index

### Logs utiles
```typescript
// Dans le hook useLikes
console.error('Erreur lors du chargement des likes:', err);
console.error('Erreur lors de l\'ajout du like:', err);
```

## 📝 Notes de développement

- **Hook centralisé** : Toute la logique dans `useLikes`
- **Composants réutilisables** : `LikedProfiles`, `UsersWhoLiked`
- **Optimisations automatiques** : Triggers SQL pour le compteur
- **Interface cohérente** : Design uniforme sur mobile et desktop 