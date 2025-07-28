import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { sendWelcomeEmail } from "../lib/emailService";
import { useSafeNavigation } from "../hooks/use-safe-navigation";
import { handleHashRedirects, cleanHashFromUrl } from "../middleware/redirectMiddleware";
import DebugLogger from "../components/DebugLogger";

// Désactiver les scripts FIDO2 qui peuvent interférer avec l'authentification
const disableFIDO2Scripts = () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.credentials) {
      // Sauvegarder l'API originale
      const originalCreate = navigator.credentials.create;
      const originalGet = navigator.credentials.get;
      
      // Redéfinir avec gestion d'erreur robuste
      if (originalCreate && typeof originalCreate === 'function') {
        navigator.credentials.create = function(...args) {
          try {
            return originalCreate.apply(this, args);
          } catch (error) {
            console.warn('🔒 FIDO2 create error intercepted:', error);
            return Promise.reject(new Error('FIDO2 operation blocked'));
          }
        };
      }
      
      if (originalGet && typeof originalGet === 'function') {
        navigator.credentials.get = function(...args) {
          try {
            return originalGet.apply(this, args);
          } catch (error) {
            console.warn('🔒 FIDO2 get error intercepted:', error);
            return Promise.reject(new Error('FIDO2 operation blocked'));
          }
        };
      }
      
      console.log('🔒 FIDO2 protection enabled');
    }
  } catch (error) {
    console.warn('⚠️ FIDO2 protection setup failed:', error);
  }
};

export default function SignUpContinue() {
  const navigate = useNavigate();
  const location = useLocation();
  const safeNavigate = useSafeNavigation();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Log global au chargement de la page
  useEffect(() => {
    console.log("🚀 SignUpContinue - COMPOSANT MONTÉ");
    console.log("🌐 SignUpContinue - Page chargée :", window.location.href);
    console.log("🌐 SignUpContinue - Hash :", window.location.hash);
    console.log("🌐 SignUpContinue - Search :", window.location.search);
    console.log("🌐 SignUpContinue - Pathname :", window.location.pathname);
    
    // PAUSE DE 1 SECONDE POUR VOIR LES LOGS
    setTimeout(() => {
      console.log("⏳ SignUpContinue - Pause terminée, continuation...");
    }, 1000);
  }, []);

  useEffect(() => {
    console.log("🔄 SignUpContinue - Début du useEffect principal");
    
    // Éviter les boucles de redirection
    if (isProcessing) {
      console.log('🔄 SignUpContinue - Already processing, skipping...');
      return;
    }
    
    setIsProcessing(true);
    console.log("🔄 SignUpContinue - isProcessing set to true");
    
    // Désactiver les scripts FIDO2 qui peuvent interférer
    console.log("🔒 SignUpContinue - Désactivation FIDO2");
    disableFIDO2Scripts();
    
    // Utiliser le middleware pour gérer les redirections avec hash
    console.log("🛡️ SignUpContinue - Vérification middleware hash");
    if (handleHashRedirects()) {
      console.log("🛡️ SignUpContinue - Redirection middleware effectuée, arrêt");
      return; // Arrêter l'exécution si une redirection a été effectuée
    }
    
    // Nettoyer l'URL si nécessaire
    console.log("🧹 SignUpContinue - Nettoyage URL");
    cleanHashFromUrl();
    
    const handleAuthRedirect = async () => {
      try {
        console.log("🔍 SignUpContinue - Vérification de la session");
        
        // Vérifier d'abord si l'utilisateur a déjà une session valide
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("📊 SignUpContinue - Résultat getSession:", {
          hasSession: !!session,
          hasError: !!sessionError,
          userEmail: session?.user?.email,
          userId: session?.user?.id
        });
        
        if (sessionError) {
          console.error('❌ SignUpContinue - Session check error:', sessionError);
          console.log('➡️ SignUpContinue - Redirection vers /login (erreur session)');
          safeNavigate('/login');
          return;
        }

        // Si pas de session, rediriger vers login
        if (!session || !session.user) {
          console.log('❌ SignUpContinue - Pas de session valide, redirection vers /login');
          console.log('➡️ SignUpContinue - Redirection vers /login');
          safeNavigate('/login');
          return;
        }

        console.log('✅ SignUpContinue - Session valide trouvée');
        console.log('👤 SignUpContinue - User:', {
          id: session.user.id,
          email: session.user.email
        });

        // Attendre un peu pour que l'authentification se stabilise
        console.log("⏳ SignUpContinue - Attente stabilisation auth (1s)");
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Récupérer l'utilisateur actuel
        console.log("🔍 SignUpContinue - Récupération utilisateur");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log("📊 SignUpContinue - Résultat getUser:", {
          hasUser: !!user,
          hasError: !!userError,
          userEmail: user?.email
        });
        
        if (userError) {
          console.error('❌ SignUpContinue - Error getting user:', userError);
          setError("Erreur lors de la récupération des données utilisateur.");
          setLoading(false);
          return;
        }

        if (!user) {
          console.log('❌ SignUpContinue - Pas d\'utilisateur trouvé, redirection vers /login');
          console.log('➡️ SignUpContinue - Redirection vers /login');
          safeNavigate('/login');
          return;
        }

        console.log('✅ SignUpContinue - Utilisateur trouvé:', user.email);
        setUser(user);

        // Vérifier si l'utilisateur a déjà un profil
        console.log("🔍 SignUpContinue - Vérification du profil utilisateur");
        const { data: profile, error: profileError } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log("📊 SignUpContinue - Résultat profil:", {
          hasProfile: !!profile,
          hasError: !!profileError,
          profileRole: profile?.role,
          profileName: profile?.name
        });

        if (profileError) {
          console.log('📝 SignUpContinue - Profil non trouvé, utilisateur doit compléter setup');
          // Continuer avec la sélection de rôle
        } else if (profile && profile.role) {
          console.log('✅ SignUpContinue - Profil existant trouvé, redirection vers /');
          console.log('➡️ SignUpContinue - Redirection vers /');
          safeNavigate('/');
          return;
        }

        // Si on arrive ici, l'utilisateur doit compléter son profil
        console.log('👤 SignUpContinue - Utilisateur doit compléter son profil');
        setSelecting(true);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ SignUpContinue - Erreur dans handleAuthRedirect:', error);
        setError("Une erreur est survenue. Merci de réessayer.");
        setLoading(false);
      }
    };

    handleAuthRedirect();
  }, [safeNavigate, location, isProcessing]);

  const handleRoleSelect = async (role) => {
    if (!user) return;
    setLoading(true);
    
    try {
      console.log('🎭 Setting role:', role, 'for user:', user.id);
      
      // Met à jour le champ 'role' dans la table User
      const { error } = await supabase
        .from("User")
        .update({ role })
        .eq("id", user.id);
        
      if (error) {
        console.error('❌ Error updating role:', error);
        setError("Erreur lors de la mise à jour du rôle. Merci de réessayer.");
        setLoading(false);
        return;
      }

      console.log('✅ Role updated successfully');

      // Récupère les informations utilisateur pour l'email de bienvenue
      const { data: userProfile } = await supabase
        .from('User')
        .select('name, email')
        .eq('id', user.id)
        .single();

      // Envoie l'email de bienvenue
      if (userProfile) {
        try {
          const firstName = userProfile.name ? userProfile.name.split(' ')[0] : 'Utilisateur';
          await sendWelcomeEmail({
            firstName: firstName,
            email: userProfile.email
          });
          console.log('✅ Welcome email sent');
        } catch (emailError) {
          console.warn('⚠️ Welcome email failed:', emailError);
          // On continue même si l'email échoue
        }
      }

      // Mettre à jour le localStorage avec les nouvelles données utilisateur
      const { data: updatedUser } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedUser) {
        localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth-change'));
      }

      console.log('✅ Redirecting to account page');
      // Redirige vers la page de compte utilisateur
      safeNavigate("/mon-compte", { replace: true });
    } catch (error) {
      console.error('❌ Error in handleRoleSelect:', error);
      setError("Erreur lors de la finalisation de l'inscription. Merci de réessayer.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <DebugLogger pageName="SignUpContinue" />
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Finalisation de votre inscription</h2>
          <p className="text-white/80">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <DebugLogger pageName="SignUpContinue" />
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center max-w-md">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Erreur</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (selecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <DebugLogger pageName="SignUpContinue" />
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6">Choisissez votre rôle</h2>
          <p className="text-white/80 mb-8">
            Sélectionnez le type de compte qui correspond le mieux à votre activité
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('artist')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-lg font-semibold">🎵 Artiste</div>
              <div className="text-sm opacity-90">Chanteur, musicien, compositeur...</div>
            </button>
            
            <button
              onClick={() => handleRoleSelect('provider')}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-lg font-semibold">🎤 Prestataire</div>
              <div className="text-sm opacity-90">Studio, ingénieur, manager...</div>
            </button>
            
            <button
              onClick={() => handleRoleSelect('partner')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-lg font-semibold">🤝 Partenaire</div>
              <div className="text-sm opacity-90">Label, distributeur, média...</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 