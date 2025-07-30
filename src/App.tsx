import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
    const handleAuthChange = async (event: string, session: Session | null) => {
        console.log(`[Auth] Event: ${event}`, session);

        if (event === 'SIGNED_OUT') {
            localStorage.removeItem('musiclinks_user');
            window.dispatchEvent(new Event('auth-change'));
            console.log('[Auth] User signed out, local storage cleared.');
            return;
        }

        if (session) {
            const { user } = session;
            console.log(`[Auth] Session found for user: ${user.email}`);

            let { data: profile, error: fetchError } = await supabase
                .from('User')
                .select('*')
                .eq('id', user.id)
                .single();

            if (fetchError) {
                console.warn(`[Auth] Could not fetch profile for user ${user.id}. Error:`, fetchError.message);
                
                if (fetchError.code === 'PGRST116') {
                    console.log(`[Auth] Profile not found for new user. Attempting to create one...`);
                    
                    const meta = user.user_metadata;
                    const profileToInsert = {
                        id: user.id,
                        email: user.email,
                        name: meta.name || user.email?.split('@')[0] || 'New User',
                        role: meta.role || 'artist',
                        subCategory: meta.subCategory || null,
                        bio: meta.bio || null,
                        location: meta.location || null,
                        portfolio_url: meta.portfolio_url || null,
                        social_links: meta.social_links || null,
                        musicStyle: meta.musicStyle || null,
                        verified: 0, 
                        disabled: 1,
                        createdat: new Date().toISOString(),
                    };
                    
                    console.log("[Auth] Attempting to insert profile with defaults:", profileToInsert);

                    const { data: newProfile, error: createError } = await supabase
                        .from('User')
                        .insert(profileToInsert)
                        .select()
                        .single();

                    if (createError) {
                        console.error(`[Auth] CRITICAL: Failed to create profile for new user ${user.id}. Error:`, createError);
                        return; 
                    }

                    console.log(`[Auth] Successfully created new profile:`, newProfile);
                    profile = newProfile;
                } else {
                    console.error(`[Auth] CRITICAL: An unhandled error occurred while fetching profile.`, fetchError);
                    return;
                }
            }

            if (profile) {
                // New logic: After fetching or creating, check if we need to update verification status.
                if (session.user.email_confirmed_at && profile.verified === 0) {
                    console.log(`[Auth] Email is confirmed. Updating profile as verified in DB...`);

                    const { data: updatedProfile, error: updateError } = await supabase
                        .from('User')
                        .update({ verified: 1 }) // Only update the 'verified' status.
                        .eq('id', user.id)
                        .select()
                        .single();
                    
                    if (updateError) {
                        console.error(`[Auth] CRITICAL: Failed to update profile status.`, updateError);
                        // Continue with the potentially stale profile, but log the error.
                    } else {
                        console.log(`[Auth] Profile status updated successfully.`, updatedProfile);
                        profile = updatedProfile; // Use the newest profile data.
                    }
                }

                console.log(`[Auth] Profile is ready, updating app state.`, profile);
                localStorage.setItem('musiclinks_user', JSON.stringify(profile));
                window.dispatchEvent(new Event('auth-change'));
            } else {
                console.error(`[Auth] CRITICAL: Reached end of auth handler but no profile was available.`);
            }
        }
    };
    
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange('INITIAL_SESSION', session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        handleAuthChange(event, session);
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
