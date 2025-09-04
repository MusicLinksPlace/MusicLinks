# 🔐 Guide de Configuration Supabase Auth avec Emails Natifs

## 📋 **Étapes de Configuration**

### **1. Exécuter le Script SQL**
Exécutez le fichier `setup_supabase_auth.sql` dans votre dashboard Supabase :
1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Copiez-collez le contenu du fichier `setup_supabase_auth.sql`
3. Cliquez sur **Run** pour exécuter le script

### **2. Configuration des URLs de Redirection**
Dans votre dashboard Supabase, allez dans **Authentication > URL Configuration** :

**Site URL :**
```
http://localhost:5173
```

**Redirect URLs :**
```
http://localhost:5173/auth/callback
http://localhost:5173/update-password
http://localhost:5173/signup/continue
```

### **3. Configuration des Templates d'Email**
Dans **Authentication > Email Templates**, configurez :

#### **Confirm signup**
- **Subject :** `Confirmez votre inscription - MusicLinks`
- **Body :** Utilisez le template par défaut ou personnalisez

#### **Reset password**
- **Subject :** `Réinitialisation de votre mot de passe - MusicLinks`
- **Body :** Utilisez le template par défaut ou personnalisez

#### **Magic link**
- **Subject :** `Lien de connexion - MusicLinks`
- **Body :** Utilisez le template par défaut ou personnalisez

### **4. Configuration des Variables d'Environnement**
Créez un fichier `.env.local` à la racine de votre projet :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BREVO_API_KEY=your_brevo_api_key
```

### **5. Configuration des Paramètres d'Authentification**
Dans **Authentication > Settings** :

- ✅ **Enable email confirmations** : Activé
- ✅ **Enable email change confirmations** : Activé
- ✅ **Enable phone confirmations** : Désactivé (optionnel)
- ✅ **Enable phone change confirmations** : Désactivé (optionnel)

**JWT expiry limit :** 3600 (1 heure)
**Refresh token expiry limit :** 2592000 (30 jours)

## 🔧 **Fonctionnalités Implémentées**

### **✅ Inscription avec Vérification d'Email**
- Création automatique d'un profil dans la table `User`
- Envoi d'email de confirmation via Supabase
- Redirection vers page de continuation après vérification

### **✅ Connexion Sécurisée**
- Authentification via Supabase Auth
- Vérification du statut de l'utilisateur (disabled, verified)
- Gestion des sessions automatique

### **✅ Réinitialisation de Mot de Passe**
- Demande de réinitialisation via email
- Lien sécurisé avec token temporaire
- Mise à jour du mot de passe

### **✅ Gestion des Sessions**
- Persistance automatique des sessions
- Déconnexion propre
- Synchronisation avec localStorage

### **✅ Triggers Automatiques**
- Création automatique de profil lors de l'inscription
- Mise à jour du statut de vérification
- Gestion de la suppression d'utilisateurs

## 🚀 **Test de la Configuration**

### **1. Test d'Inscription**
1. Allez sur `/signup`
2. Remplissez le formulaire
3. Vérifiez que vous recevez un email de confirmation
4. Cliquez sur le lien dans l'email
5. Vérifiez que vous êtes redirigé vers `/signup/continue`

### **2. Test de Connexion**
1. Allez sur `/login`
2. Connectez-vous avec vos identifiants
3. Vérifiez que vous êtes connecté et redirigé

### **3. Test de Réinitialisation**
1. Allez sur `/forgot-password`
2. Entrez votre email
3. Vérifiez que vous recevez un email de réinitialisation
4. Cliquez sur le lien et changez votre mot de passe

## 🔍 **Dépannage**

### **Erreur "Invalid login credentials"**
- Vérifiez que l'utilisateur existe dans la table `User`
- Vérifiez que `disabled = 0`
- Vérifiez que l'email est confirmé

### **Erreur "Email not confirmed"**
- Vérifiez que l'email de confirmation a été envoyé
- Vérifiez les paramètres SMTP dans Supabase
- Vérifiez que l'utilisateur a cliqué sur le lien de confirmation

### **Erreur "User not found"**
- Vérifiez que le trigger `handle_new_user` fonctionne
- Vérifiez que l'utilisateur a été créé dans la table `User`

### **Erreur de Redirection**
- Vérifiez les URLs de redirection dans Supabase
- Vérifiez que les routes existent dans votre application

## 📝 **Notes Importantes**

1. **Développement vs Production** : Les politiques RLS sont configurées pour le développement. Pour la production, vous devrez les ajuster.

2. **Emails** : Les emails sont envoyés via Supabase par défaut. Vous pouvez configurer un service SMTP personnalisé si nécessaire.

3. **Sécurité** : Les tokens JWT sont gérés automatiquement par Supabase. Les sessions sont persistantes et sécurisées.

4. **Performance** : Des index ont été créés sur les colonnes fréquemment utilisées pour améliorer les performances.

## 🎯 **Prochaines Étapes**

1. Testez toutes les fonctionnalités d'authentification
2. Configurez les templates d'email selon vos besoins
3. Ajustez les politiques RLS pour la production
4. Configurez un service SMTP personnalisé si nécessaire
5. Testez la récupération de mot de passe
6. Vérifiez la gestion des sessions sur différents navigateurs

---

**✅ Configuration terminée !** Votre système d'authentification Supabase est maintenant opérationnel avec les emails natifs.
