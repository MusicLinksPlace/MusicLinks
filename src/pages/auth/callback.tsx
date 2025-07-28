import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import DebugLogger from "../../components/DebugLogger";

export default function AuthCallback() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    console.log("🌐 AuthCallback - Page chargée :", window.location.href);
    console.log("🌐 AuthCallback - Hash :", window.location.hash);
    console.log("🌐 AuthCallback - Search :", window.location.search);
    console.log("🌐 AuthCallback - Pathname :", window.location.pathname);

    const checkSession = async () => {
      try {
        console.log('🔄 AuthCallback - Début de checkSession');
        
        // Vérifier la session
        console.log('🔍 AuthCallback - Appel de supabase.auth.getSession()');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 AuthCallback - Résultat getSession:', { 
          hasSession: !!session, 
          hasError: !!error, 
          userEmail: session?.user?.email,
          userId: session?.user?.id 
        });
        
        if (error) {
          console.error('❌ AuthCallback - Session check error:', error);
          setStatus('error');
          console.log('⚠️ AuthCallback - PAS DE REDIRECTION (DEBUG) - Affichage erreur');
          return;
        }

        if (session && session.user) {
          console.log('✅ AuthCallback - Session valide trouvée');
          console.log('👤 AuthCallback - User:', {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });
          console.log('🔑 AuthCallback - Access Token:', session.access_token ? 'PRESENT' : 'MISSING');
          console.log('🔄 AuthCallback - Refresh Token:', session.refresh_token ? 'PRESENT' : 'MISSING');
          console.log('⏰ AuthCallback - Expires At:', session.expires_at);
          
          setStatus('success');
          
          // PAUSE DE 3 SECONDES POUR VOIR LES LOGS
          console.log('⏳ AuthCallback - Pause de 3 secondes pour voir les logs...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Vérifier si l'utilisateur a déjà un profil
          console.log('🔍 AuthCallback - Vérification du profil utilisateur');
          const { data: profile, error: profileError } = await supabase
            .from('User')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('📊 AuthCallback - Résultat profil:', {
            hasProfile: !!profile,
            hasError: !!profileError,
            profileRole: profile?.role,
            profileName: profile?.name
          });

          // PAUSE DE 2 SECONDES POUR VOIR LES LOGS
          console.log('⏳ AuthCallback - Pause de 2 secondes pour voir les logs...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          if (profileError) {
            console.log('📝 AuthCallback - Profil non trouvé, redirection vers /signup/continue');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /signup/continue');
              window.location.href = "/signup/continue";
            }, 2000);
          } else if (profile && profile.role) {
            console.log('👤 AuthCallback - Profil existant trouvé, redirection vers /');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /');
              window.location.href = "/";
            }, 2000);
          } else {
            console.log('⚠️ AuthCallback - Profil trouvé mais sans rôle, redirection vers /signup/continue');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /signup/continue');
              window.location.href = "/signup/continue";
            }, 2000);
          }
        } else {
          console.log('❌ AuthCallback - Pas de session valide');
          console.log('⚠️ AuthCallback - PAS DE REDIRECTION (DEBUG) - Affichage erreur');
          setStatus('error');
        }
              } catch (error) {
          console.error('❌ AuthCallback - Erreur générale:', error);
          setStatus('error');
        }
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <DebugLogger pageName="AuthCallback" />
      <div className="text-center text-white">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Connexion en cours...</p>
            <p className="text-sm text-gray-300 mt-2">Vérification de votre session</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-400 text-4xl mb-4">✓</div>
            <p className="text-lg">Connexion réussie !</p>
            <p className="text-sm text-gray-300 mt-2">Redirection en cours...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-400 text-4xl mb-4">✗</div>
            <p className="text-lg">Erreur de connexion</p>
            <p className="text-sm text-gray-300 mt-2">Redirection vers la page de connexion...</p>
          </>
        )}
      </div>
    </div>
  );
} 