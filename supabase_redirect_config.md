# Configuration Supabase pour les Redirections d'Email

## 🎯 Problème Identifié
- Supabase redirige vers `/` au lieu de `/auth/callback` après confirmation d'email
- L'onboarding ne se déclenche pas car la page d'accueil ne gère pas correctement les confirmations

## 🔧 Configuration Requise dans Supabase Dashboard

### 1. URLs de Redirection
Allez dans **Supabase Dashboard** → **Authentication** → **URL Configuration**

**Site URL :**
```
http://localhost:5173
```

**Redirect URLs :**
```
http://localhost:5173/auth/callback
http://localhost:5173/signup/continue
http://localhost:5173/
```

### 2. Templates d'Email
Allez dans **Authentication** → **Email Templates**

**Template "Confirm signup" :**
- **Subject :** `Confirmez votre inscription sur MusicLinks`
- **Body :** 
```html
<h2>Bienvenue sur MusicLinks !</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre inscription :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon inscription</a></p>
<p>Si le lien ne fonctionne pas, copiez cette URL dans votre navigateur :</p>
<p>{{ .ConfirmationURL }}</p>
```

### 3. Configuration SMTP (Optionnel)
Si vous voulez utiliser un service SMTP personnalisé :
- **Host :** smtp.gmail.com (pour Gmail)
- **Port :** 587
- **Username :** votre email
- **Password :** mot de passe d'application

## 🚨 Solution Alternative : Redirection via Page d'Accueil

Si les redirections Supabase ne fonctionnent toujours pas, j'ai modifié la page d'accueil pour détecter automatiquement les confirmations d'email et rediriger vers l'onboarding.

### Code Ajouté dans `src/pages/Index.tsx` :
```typescript
useEffect(() => {
  const checkEmailConfirmation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.email_confirmed_at) {
      // Mettre à jour verified: 1
      await supabase
        .from('User')
        .update({ verified: 1 })
        .eq('id', session.user.id);

      // Vérifier si l'utilisateur a un rôle
      const { data: userData } = await supabase
        .from('User')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!userData.role) {
        // Rediriger vers l'onboarding
        navigate('/signup/continue');
      }
    }
  };

  checkEmailConfirmation();
}, [navigate]);
```

## 🧪 Test du Flux

1. **Exécuter le script SQL** : `fix_database_config.sql`
2. **Configurer les URLs** dans Supabase Dashboard
3. **Tester l'inscription** avec un nouvel email
4. **Cliquer sur le lien** dans l'email
5. **Vérifier** que vous êtes redirigé vers l'onboarding

## 📊 Logs à Surveiller

### Console Browser :
- `🔍 Index - Vérification de confirmation d'email`
- `📧 Index - Email confirmé détecté`
- `✅ Index - Statut verified mis à jour`
- `🎭 Index - Pas de rôle, redirection vers onboarding`

### Supabase Logs :
- Signup events
- Email confirmation events
- Database updates

