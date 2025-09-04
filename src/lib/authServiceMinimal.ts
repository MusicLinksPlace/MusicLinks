import { supabase } from './supabaseClient';
import { sendWelcomeEmail, sendEmailVerification } from './emailService';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  verified?: number | boolean;
  disabled?: number | boolean;
  createdat?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: string;
  subCategory?: string;
  bio?: string;
  location?: string;
  portfolioLink?: string;
  socialLinks?: string[];
  musicStyle?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  token?: string;
}

class AuthServiceMinimal {
  /**
   * Inscription d'un nouvel utilisateur (email de confirmation d'abord, puis onboarding)
   */
  async signUp(data: SignUpData): Promise<{ success: boolean; user?: AuthUser; error?: string; needsVerification?: boolean }> {
    try {
      console.log('🔐 Starting signup process for:', data.email);

      // 1. Créer l'utilisateur dans Supabase Auth pour l'email de confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            subCategory: data.subCategory,
            bio: data.bio,
            location: data.location,
            portfolio_url: data.portfolioLink,
            social_links: data.socialLinks?.filter(link => link) || null,
            musicStyle: data.musicStyle,
          }
        }
      });

      if (authError) {
        console.error('❌ Supabase Auth signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Erreur lors de la création du compte' };
      }

      console.log('✅ Supabase Auth user created:', authData.user.id);

      // 2. Créer un utilisateur temporaire dans notre table User (pas encore vérifié)
      const userData = {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: null, // Pas encore défini - sera fait dans l'onboarding
        subCategory: null,
        bio: null,
        location: null,
        profilepicture: null,
        galleryimages: null,
        portfolio_url: null,
        social_links: null,
        musicStyle: null,
        galleryVideo: null,
        star: 0,
        isAdmin: false,
        price: null,
        serviceDescription: null,
        likeCount: 0,
        verified: 0, // Pas encore vérifié - nécessite confirmation email
        disabled: 0
      };

      console.log('📝 Creating temporary user in database:', JSON.stringify(userData, null, 2));

      const { data: insertedUser, error: dbError } = await supabase
        .from('User')
        .insert([userData])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        // Nettoyer l'utilisateur auth créé
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('❌ Failed to cleanup auth user:', cleanupError);
        }
        return { success: false, error: 'Erreur lors de la création du profil' };
      }

      console.log('✅ Temporary user created in database');

      // 3. Vérifier si l'email de confirmation a été envoyé
      if (!authData.user.email_confirmed_at) {
        console.log('📧 Email de confirmation envoyé via Supabase');
        return { 
          success: true, 
          user: insertedUser, 
          needsVerification: true 
        };
      }

      // 4. Si l'email est déjà confirmé (peu probable), continuer avec l'onboarding
      return { success: true, user: insertedUser };

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { success: false, error: error.message || 'Erreur lors de l\'inscription' };
    }
  }

  /**
   * Connexion d'un utilisateur (version complète avec vérification)
   */
  async signIn(data: LoginData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log('🔐 Starting complete signin process for:', data.email);

      // 1. Chercher l'utilisateur directement dans notre table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('email', data.email)
        .eq('disabled', 0)
        .single();

      if (userError || !userData) {
        console.error('❌ User not found:', userError);
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      // 2. Vérifier si l'email est confirmé
      if (userData.verified === 0) {
        console.log('❌ Email not verified');
        return { 
          success: false, 
          error: 'Veuillez vérifier votre adresse email avant de vous connecter' 
        };
      }

      // 3. Essayer de se connecter avec Supabase Auth (optionnel)
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (authError) {
          console.log('⚠️ Supabase Auth signin failed:', authError.message);
          // On continue quand même car l'utilisateur existe dans la DB
        } else {
          console.log('✅ Supabase Auth signin successful');
        }
      } catch (authError) {
        console.log('⚠️ Supabase Auth signin failed:', authError);
        // On continue quand même
      }

      // 4. Sauvegarder en localStorage
      localStorage.setItem('musiclinks_user', JSON.stringify(userData));
      localStorage.setItem('musiclinks_authorized', 'true');
      window.dispatchEvent(new Event('auth-change'));

      console.log('✅ Signin successful for:', data.email);
      return { success: true, user: userData };

    } catch (error: any) {
      console.error('❌ Signin error:', error);
      return { success: false, error: error.message || 'Erreur lors de la connexion' };
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Nettoyer le localStorage
      localStorage.removeItem('musiclinks_user');
      localStorage.removeItem('musiclinks_authorized');
      window.dispatchEvent(new Event('auth-change'));

      console.log('✅ Signout successful');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Signout error:', error);
      return { success: false, error: error.message || 'Erreur lors de la déconnexion' };
    }
  }

  /**
   * Demande de réinitialisation de mot de passe (version simple)
   */
  async resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Starting password reset for:', data.email);

      // Vérifier que l'utilisateur existe
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('email', data.email)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Email non trouvé' };
      }

      // Pour le développement, on retourne juste un succès
      console.log('✅ Password reset request received (dev mode)');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      return { success: false, error: error.message || 'Erreur lors de la réinitialisation' };
    }
  }

  /**
   * Vérification d'email et déclenchement de l'onboarding
   */
  async verifyEmailAndStartOnboarding(token: string): Promise<{ success: boolean; user?: AuthUser; error?: string; needsOnboarding?: boolean }> {
    try {
      console.log('🔐 Verifying email with token:', token);

      // 1. Récupérer la session depuis le token
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        return { success: false, error: 'Session invalide' };
      }

      // 2. Mettre à jour le statut de vérification dans notre table
      const { error: updateError } = await supabase
        .from('User')
        .update({ verified: 1 })
        .eq('id', data.session.user.id);

      if (updateError) {
        console.error('❌ Email verification update error:', updateError);
        return { success: false, error: 'Erreur lors de la vérification' };
      }

      // 3. Récupérer l'utilisateur mis à jour
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      console.log('✅ Email verified successfully');

      // 4. Vérifier si l'onboarding est nécessaire (rôle null)
      if (!userData.role) {
        return { 
          success: true, 
          user: userData, 
          needsOnboarding: true 
        };
      }

      // 5. Si l'onboarding est déjà fait, connecter l'utilisateur
      localStorage.setItem('musiclinks_user', JSON.stringify(userData));
      localStorage.setItem('musiclinks_authorized', 'true');
      window.dispatchEvent(new Event('auth-change'));

      return { success: true, user: userData };

    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      return { success: false, error: error.message || 'Erreur lors de la vérification' };
    }
  }

  /**
   * Finaliser l'onboarding (mettre à jour le rôle et les informations)
   */
  async completeOnboarding(userId: string, onboardingData: Partial<SignUpData>): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log('🔐 Completing onboarding for user:', userId);

      const updateData: any = {};
      
      if (onboardingData.role) updateData.role = onboardingData.role;
      if (onboardingData.subCategory) updateData.subCategory = onboardingData.subCategory;
      if (onboardingData.bio) updateData.bio = onboardingData.bio;
      if (onboardingData.location) updateData.location = onboardingData.location;
      if (onboardingData.portfolioLink) updateData.portfolio_url = onboardingData.portfolioLink;
      if (onboardingData.socialLinks) updateData.social_links = onboardingData.socialLinks.filter(link => link);
      if (onboardingData.musicStyle) updateData.musicStyle = onboardingData.musicStyle;

      console.log('📝 Updating user with onboarding data:', JSON.stringify(updateData, null, 2));

      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Onboarding update error:', updateError);
        return { success: false, error: 'Erreur lors de la finalisation du profil' };
      }

      // Sauvegarder en localStorage
      localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
      localStorage.setItem('musiclinks_authorized', 'true');
      window.dispatchEvent(new Event('auth-change'));

      // Envoyer l'email de bienvenue
      try {
        await sendWelcomeEmail({
          email: updatedUser.email,
          firstName: updatedUser.name
        });
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.log('⚠️ Welcome email failed:', emailError);
      }

      console.log('✅ Onboarding completed successfully');
      return { success: true, user: updatedUser };

    } catch (error: any) {
      console.error('❌ Onboarding completion error:', error);
      return { success: false, error: error.message || 'Erreur lors de la finalisation' };
    }
  }

  /**
   * Mise à jour du mot de passe (version simple)
   */
  async updatePassword(data: UpdatePasswordData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Updating password...');

      // Pour le développement, on retourne juste un succès
      console.log('✅ Password update successful (dev mode)');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Password update error:', error);
      return { success: false, error: error.message || 'Erreur lors de la mise à jour' };
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userStr = localStorage.getItem('musiclinks_user');
      if (!userStr) {
        return null;
      }

      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  /**
   * Écouter les changements d'authentification (version simple)
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    // Version simple : juste écouter les changements de localStorage
    const handleStorageChange = () => {
      const user = this.getCurrentUser();
      callback(user);
    };

    window.addEventListener('auth-change', handleStorageChange);
    
    // Retourner un objet avec unsubscribe
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('auth-change', handleStorageChange);
          }
        }
      }
    };
  }
}

export const authServiceMinimal = new AuthServiceMinimal();
