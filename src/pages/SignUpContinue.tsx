import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { sendWelcomeEmail } from "../lib/emailService";
import { useSafeNavigation } from "../hooks/use-safe-navigation";
import { handleHashRedirects, cleanHashFromUrl } from "../middleware/redirectMiddleware";

// Désactiver les scripts FIDO2 qui peuvent interférer avec l'authentification
const disableFIDO2Scripts = () => {
  try {
    // Désactiver les scripts FIDO2 externes
    const fido2Scripts = document.querySelectorAll('script[src*="fido2"]');
    fido2Scripts.forEach(script => {
      script.setAttribute('data-disabled', 'true');
      (script as HTMLElement).style.display = 'none';
    });
    
    // Nettoyer les variables globales FIDO2
    if ((window as any).FIDO2) {
      delete (window as any).FIDO2;
    }
    
    console.log('🔒 FIDO2 scripts disabled for SSO flow');
  } catch (error) {
    console.warn('⚠️ Could not disable FIDO2 scripts:', error);
  }
};

const ROLE_OPTIONS = [
  { label: "Artiste", value: "artist" },
  { label: "Prestataire", value: "provider" },
  { label: "Partenaire Stratégique", value: "partner" },
];

export default function SignUpContinue() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const safeNavigate = useSafeNavigation();
  const location = useLocation();

  useEffect(() => {
    // Éviter les boucles de redirection
    if (isProcessing) {
      console.log('🔄 Already processing, skipping...');
      return;
    }
    
    setIsProcessing(true);
    
    // Désactiver les scripts FIDO2 qui peuvent interférer
    disableFIDO2Scripts();
    
    // Utiliser le middleware pour gérer les redirections avec hash
    if (handleHashRedirects()) {
      return; // Arrêter l'exécution si une redirection a été effectuée
    }
    
    // Nettoyer l'URL si nécessaire
    cleanHashFromUrl();
    
    const handleAuthRedirect = async () => {
      try {
        // Attendre un peu pour que l'authentification se stabilise
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.log('❌ No user found, redirecting to login');
          safeNavigate('/login', { replace: true });
          return;
        }

        console.log('✅ User found:', data.user.email);
        setUser(data.user);

        // Vérifie le champ 'role' dans la table User
        const { data: userProfile, error: userError } = await supabase
          .from('User')
          .select('role, name, email')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.log('❌ User profile error:', userError);
          // Si l'utilisateur n'existe pas encore dans la table User, on le crée
          if (userError.code === 'PGRST116') {
            console.log('🆕 Creating new user profile...');
            const { error: insertError } = await supabase
              .from('User')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
                role: null, // Sera défini plus tard
                verified: 1,
                disabled: 0,
                isAdmin: false
              });
            
            if (insertError) {
              console.error('❌ Error creating user profile:', insertError);
              setError("Erreur lors de la création du profil utilisateur.");
              setLoading(false);
              return;
            }
            
            console.log('✅ User profile created');
            setSelecting(true);
            setLoading(false);
            return;
          } else {
            setError("Impossible de récupérer le profil utilisateur.");
            setLoading(false);
            return;
          }
        }

        if (userProfile && userProfile.role) {
          console.log('✅ User already has role, redirecting to account');
          // Si le rôle existe déjà, redirige directement
          safeNavigate('/mon-compte', { replace: true });
          return;
        }

        console.log('🎭 User needs to select role');
        setSelecting(true);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error in handleAuthRedirect:', error);
        setError("Une erreur est survenue. Merci de réessayer.");
        setLoading(false);
      }
    };

    handleAuthRedirect();
  }, [navigate, location]);

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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center max-w-md">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Erreur</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (!selecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Vérification de votre compte</h2>
          <p className="text-white/80">Préparation de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Choisissez votre type de compte</h2>
          <p className="text-white/80">Sélectionnez le type de profil qui vous correspond le mieux</p>
        </div>
        
        <div className="space-y-4">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRoleSelect(opt.value)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        {loading && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white/60 text-sm">Configuration de votre compte...</p>
          </div>
        )}
      </div>
    </div>
  );
} 