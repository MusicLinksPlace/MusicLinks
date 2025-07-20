# Fonctionnalité de Likes - MusicLinks

## 🎯 Vue d'ensemble

La fonctionnalité de likes permet aux utilisateurs de :
- **Liker** les profils d'autres utilisateurs (cœur rouge)
- **Voir** leurs profils likés dans leur espace personnel (onglet "Likes")
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

### Onglet "Likes" dans le profil
- **Visible uniquement** si l'utilisateur regarde son propre profil
- **Liste des profils likés** avec photos et informations
- **Bouton unlike** sur chaque profil
- **Pagination** pour les gros volumes

## 🔧 Installation

### 1. Exécuter le script SQL
```bash
# Dans Supabase SQL Editor
# Copier et exécuter le contenu de likes_setup.sql
```

### 2. Vérifier les composants
- ✅ `src/hooks/use-likes.ts` - Hook pour gérer les likes
- ✅ `src/components/profile/LikedProfiles.tsx` - Composant d'affichage
- ✅ `src/components/profile/UsersWhoLiked.tsx` - Composant pour voir qui a liké
- ✅ `src/pages/UserProfile.tsx` - Intégration dans les profils

## 🚀 Utilisation

### Pour liker un profil
1. Aller sur le profil d'un autre utilisateur
2. Cliquer sur le bouton cœur dans l'en-tête
3. Le cœur devient rouge et le compteur s'incrémente

### Pour voir ses profils likés
1. Aller sur son propre profil
2. Cliquer sur l'onglet "Likes"
3. Voir la liste de tous les profils likés
4. Cliquer sur le cœur rouge pour unlike

### Pour voir qui a liké son profil
1. Aller sur son propre profil
2. Voir le badge rouge sur le bouton like
3. Le nombre indique le total de likes reçus

## 🔒 Sécurité

### Politiques RLS
- **Lecture** : Utilisateurs peuvent voir leurs propres likes et likes reçus
- **Écriture** : Utilisateurs peuvent créer leurs propres likes
- **Suppression** : Utilisateurs peuvent supprimer leurs propres likes
- **Prévention** : Impossible de se liker soi-même

### Validation
- **Unique constraint** : Un utilisateur ne peut liker qu'une fois le même profil
- **Cascade delete** : Suppression automatique si un utilisateur est supprimé
- **Authentification** : Seuls les utilisateurs connectés peuvent liker

## 📊 Métriques

### Compteurs automatiques
- **likeCount** : Nombre de likes reçus par utilisateur
- **Mise à jour en temps réel** via triggers
- **Optimisé** pour éviter les requêtes COUNT

### Statistiques
- **Profils les plus likés** : Tri par likeCount
- **Activité récente** : Tri par createdAt
- **Engagement** : Métrique de popularité

## 🎯 Fonctionnalités avancées

### Pagination
- **20 profils par page** par défaut
- **Chargement progressif** pour les gros volumes
- **Optimisé** pour les performances

### Notifications (futur)
- **Like reçu** : Notification en temps réel
- **Nouveau profil** : Suggestions basées sur les likes
- **Engagement** : Rappels pour interagir

### Analytics (futur)
- **Top profils** : Classement par likes
- **Tendances** : Évolution des likes dans le temps
- **Recommandations** : Algorithmes de suggestion

## 🔧 Maintenance

### Nettoyage automatique
- **Cascade delete** : Suppression automatique des likes orphelins
- **Index maintenance** : Optimisation automatique des requêtes
- **Monitoring** : Surveillance des performances

### Backups
- **Sauvegarde** : Likes inclus dans les backups automatiques
- **Restauration** : Procédure de restauration documentée
- **Migration** : Scripts de migration pour les évolutions

## 📝 Notes techniques

### Performance
- **Index optimisés** pour les requêtes fréquentes
- **Triggers** pour maintenir les compteurs
- **Pagination** pour éviter les surcharges

### Scalabilité
- **Architecture** prête pour de gros volumes
- **Cache** possible pour les compteurs
- **CDN** pour les images de profil

### Compatibilité
- **Mobile** : Interface responsive
- **Desktop** : Interface optimisée
- **Accessibilité** : Support des lecteurs d'écran 