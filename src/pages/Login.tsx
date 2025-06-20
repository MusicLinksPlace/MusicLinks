import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // This effect makes the login page reactive to auth changes.
    // If a user logs in (or is already logged in), it redirects them.
    const handleAuthChange = () => {
      const user = localStorage.getItem('musiclinks_user');
      if (user) {
        setIsLoggedIn(true);
        navigate(from, { replace: true });
      } else {
        setIsLoggedIn(false);
      }
    };

    handleAuthChange(); // Initial check

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [navigate, from]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // On success, the 'onAuthStateChange' in App.tsx will fire.
      // The local 'auth-change' listener will then handle the redirection.
      toast.success("Vérification...");

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If user is already logged in, show a redirecting message.
  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-lg font-semibold text-gray-700 mt-4">Vous êtes déjà connecté.</p>
        <p className="text-gray-500 mt-1">Redirection en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ml-charcoal via-ml-navy to-ml-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <img
              alt="MusicLinks Logo"
              className="h-12 w-auto"
              src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png"
            />
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Bon retour !
          </h1>
          <p className="text-white/70">
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl"
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-ml-teal hover:bg-ml-teal/90 text-white font-semibold py-3 rounded-xl text-lg transition-all duration-300 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="text-center mt-8">
            <p className="text-white/70 text-sm">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-ml-teal hover:text-ml-teal/80 font-medium transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 