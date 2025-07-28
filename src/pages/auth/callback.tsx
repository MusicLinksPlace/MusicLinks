import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
          console.log('➡️ AuthCallback - Redirection vers /login (erreur session)');
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }

        if (session && session.user) {
          console.log('✅ AuthCallback - Session valide trouvée');
          console.log('👤 AuthCallback - User:', {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });
          setStatus('success');
          
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

          if (profileError) {
            console.log('📝 AuthCallback - Profil non trouvé, redirection vers /signup/continue');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /signup/continue');
              window.location.href = "/signup/continue";
            }, 1000);
          } else if (profile && profile.role) {
            console.log('👤 AuthCallback - Profil existant trouvé, redirection vers /');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /');
              window.location.href = "/";
            }, 1000);
          } else {
            console.log('⚠️ AuthCallback - Profil trouvé mais sans rôle, redirection vers /signup/continue');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /signup/continue');
              window.location.href = "/signup/continue";
            }, 1000);
          }
        } else {
          console.log('❌ AuthCallback - Pas de session valide, redirection vers /login');
          setStatus('error');
          setTimeout(() => {
            console.log('➡️ AuthCallback - Redirection vers /login');
            window.location.href = "/login";
          }, 2000);
        }
      } catch (error) {
        console.error('❌ AuthCallback - Erreur générale:', error);
        setStatus('error');
        setTimeout(() => {
          console.log('➡️ AuthCallback - Redirection vers /login (erreur générale)');
          window.location.href = "/login";
        }, 2000);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
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