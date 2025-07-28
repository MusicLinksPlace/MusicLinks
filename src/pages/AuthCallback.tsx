import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔄 Checking session in AuthCallback...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          setStatus('error');
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }

        if (session && session.user) {
          console.log('✅ Valid session found, redirecting to home');
          setStatus('success');
          
          // Vérifier si l'utilisateur a déjà un profil
          const { data: profile, error: profileError } = await supabase
            .from('User')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile) {
            console.log('📝 No profile found, redirecting to role selection');
            setTimeout(() => {
              window.location.href = "/signup/continue";
            }, 1000);
          } else {
            console.log('👤 Profile found, redirecting to home');
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          }
        } else {
          console.log('❌ No valid session, redirecting to login');
          setStatus('error');
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } catch (error) {
        console.error('❌ AuthCallback error:', error);
        setStatus('error');
        setTimeout(() => {
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