import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import HowItWorks from '@/components/HowItWorks';
import TopUsersSection from '@/components/TopUsersSection';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showOnboardingButton, setShowOnboardingButton] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const userData = localStorage.getItem('musiclinks_user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Si l'utilisateur n'a pas de rôle, afficher le bouton d'onboarding
          if (!parsedUser.role) {
            setShowOnboardingButton(true);
          }
        }
      } catch (error) {
        console.error('❌ Index - Erreur vérification utilisateur:', error);
      }
    };

    checkUserStatus();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        
        {/* Bouton d'onboarding visible si l'utilisateur n'a pas de rôle */}
        {showOnboardingButton && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Finalisez votre profil
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Complétez votre profil pour commencer à utiliser la plateforme
              </p>
              <Button 
                onClick={() => navigate('/signup/continue')}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
              >
                Commencer la création du compte
              </Button>
            </div>
          </div>
        )}
        
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