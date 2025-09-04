import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { handleHashRedirects, setupUrlInterceptor } from './middleware/redirectMiddleware';
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import ProvidersPage from "./pages/Providers";
import Project from "./pages/Projects";
import HowItWorks from "./pages/HowItWorks";
import Legal from "./pages/Legal";
import ArtistSetup from "./pages/ArtistSetup";
import ArtistAccount from "./pages/ArtistAccount";
import NotFound from "./pages/NotFound";
import ArtistsPage from './pages/Artists';
import PartnersPage from './pages/Partners';
import UserProfile from './pages/UserProfile';
import { supabase } from './lib/supabaseClient';
import { authServiceSimple as authService } from './lib/authServiceSimple';
import ConfirmPage from './pages/Confirm';
import type { Session } from '@supabase/supabase-js';
import ScrollToTop from './components/ScrollToTop';
import SignUpContinue from './pages/SignUpContinue';
import AuthCallback from './pages/auth/callback';
import ProviderProfileSettings from './pages/ProviderProfileSettings';
import AccountSettingsRouter from './pages/AccountSettingsRouter';
import PartnerAccountSettings from './pages/PartnerAccount';
import About from './pages/About';
import ArtistProfileSettings from './pages/ArtistProfileSettings';
import PartnerProfileSettings from './pages/PartnerProfileSettings';
import Chat from './pages/Chat';
import AdminUsers from './pages/AdminUsers';
import ErrorBoundary from './components/ErrorBoundary';
import VideoTest from './components/VideoTest';


const queryClient = new QueryClient();

const App = () => {

  // Log global au démarrage de l'app
  useEffect(() => {
    console.log("🌐 App - Application démarrée");
    console.log("🌐 App - URL actuelle :", window.location.href);
    console.log("🌐 App - Hash :", window.location.hash);
    console.log("🌐 App - Search :", window.location.search);
    console.log("🌐 App - Pathname :", window.location.pathname);
  }, []);

  useEffect(() => {
    // Utiliser le nouveau service d'authentification
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('[Auth] Auth state changed:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        // Récupérer les données utilisateur depuis localStorage
        const userData = localStorage.getItem('musiclinks_user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            
            // Vérifier si le compte est désactivé
            if (user.disabled === 1 || user.disabled === true) {
              console.log('[Auth] User account is disabled. Signing out user.');
              authService.signOut();
              toast.error("Votre compte a été désactivé. Vous ne pouvez plus vous connecter.");
              return;
            }
            
            // Vérifier si l'utilisateur a un rôle (profil complet)
            if (!user.role && window.location.pathname !== '/signup/continue') {
              console.log('[Auth] User has no role, redirecting to onboarding');
              window.location.href = '/signup/continue';
              return;
            }
            
            console.log('[Auth] User authenticated:', user.email);
          } catch (error) {
            console.error('[Auth] Error parsing user data:', error);
          }
        }
      } else {
        console.log('[Auth] User signed out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("🔄 App - Configuration du middleware de redirection");
    // Configuration du middleware de redirection
    setupUrlInterceptor();
    
    // Vérifier et gérer les redirections avec hash
    console.log("🛡️ App - Vérification des redirections avec hash");
    if (handleHashRedirects()) {
      console.log("🛡️ App - Redirection middleware effectuée, arrêt");
      return; // Arrêter l'exécution si une redirection a été effectuée
    }
    
    const syncProfile = async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (session && session.user) {
        let { data: profile, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!error && profile) {
          localStorage.setItem('musiclinks_user', JSON.stringify(profile));
          window.dispatchEvent(new Event('auth-change'));
        }
      }
    };
    syncProfile();
  }, []);

  // Protection par mot de passe supprimée pour permettre l'accès libre

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <ScrollToTop />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signup/continue" element={<SignUpContinue />} />
          <Route path="/signup/continue/*" element={<SignUpContinue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/Project" element={<Project />} />
            <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/profile/artist-setup" element={<ArtistSetup />} />
            <Route path="/profile/artist" element={<ArtistProfileSettings />} />
            <Route path="/profile/partner" element={<PartnerProfileSettings />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/provider-settings" element={<ProviderProfileSettings />} />
            <Route path="/confirm" element={<ConfirmPage />} />
            <Route path="/mon-compte" element={<AccountSettingsRouter />} />
            <Route path="/partner-account" element={<PartnerAccountSettings />} />
                        <Route path="/chat" element={<Chat />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/video-test" element={<VideoTest />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
};

export default App;
