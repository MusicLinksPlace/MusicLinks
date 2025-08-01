# 🔧 Solution Rate Limit Supabase - MusicLinks

## 🚨 Problème
Vous rencontrez l'erreur : `email rate limit exceeded` lors de l'inscription ou de la réinitialisation de mot de passe.

## ✅ Solutions Implémentées

### 1. **Utilisation de Brevo pour l'envoi d'emails** ✅
- ✅ **SignUp.tsx** : Utilise maintenant Brevo au lieu de Supabase Auth
- ✅ **ForgotPassword.tsx** : Utilise maintenant Brevo pour les emails de reset
- ✅ **emailService.ts** : Fonctions dédiées pour chaque type d'email

### 2. **Gestion d'erreur améliorée** ✅
- ✅ Messages d'erreur spécifiques pour les rate limits
- ✅ Conseils pour l'utilisateur
- ✅ Interface améliorée pour la vérification d'email

## 🔧 Configuration Supabase Dashboard

### **Option 1 : Désactiver l'envoi automatique d'emails (Recommandé)**

1. **Allez dans votre Supabase Dashboard**
2. **Authentication** → **Settings** → **Email Templates**
3. **Désactivez** les templates automatiques :
   - ✅ **Confirm signup** : Désactivé
   - ✅ **Reset password** : Désactivé
   - ✅ **Change email address** : Désactivé

### **Option 2 : Configurer un provider SMTP externe**

1. **Authentication** → **Settings** → **SMTP Settings**
2. **Activez SMTP** et configurez :
   ```
   Host: smtp-relay.brevo.com
   Port: 587
   Username: votre-email@domaine.com
   Password: votre-clé-api-brevo
   ```

### **Option 3 : Augmenter les limites (Payant)**

1. **Upgrade votre plan Supabase** :
   - **Pro Plan** : $25/mois - Limites plus élevées
   - **Team Plan** : $599/mois - Limites encore plus élevées
   - **Enterprise** : Limites personnalisées

## 🎯 Configuration Recommandée

### **Étape 1 : Désactiver les emails automatiques**
```sql
-- Dans Supabase SQL Editor
UPDATE auth.config 
SET email_template_confirm_signup = false,
    email_template_reset_password = false,
    email_template_change_email_address = false;
```

### **Étape 2 : Vérifier la variable d'environnement**
```env
# Dans votre .env et Vercel
VITE_BREVO_API_KEY=votre-clé-api-brevo
```

### **Étape 3 : Tester l'inscription**
1. Créez un nouveau compte
2. Vérifiez que l'email arrive via Brevo
3. Confirmez que le rate limit n'apparaît plus

## 📊 Avantages de cette solution

### **✅ Avantages**
- 🚀 **Plus de rate limits** : Brevo a des limites beaucoup plus élevées
- 📧 **Meilleure délivrabilité** : Brevo est spécialisé dans l'envoi d'emails
- 🎨 **Templates personnalisés** : Design professionnel
- 📈 **Analytics** : Suivi des ouvertures et clics
- 💰 **Coût optimisé** : Brevo gratuit jusqu'à 300 emails/jour

### **⚠️ Points d'attention**
- 🔧 **Configuration requise** : Vérifiez que `VITE_BREVO_API_KEY` est configuré
- 📧 **Fallback** : Si Brevo échoue, l'utilisateur est informé
- 🔄 **Migration** : Les anciens comptes continuent de fonctionner

## 🧪 Test de la solution

### **Test 1 : Inscription**
```bash
# 1. Créez un nouveau compte
# 2. Vérifiez que l'email arrive
# 3. Confirmez l'email
# 4. Sélectionnez un rôle
```

### **Test 2 : Reset Password**
```bash
# 1. Allez sur "Mot de passe oublié"
# 2. Entrez un email existant
# 3. Vérifiez que l'email arrive
```

### **Test 3 : Rate Limit**
```bash
# 1. Essayez de créer plusieurs comptes rapidement
# 2. Vérifiez qu'il n'y a plus d'erreur de rate limit
```

## 🔍 Monitoring

### **Logs à surveiller**
```javascript
// Dans la console du navigateur
✅ Email de vérification envoyé via Brevo
✅ Email de réinitialisation envoyé via Brevo
❌ Échec de l'envoi d'email via Brevo
```

### **Métriques Brevo**
- 📊 **Dashboard Brevo** : Suivi des envois
- 📈 **Taux de délivrabilité** : Doit être > 95%
- ⏱️ **Temps de livraison** : Généralement < 30 secondes

## 🆘 Dépannage

### **Erreur : "Invalid API key"**
```bash
# Vérifiez votre clé API Brevo
echo $VITE_BREVO_API_KEY
```

### **Erreur : "Template not found"**
```bash
# Vérifiez l'ID du template dans emailService.ts
const TEMPLATE_ID = '2DWQWFGHlPQcCSpZcbp7PoB2tIKr_OEyasAUNiSI_ixGjHzYKk8w3C8G';
```

### **Emails n'arrivent pas**
1. ✅ Vérifiez les spams
2. ✅ Vérifiez la configuration Brevo
3. ✅ Vérifiez les logs dans la console

## 📞 Support

Si le problème persiste :
1. 📧 **Contactez-nous** : support@musiclinks.fr
2. 🔧 **Vérifiez les logs** : Console du navigateur
3. 📊 **Vérifiez Brevo** : Dashboard Brevo

---

**🎯 Résultat attendu** : Plus d'erreurs de rate limit, emails envoyés via Brevo avec un design professionnel ! 