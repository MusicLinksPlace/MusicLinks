import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import HowItWorks from '@/components/HowItWorks';
import TopUsersSection from '@/components/TopUsersSection';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      try {
        console.log('🔍 Index - Vérification de confirmation d\'email');
        
        // Vérifier si on a une session (confirmation d'email)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user && session.user.email_confirmed_at) {
          console.log('📧 Index - Email confirmé détecté, redirection vers onboarding');
          
          // Mettre à jour le statut verified dans notre table
          const { error: updateError } = await supabase
            .from('User')
            .update({ verified: 1 })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('❌ Index - Erreur mise à jour verified:', updateError);
          } else {
            console.log('✅ Index - Statut verified mis à jour');
          }

          // Vérifier si l'utilisateur a un rôle
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('❌ Index - Erreur récupération utilisateur:', userError);
            return;
          }

          if (!userData.role) {
            console.log('🎭 Index - Pas de rôle, redirection vers onboarding');
            navigate('/signup/continue');
            return;
          } else {
            console.log('✅ Index - Utilisateur avec rôle, connexion automatique');
            // Connecter l'utilisateur
            localStorage.setItem('musiclinks_user', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              role: userData.role,
              verified: 1
            }));
            localStorage.setItem('musiclinks_authorized', 'true');
            window.dispatchEvent(new Event('auth-change'));
          }
        }
      } catch (error) {
        console.error('❌ Index - Erreur vérification confirmation:', error);
      }
    };

    checkEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main>
        <HeroSection />
        <TopUsersSection role="artist" title="Top artistes du moment" />
        <ServiceCategories />
        <TopUsersSection role="provider" title="Top prestataires du moment" />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
