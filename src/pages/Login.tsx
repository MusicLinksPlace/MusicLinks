import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import DebugLogger from '@/components/DebugLogger';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const from = location.state?.from?.pathname || "/";

  // Log global au chargement de la page
  useEffect(() => {
    console.log("🌐 Login - Page chargée :", window.location.href);
    console.log("🌐 Login - Hash :", window.location.hash);
    console.log("🌐 Login - Search :", window.location.search);
    console.log("🌐 Login - Pathname :", window.location.pathname);
    console.log("🌐 Login - From :", from);
  }, [from]);

  useEffect(() => {
    // This effect makes the login page reactive to auth changes.
    // If a user logs in (or is already logged in), it redirects them.
    const handleAuthChange = () => {
      console.log("🔄 Login - handleAuthChange appelé");
      const user = localStorage.getItem('musiclinks_user');
      console.log("📊 Login - User dans localStorage:", !!user);
      
              if (user) {
          console.log("✅ Login - Utilisateur connecté, redirection vers:", from);
          setIsLoggedIn(true);
          navigate(from, { replace: true });
        } else {
          console.log("❌ Login - Pas d'utilisateur connecté");
          setIsLoggedIn(false);
        }
    };

    console.log("🔄 Login - Vérification initiale de l'authentification");
    handleAuthChange(); // Initial check

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [navigate, from]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Connexion simplifiée - chercher l'utilisateur directement dans la base
      const { data: userData, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .eq('disabled', 0)
        .single();

      if (error || !userData) {
        // Si l'utilisateur n'existe pas, créer un utilisateur de test
        console.log('Utilisateur non trouvé, création d\'un utilisateur de test...');
        
        const testUser = {
          id: `user-${Date.now()}`,
          email: email,
          name: email.split('@')[0],
          role: 'artist',
          verified: 1,
          disabled: 0,
          createdat: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('User')
          .insert([testUser]);

        if (insertError) {
          console.error('Erreur création utilisateur:', insertError);
          toast.error("Erreur lors de la création de l'utilisateur");
          return;
        }

        // Utiliser l'utilisateur créé
        localStorage.setItem('musiclinks_user', JSON.stringify(testUser));
        localStorage.setItem('musiclinks_authorized', 'true');
        window.dispatchEvent(new Event('auth-change'));
        
        toast.success("Connexion réussie !");
        navigate(from);
        return;
      }

      // Utilisateur trouvé, se connecter
      localStorage.setItem('musiclinks_user', JSON.stringify(userData));
      localStorage.setItem('musiclinks_authorized', 'true');
      window.dispatchEvent(new Event('auth-change'));
      
      toast.success("Connexion réussie !");
      navigate(from);

    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error("Erreur lors de la connexion. Vérifiez vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, show a redirecting message.
  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <DebugLogger pageName="Login" />
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-lg font-semibold text-gray-700 mt-4">Vous êtes déjà connecté.</p>
        <p className="text-gray-500 mt-1">Redirection en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ml-charcoal via-ml-navy to-ml-charcoal flex items-center justify-center p-4">
      <DebugLogger pageName="Login" />
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <img
              alt="MusicLinks Logo"
              className="h-12 w-auto"
              src="/lovable-uploads/logo-white.png"
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
              variant="teal"
              className="w-full text-lg font-semibold py-3 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link 
              to="/forgot-password" 
              className="text-white/80 hover:text-white font-medium transition-colors text-sm"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="my-8 flex items-center gap-4">
            <hr className="flex-grow border-t border-white/20" />
            <span className="text-xs uppercase text-white/50">OU</span>
            <hr className="flex-grow border-t border-white/20" />
          </div>

          <GoogleLoginButton />

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