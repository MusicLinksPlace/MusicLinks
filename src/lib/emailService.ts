interface EmailData {
  firstName?: string;
  email: string;
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