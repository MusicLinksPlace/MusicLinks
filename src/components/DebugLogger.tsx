import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface DebugLoggerProps {
  pageName: string;
}

export default function DebugLogger({ pageName }: DebugLoggerProps) {
  useEffect(() => {
    console.log(`🌐 ${pageName} - Page chargée :`, window.location.href);
    console.log(`🌐 ${pageName} - Hash :`, window.location.hash);
    console.log(`🌐 ${pageName} - Search :`, window.location.search);
    console.log(`🌐 ${pageName} - Pathname :`, window.location.pathname);

    // Vérifier la session Supabase
    const checkSession = async () => {
      try {
        console.log(`🔍 ${pageName} - Vérification session Supabase...`);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log(`📊 ${pageName} - Résultat session:`, {
          hasSession: !!session,
          hasError: !!error,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          sessionExpiresAt: session?.expires_at,
          accessToken: session?.access_token ? 'PRESENT' : 'MISSING',
          refreshToken: session?.refresh_token ? 'PRESENT' : 'MISSING'
        });

        if (error) {
          console.error(`❌ ${pageName} - Erreur session:`, error);
        }

        // Vérifier aussi le localStorage
        const localUser = localStorage.getItem('musiclinks_user');
        console.log(`💾 ${pageName} - User localStorage:`, localUser ? 'PRESENT' : 'MISSING');

        if (localUser) {
          try {
            const parsedUser = JSON.parse(localUser);
            console.log(`👤 ${pageName} - User localStorage details:`, {
              id: parsedUser.id,
              email: parsedUser.email,
              role: parsedUser.role
            });
          } catch (e) {
            console.error(`❌ ${pageName} - Erreur parsing localStorage:`, e);
          }
        }

      } catch (error) {
        console.error(`💥 ${pageName} - Erreur lors de la vérification session:`, error);
      }
    };

    checkSession();
  }, [pageName]);

  return null; // Ce composant ne rend rien visuellement
} 