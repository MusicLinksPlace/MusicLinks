import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    console.log("🚀 CALLBACK - Page chargée :", window.location.href);
    console.log("🚀 CALLBACK - Hash :", window.location.hash);
    console.log("🚀 CALLBACK - Search :", window.location.search);
    console.log("🚀 CALLBACK - Pathname :", window.location.pathname);

    const handleEmailConfirmation = async () => {
      try {
        console.log('🔄 CALLBACK - Début handleEmailConfirmation');
        
        // Attendre un peu pour que Supabase traite l'URL
        console.log('⏳ CALLBACK - Attente de 1 seconde...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Récupérer la session depuis l'URL
        console.log('🔍 CALLBACK - Récupération de la session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 CALLBACK - Résultat getSession:', {
          hasSession: !!session,
          hasError: !!error,
          errorMessage: error?.message,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          emailConfirmed: session?.user?.email_confirmed_at
        });
        
        if (error) {
          console.error('❌ CALLBACK - Erreur session:', error);
          setStatus('error');
          setTimeout(() => window.location.href = "/login", 2000);
          return;
        }

        if (!session || !session.user) {
          console.log('❌ CALLBACK - Pas de session, redirection vers login');
          setStatus('error');
          setTimeout(() => window.location.href = "/login", 2000);
          return;
        }

        console.log('✅ CALLBACK - Session trouvée pour:', session.user.email);
        console.log('📧 CALLBACK - Email confirmé:', session.user.email_confirmed_at);

        // Le trigger a déjà synchronisé l'utilisateur, pas besoin de mise à jour manuelle
        console.log('📧 CALLBACK - Email confirmé, utilisateur synchronisé automatiquement');

        // Vérifier si l'utilisateur existe dans notre table User
        console.log('🔍 CALLBACK - Vérification du profil...');
        let { data: profile, error: profileError } = await supabase
          .from('User')
          .select('role, verified')
          .eq('id', session.user.id)
          .single();

        console.log('📊 CALLBACK - Profil utilisateur:', {
          profile,
          profileError,
          hasRole: profile?.role,
          verified: profile?.verified
        });

        // Si l'utilisateur n'existe pas dans User, le créer
        if (profileError && profileError.code === 'PGRST116') {
          console.log('👤 CALLBACK - Utilisateur non trouvé dans User, création...');
          
          const newUserData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            verified: 1,
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

          const { data: createdUser, error: createError } = await supabase
            .from('User')
            .insert([newUserData])
            .select()
            .single();

          if (createError) {
            console.error('❌ CALLBACK - Erreur création utilisateur:', createError);
            // Continuer avec les données locales
            profile = { role: null, verified: 1 };
          } else {
            console.log('✅ CALLBACK - Utilisateur créé:', createdUser);
            profile = createdUser;
          }
        } else if (profileError) {
          console.error('❌ CALLBACK - Erreur récupération profil:', profileError);
          setStatus('error');
          setTimeout(() => window.location.href = "/login", 2000);
          return;
        }

        // Sauvegarder l'utilisateur en localStorage
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
          verified: 1,
          disabled: 0,
          role: profile?.role || null,
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

        localStorage.setItem('musiclinks_user', JSON.stringify(userData));
        localStorage.setItem('musiclinks_authorized', 'true');
        window.dispatchEvent(new Event('auth-change'));

        if (profile && profile.role) {
          console.log('👤 CALLBACK - Utilisateur avec rôle, redirection vers /');
          setStatus('success');
          setTimeout(() => window.location.href = "/", 1000);
        } else {
          console.log('📝 CALLBACK - Pas de rôle, redirection vers onboarding');
          setStatus('success');
          setTimeout(() => window.location.href = "/signup/continue", 1000);
        }

      } catch (error) {
        console.error('❌ CALLBACK - Erreur générale:', error);
        setStatus('error');
        setTimeout(() => window.location.href = "/login", 2000);
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Finalisation de votre inscription...</p>
            <p className="text-sm text-gray-300 mt-2">Vérification en cours</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-400 text-4xl mb-4">✓</div>
            <p className="text-lg">Inscription confirmée !</p>
            <p className="text-sm text-gray-300 mt-2">Redirection en cours...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-400 text-4xl mb-4">✗</div>
            <p className="text-lg">Erreur de confirmation</p>
            <p className="text-sm text-gray-300 mt-2">Redirection vers la connexion...</p>
          </>
        )}
      </div>
    </div>
  );
} 