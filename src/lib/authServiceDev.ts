import { supabase } from './supabaseClient';
import { sendWelcomeEmail } from './emailService';

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

class AuthServiceDev {
  /**
   * Inscription d'un nouvel utilisateur (version développement sans vérification d'email)
   */
  async signUp(data: SignUpData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log('🔐 Starting signup process for:', data.email);

      // 1. Créer l'utilisateur dans Supabase Auth
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

      // 2. Créer l'utilisateur dans notre table User
      const userData = {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
        subcategory: data.subCategory || null,
        bio: data.bio || null,
        location: data.location || null,
        portfolio_url: data.portfolioLink || null,
        social_links: data.socialLinks?.filter(link => link) || null,
        musicstyle: data.musicStyle || null,
        verified: 1, // Marqué comme vérifié pour le développement
        disabled: 0,
        createdat: new Date().toISOString()
      };

      const { error: dbError } = await supabase
        .from('User')
        .insert([userData]);

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

      console.log('✅ User created in database');

      // 3. Envoyer l'email de bienvenue
      try {
        await sendWelcomeEmail({
          email: data.email,
          firstName: data.name
        });
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.log('⚠️ Welcome email failed:', emailError);
        // On continue même si l'email échoue
      }

      return { success: true, user: userData };

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { success: false, error: error.message || 'Erreur lors de l\'inscription' };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async signIn(data: LoginData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log('🔐 Starting signin process for:', data.email);

      // 1. Connexion via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        console.error('❌ Supabase Auth signin error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Erreur lors de la connexion' };
      }

      // 2. Récupérer les données utilisateur depuis notre table
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', authData.user.id)
        .eq('disabled', 0)
        .single();

      if (userError || !userData) {
        console.error('❌ User data not found:', userError);
        return { success: false, error: 'Profil utilisateur non trouvé' };
      }

      // 3. Sauvegarder en localStorage
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
   * Demande de réinitialisation de mot de passe (version simplifiée)
   */
  async resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Starting password reset for:', data.email);

      // Version simplifiée : juste retourner un succès
      // En développement, on peut gérer ça manuellement
      console.log('✅ Password reset request received (dev mode)');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      return { success: false, error: error.message || 'Erreur lors de la réinitialisation' };
    }
  }

  /**
   * Mise à jour du mot de passe
   */
  async updatePassword(data: UpdatePasswordData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Updating password...');

      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        console.error('❌ Password update error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Password updated successfully');
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      const { data: userData, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        return null;
      }

      return userData;

    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  /**
   * Écouter les changements d'authentification
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('musiclinks_user');
        localStorage.removeItem('musiclinks_authorized');
        callback(null);
        return;
      }

      if (session?.user) {
        const user = await this.getCurrentUser();
        if (user) {
          localStorage.setItem('musiclinks_user', JSON.stringify(user));
          localStorage.setItem('musiclinks_authorized', 'true');
        }
        callback(user);
      }
    });
  }
}

export const authServiceDev = new AuthServiceDev();
