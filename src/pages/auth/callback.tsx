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
          
          // PAUSE DE 2 SECONDES POUR VOIR LES LOGS
          console.log('⏳ AuthCallback - Pause de 2 secondes pour voir les logs...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
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

          // PAUSE DE 1 SECONDE POUR VOIR LES LOGS
          console.log('⏳ AuthCallback - Pause de 1 seconde pour voir les logs...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (profileError && profileError.code === 'PGRST116') {
            // Profil non trouvé - créer un profil de base
            console.log('📝 AuthCallback - Profil non trouvé, création du profil de base');
            const { data: newProfile, error: createError } = await supabase
              .from('User')
              .insert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Nouvel utilisateur',
                role: session.user.user_metadata?.role || null,
                subCategory: session.user.user_metadata?.subCategory || null,
                bio: session.user.user_metadata?.bio || null,
                location: session.user.user_metadata?.location || null,
                portfolio_url: session.user.user_metadata?.portfolio_url || null,
                social_links: session.user.user_metadata?.social_links || null,
                musicStyle: session.user.user_metadata?.musicStyle || null,
                verified: 1, // Email vérifié automatiquement
                disabled: 0,
                createdat: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ AuthCallback - Erreur création profil:', createError);
              setStatus('error');
              return;
            }

            console.log('✅ AuthCallback - Profil créé avec succès');
            
            // Si l'utilisateur a déjà un rôle, rediriger vers la page d'accueil
            if (session.user.user_metadata?.role) {
              console.log('👤 AuthCallback - Utilisateur avec rôle, redirection vers /');
              setTimeout(() => {
                console.log('➡️ AuthCallback - Redirection vers /');
                window.location.href = "/";
              }, 1000);
            } else {
              // Sinon, rediriger vers la sélection du rôle
              console.log('🎭 AuthCallback - Utilisateur sans rôle, redirection vers /signup/continue');
              setTimeout(() => {
                console.log('➡️ AuthCallback - Redirection vers /signup/continue');
                window.location.href = "/signup/continue";
              }, 1000);
            }
          } else if (profile && profile.role) {
            console.log('👤 AuthCallback - Profil existant avec rôle trouvé, redirection vers /');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /');
              window.location.href = "/";
            }, 1000);
          } else if (profile && !profile.role) {
            console.log('⚠️ AuthCallback - Profil trouvé mais sans rôle, redirection vers /signup/continue');
            setTimeout(() => {
              console.log('➡️ AuthCallback - Redirection vers /signup/continue');
              window.location.href = "/signup/continue";
            }, 1000);
          } else {
            console.log('❌ AuthCallback - Erreur inattendue lors de la vérification du profil');
            setStatus('error');
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