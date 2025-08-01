import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { sendWelcomeEmail } from "../lib/emailService";
import { useSafeNavigation } from "../hooks/use-safe-navigation";
import { handleHashRedirects, cleanHashFromUrl } from "../middleware/redirectMiddleware";
import DebugLogger from "../components/DebugLogger";

// Configuration des rôles et sous-catégories
const ROLES = [
  { id: 'artist', label: 'Artiste', emoji: '🎵', description: 'Chanteur, musicien, compositeur, DJ...' },
  { id: 'provider', label: 'Prestataire', emoji: '🎤', description: 'Studio, ingénieur son, manager, photographe...' },
  { id: 'partner', label: 'Partenaire', emoji: '🤝', description: 'Label, distributeur, média, événementiel...' },
];

const PARTNER_SUB_CATEGORIES = [
  { id: 'label', label: 'Label ou maison de disque' },
  { id: 'manager', label: 'Manager / Directeur artistique' },
];

const PROVIDER_SUB_CATEGORIES = {
  'Promotion & marketing': [
    { id: 'radio_curator', label: 'Programmateur radio / playlist' },
    { id: 'community_manager', label: 'Community manager' },
    { id: 'media', label: 'Médias' },
  ],
  'Visuel': [
    { id: 'clipmaker', label: 'Clipmaker' },
    { id: 'video_editor', label: 'Monteur vidéo' },
    { id: 'photographer', label: 'Photographe' },
    { id: 'graphic_designer', label: 'Graphiste' },
  ],
  'Droits & Distribution': [
    { id: 'distributor', label: 'Distributeur' },
    { id: 'music_lawyer', label: 'Avocat spécialisé' },
  ],
  'Formation': [
    { id: 'vocal_coach', label: 'Coach vocal' },
    { id: 'music_workshop', label: 'Ateliers de musique' },
    { id: 'danseur', label: 'Chorégraphe' },
  ],
};

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
  const [currentStep, setCurrentStep] = useState('role'); // 'role' ou 'subcategory'
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

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
        console.log("🔍 SignUpContinue - Vérification de l'authentification");
        
        // Vérifier d'abord l'authentification via localStorage
        const authStatus = localStorage.getItem('musiclinks_auth_status');
        const userData = localStorage.getItem('musiclinks_user');
        
        console.log("📊 SignUpContinue - Auth status:", authStatus);
        console.log("📊 SignUpContinue - User data exists:", !!userData);
        
        if (authStatus !== 'authenticated' || !userData) {
          console.log('❌ SignUpContinue - Pas d\'authentification locale, redirection vers /login');
          console.log('➡️ SignUpContinue - Redirection vers /login');
          safeNavigate('/login');
          return;
        }

        // Parser les données utilisateur
        let user;
        try {
          user = JSON.parse(userData);
          console.log('✅ SignUpContinue - User data parsed:', user);
        } catch (parseError) {
          console.error('❌ SignUpContinue - Error parsing user data:', parseError);
          safeNavigate('/login');
          return;
        }

        console.log('✅ SignUpContinue - Utilisateur authentifié localement');
        setUser(user);

        // Vérifier si l'utilisateur a déjà un rôle
        if (user.role) {
          console.log('✅ SignUpContinue - Utilisateur avec rôle, redirection vers /');
          console.log('➡️ SignUpContinue - Redirection vers /');
          safeNavigate('/');
          return;
        }

        // Si on arrive ici, l'utilisateur doit compléter son profil
        console.log('🎭 SignUpContinue - Utilisateur doit compléter son profil');
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
    console.log('🎭 Role selected:', role);
    setSelectedRole(role);
    
    // Si c'est un artiste, pas besoin de sous-catégorie
    if (role === 'artist') {
      await finalizeProfile(role, null);
    } else {
      // Pour les prestataires et partenaires, passer à l'étape suivante
      setCurrentStep('subcategory');
    }
  };

  const handleSubCategorySelect = async (subCategory) => {
    console.log('📋 Sub-category selected:', subCategory);
    setSelectedSubCategory(subCategory);
    await finalizeProfile(selectedRole, subCategory);
  };

  const finalizeProfile = async (role, subCategory) => {
    if (!user) return;
    setLoading(true);
    
    try {
      console.log('🎭 Finalizing profile with role:', role, 'and subCategory:', subCategory);
      
      // Mettre à jour le profil dans la base de données
      const { error } = await supabase
        .from("User")
        .update({
          role: role,
          subCategory: subCategory,
          name: user.name || user.email?.split('@')[0] || 'Nouvel utilisateur',
          verified: 1,
          disabled: 0
        })
        .eq("id", user.id);
        
      if (error) {
        console.error('❌ Error updating profile:', error);
        setError("Erreur lors de la mise à jour du profil. Merci de réessayer.");
        setLoading(false);
        return;
      }

      console.log('✅ Profile updated successfully');

      // Mettre à jour les données utilisateur dans localStorage
      const updatedUser = { ...user, role: role, subCategory: subCategory };
      localStorage.setItem('musiclinks_user', JSON.stringify(updatedUser));
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event('auth-change'));

      // Envoie l'email de bienvenue (optionnel)
      try {
        const firstName = user.name ? user.name.split(' ')[0] : 'Utilisateur';
        await sendWelcomeEmail({
          firstName: firstName,
          email: user.email
        });
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.warn('⚠️ Welcome email failed:', emailError);
        // On continue même si l'email échoue
      }

      console.log('✅ Redirecting to account page');
      // Redirige vers la page de compte utilisateur
      safeNavigate("/mon-compte", { replace: true });
    } catch (error) {
      console.error('❌ Error in finalizeProfile:', error);
      setError("Erreur lors de la finalisation de l'inscription. Merci de réessayer.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <DebugLogger pageName="SignUpContinue" />
        
        <div className="text-center max-w-sm w-full">
          <div className="mb-6">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Finalisation de votre inscription</h2>
          <p className="text-gray-600 text-sm">Vérification de vos informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <DebugLogger pageName="SignUpContinue" />
        <div className="text-center max-w-sm w-full">
          <div className="mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Erreur</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (selecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
        <DebugLogger pageName="SignUpContinue" />
        
        <div className="w-full max-w-md">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentStep === 'role' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentStep === 'subcategory' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className="text-center text-sm text-gray-500 font-medium">
              Étape {currentStep === 'role' ? '1' : '2'} sur 2
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {currentStep === 'role' ? 'Choisissez votre profil' : 'Sélectionnez votre spécialité'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {currentStep === 'role' 
                ? 'Sélectionnez le type de compte qui correspond à votre activité'
                : `Choisissez votre domaine d'expertise en tant que ${selectedRole === 'provider' ? 'prestataire' : 'partenaire'}`
              }
            </p>
          </div>
          
          {/* Role selection */}
          {currentStep === 'role' && (
            <div className="space-y-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="w-full group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl p-4 sm:p-6 transition-all duration-200 text-left"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-200">
                      <span className="text-lg">{role.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        {role.label}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors duration-200"></div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sub-category selection */}
          {currentStep === 'subcategory' && (
            <div className="space-y-6">
              {selectedRole === 'partner' && (
                <div className="space-y-3">
                  {PARTNER_SUB_CATEGORIES.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategorySelect(sub.id)}
                      className="w-full group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl p-4 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {sub.label}
                        </span>
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors duration-200"></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedRole === 'provider' && (
                <div className="space-y-6">
                  {Object.entries(PROVIDER_SUB_CATEGORIES).map(([domain, subCategories]) => (
                    <div key={domain} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 text-center">{domain}</h3>
                      <div className="space-y-2">
                        {subCategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubCategorySelect(sub.id)}
                            className="w-full group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-lg p-3 transition-all duration-200 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {sub.label}
                              </span>
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors duration-200"></div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Back button */}
              <button
                onClick={() => setCurrentStep('role')}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                ← Retour à la sélection du rôle
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Vous pourrez modifier ces informations plus tard dans vos paramètres
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 