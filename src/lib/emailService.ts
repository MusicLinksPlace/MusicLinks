interface EmailData {
  firstName?: string;
  email: string;
}

interface MessageNotificationData {
  receiverEmail: string;
  receiverName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const TEMPLATE_ID = '2DWQWFGHlPQcCSpZcbp7PoB2tIKr_OEyasAUNiSI_ixGjHzYKk8w3C8G';

export const sendWelcomeEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        templateId: parseInt(TEMPLATE_ID),
        to: [
          {
            email: emailData.email,
            name: emailData.firstName || 'Utilisateur'
          }
        ],
        params: {
          FIRSTNAME: emailData.firstName || 'Utilisateur'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Brevo:', errorData);
      return false;
    }

    console.log('Email de bienvenue envoyé avec succès à:', emailData.email);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return false;
  }
};

export const sendEmailVerification = async (email: string, verificationLink: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        to: [
          {
            email: email,
            name: 'Utilisateur'
          }
        ],
        subject: 'Vérifiez votre adresse email - MusicLinks',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Bienvenue sur MusicLinks !</h2>
            <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Vérifier mon email
            </a>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #6b7280;">${verificationLink}</p>
            <p>Ce lien expirera dans 24 heures.</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Brevo:', errorData);
      return false;
    }

    console.log('Email de vérification envoyé avec succès à:', email);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    return false;
  }
};

export const sendMessageNotification = async (notificationData: MessageNotificationData): Promise<boolean> => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        to: [
          {
            email: notificationData.receiverEmail,
            name: notificationData.receiverName
          }
        ],
        subject: `Nouveau message de ${notificationData.senderName} - MusicLinks`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${window.location.origin}/lovable-uploads/logo2.png" alt="MusicLinks" style="height: 40px; width: auto;">
              </div>
              
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Nouveau message reçu</h2>
              
              <p style="color: #4b5563; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${notificationData.receiverName}</strong>,
              </p>
              
              <p style="color: #4b5563; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
                Vous avez reçu un nouveau message de <strong>${notificationData.senderName}</strong> sur MusicLinks.
              </p>
              
              <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #374151; font-style: italic; margin: 0; font-size: 14px;">
                  "${notificationData.messagePreview}"
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${notificationData.conversationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Voir le message
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                Vous recevez cet email car vous avez reçu un message sur MusicLinks.<br>
                Si vous ne souhaitez plus recevoir ces notifications, vous pouvez modifier vos paramètres dans votre profil.
              </p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Brevo pour notification de message:', errorData);
      return false;
    }

    console.log('Notification de message envoyée avec succès à:', notificationData.receiverEmail);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de message:', error);
    return false;
  }
}; 