import { supabase } from './supabaseClient';
import { sendWelcomeEmail } from './emailService';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: string;
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

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  subCategory?: string;
  bio?: string;
  location?: string;
  portfolio_url?: string;
  social_links?: string[];
  musicStyle?: string;
  verified: number;
  disabled: number;
}

class AuthServiceSimple {
  /**
   * Inscription d'un nouvel utilisateur (version simplifiée)
   */
  async signUp(data: SignUpData): Promise<{ success: boolean; user?: AuthUser; error?: string; needsVerification?: boolean }> {
    try {
      console.log('🔐 Starting simple signup process for:', data.email);

      // 1. Créer l'utilisateur dans Supabase Auth (sans confirmation d'email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
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

      // 2. Créer l'utilisateur dans notre table User (avec gestion d'erreur RLS)
      const userData = {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        verified: 1, // Directement vérifié
        disabled: 0,
        role: null,
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
        created_at: new Date().toISOString()
      };

      console.log('📝 Creating user in database manually:', JSON.stringify(userData, null, 2));

      let insertedUser = null;
      
      try {
        const { data: userResult, error: dbError } = await supabase
          .from('User')
          .insert([userData])
          .select()
          .single();

        if (dbError) {
          console.error('❌ Database insert error:', dbError);
          console.error('❌ Error details:', dbError);
          
          // Si c'est une erreur RLS, continuer sans créer dans User
          if (dbError.code === '42501' || dbError.message?.includes('row-level security')) {
            console.log('⚠️ RLS error detected, continuing without User table creation');
            insertedUser = userData; // Utiliser les données locales
          } else {
            return { success: false, error: 'Erreur lors de la création du profil' };
          }
        } else {
          insertedUser = userResult;
          console.log('✅ User created in database successfully:', insertedUser);
        }
      } catch (error) {
        console.error('❌ Database error:', error);
        console.log('⚠️ Continuing without User table creation');
        insertedUser = userData; // Utiliser les données locales
      }

      // 3. Connecter l'utilisateur directement
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (signInError) {
        console.error('❌ Auto signin error:', signInError);
        return { success: false, error: 'Erreur lors de la connexion automatique' };
      }

      // 4. Sauvegarder en localStorage
      localStorage.setItem('musiclinks_user', JSON.stringify(insertedUser));
      localStorage.setItem('musiclinks_authorized', 'true');
      window.dispatchEvent(new Event('auth-change'));

      console.log('✅ User signed in automatically');
      return { 
        success: true, 
        user: insertedUser, 
        needsVerification: false 
      };

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { success: false, error: error.message || 'Erreur lors de l\'inscription' };
    }
  }

  /**
   * Vérifier et mettre à jour le statut verified après confirmation d'email
   */
  async verifyEmailAndStartOnboarding(userId: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log('🔐 Verifying email and starting onboarding for user:', userId);

      // Mettre à jour le statut verified
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update({ verified: 1 })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating verified status:', updateError);
        return { success: false, error: 'Erreur lors de la vérification' };
      }

      console.log('✅ Email verified successfully');
      return { success: true, user: updatedUser };

    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      return { success: false, error: error.message || 'Erreur lors de la vérification' };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async signIn(data: LoginData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log('🔐 Starting signin process for:', data.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        console.error('❌ Signin error:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Erreur lors de la connexion' };
      }

      // Récupérer les données utilisateur depuis notre table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        console.error('❌ User data not found:', userError);
        return { success: false, error: 'Profil utilisateur non trouvé' };
      }

      // Vérifier si le compte est désactivé
      if (userData.disabled === 1) {
        console.log('❌ Account disabled');
        return { success: false, error: 'Ce compte a été désactivé' };
      }

      // Sauvegarder en localStorage
      localStorage.setItem('musiclinks_user', JSON.stringify(userData));
      localStorage.setItem('musiclinks_authorized', 'true');
      window.dispatchEvent(new Event('auth-change'));

      console.log('✅ Signin successful');
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Signout error:', error);
        return { success: false, error: error.message };
      }

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
   * Réinitialisation du mot de passe
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Password reset email sent');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      return { success: false, error: error.message || 'Erreur lors de la réinitialisation' };
    }
  }

  /**
   * Finaliser l'onboarding
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
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = localStorage.getItem('musiclinks_user');
      if (!userData) return null;

      return JSON.parse(userData);
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return localStorage.getItem('musiclinks_authorized') === 'true';
  }

  /**
   * Écouter les changements d'état d'authentification
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authServiceSimple = new AuthServiceSimple();