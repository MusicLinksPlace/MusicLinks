# Configuration Brevo pour MusicLinks

## Configuration requise

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Brevo Email Configuration
VITE_BREVO_API_KEY=your_brevo_api_key_here
```

### 2. Configuration Brevo

1. **Créer un compte Brevo** : https://www.brevo.com/
2. **Générer une clé API** :
   - Allez dans Settings > API Keys
   - Créez une nouvelle clé API
   - Copiez la clé dans votre fichier `.env`

### 3. Template d'email

Le template d'email de bienvenue est configuré avec l'ID : `2DWQWFGHlPQcCSpZcbp7PoB2tIKr_OEyasAUNiSI_ixGjHzYKk8w3C8G`

**Variables disponibles dans le template :**
- `{{ contact.FIRSTNAME | default: "" }}` - Prénom de l'utilisateur

## Fonctionnalités implémentées

### 1. Email de bienvenue
- **Déclencheur** : Après confirmation de l'email et sélection du rôle
- **Template** : Utilise le template Brevo configuré
- **Variables** : Prénom de l'utilisateur

### 2. Email de vérification
- **Déclencheur** : Lors de l'inscription
- **Contenu** : Email HTML personnalisé avec lien de vérification
- **Expiration** : 24 heures

### 3. Notifications de nouveaux messages ⭐ NOUVEAU
- **Déclencheur** : Quand un utilisateur reçoit un nouveau message
- **Contenu** : Email HTML personnalisé avec aperçu du message
- **Fonctionnalités** :
  - Aperçu du message (100 premiers caractères)
  - Nom de l'expéditeur
  - Lien direct vers la conversation
  - Design responsive et professionnel
  - Logo MusicLinks intégré

## Utilisation

### Envoi d'email de bienvenue
```typescript
import { sendWelcomeEmail } from '@/lib/emailService';

await sendWelcomeEmail({
  firstName: 'John',
  email: 'john@example.com'
});
```

### Envoi d'email de vérification
```typescript
import { sendEmailVerification } from '@/lib/emailService';

await sendEmailVerification(
  'john@example.com',
  'https://votre-site.com/verify?token=abc123'
);
```

### Envoi de notification de message
```typescript
import { sendMessageNotification } from '@/lib/emailService';

await sendMessageNotification({
  receiverEmail: 'recipient@example.com',
  receiverName: 'Marie',
  senderName: 'John',
  messagePreview: 'Bonjour ! Je suis intéressé par votre projet...',
  conversationUrl: 'https://votre-site.com/chat?userId=123'
});
```

## Déploiement

### Vercel
Ajoutez les variables d'environnement dans les paramètres de votre projet Vercel :
- `VITE_BREVO_API_KEY`

### Autres plateformes
Assurez-vous que la variable `VITE_BREVO_API_KEY` est disponible dans votre environnement de production.

## Dépannage

### Erreurs courantes
1. **"Invalid API key"** : Vérifiez que votre clé API Brevo est correcte
2. **"Template not found"** : Vérifiez que l'ID du template est correct
3. **"Rate limit exceeded"** : Attendez quelques minutes avant de réessayer
4. **"Email notification failed"** : Vérifiez que l'email du destinataire est valide

### Logs
Les erreurs et succès sont loggés dans la console du navigateur pour faciliter le débogage.

## Configuration côté Brevo

### 1. Vérification des emails
- Assurez-vous que votre domaine d'envoi est vérifié dans Brevo
- Configurez les enregistrements SPF et DKIM pour améliorer la délivrabilité

### 2. Limites d'envoi
- Vérifiez vos limites d'envoi dans votre plan Brevo
- Les notifications de messages peuvent augmenter significativement le volume d'emails

### 3. Templates personnalisés (optionnel)
Si vous souhaitez utiliser des templates Brevo pour les notifications de messages :
1. Créez un template dans Brevo
2. Remplacez l'ID du template dans `emailService.ts`
3. Utilisez les variables disponibles dans le template

### 4. Gestion des désabonnements
Les emails de notification incluent un lien vers les paramètres du profil pour permettre aux utilisateurs de désactiver les notifications. 