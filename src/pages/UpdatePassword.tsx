import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { authServiceMinimal as authService, UpdatePasswordData } from '@/lib/authServiceMinimal';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Vérifier si l'utilisateur a une session valide pour la réinitialisation
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la vérification de la session:', error);
          toast.error('Lien de réinitialisation invalide ou expiré');
          navigate('/login');
          return;
        }

        // Si pas de session, vérifier s'il y a un token dans l'URL
        if (!session) {
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { data, error: tokenError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (tokenError) {
              console.error('Erreur lors de la validation du token:', tokenError);
              toast.error('Lien de réinitialisation invalide ou expiré');
              navigate('/login');
              return;
            }
            
            if (data.session) {
              setIsValidToken(true);
            }
          } else {
            toast.error('Lien de réinitialisation invalide');
            navigate('/login');
            return;
          }
        } else {
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        toast.error('Une erreur est survenue');
        navigate('/login');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [navigate, searchParams]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
      return;
    }

    setIsLoading(true);

    try {
      // Utiliser le nouveau service d'authentification
      const updateData: UpdatePasswordData = {
        password: password
      };

      const result = await authService.updatePassword(updateData);
      
      if (!result.success) {
        toast.error('Erreur lors de la mise à jour du mot de passe', {
          description: result.error || 'Une erreur est survenue lors de la mise à jour du mot de passe',
          duration: 6000,
        });
        return;
      }
      
      toast.success('Mot de passe mis à jour avec succès !');
      
      // Attendre un peu avant la redirection pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ml-charcoal via-ml-navy to-ml-charcoal flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Vérification du lien de réinitialisation...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // La redirection est gérée dans useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ml-charcoal via-ml-navy to-ml-charcoal flex items-center justify-center p-4">
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
            Nouveau mot de passe
          </h1>
          <p className="text-white/70">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-white/50">
                Minimum 8 caractères, majuscule, minuscule, chiffre et caractère spécial
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-ml-teal focus:ring-ml-teal rounded-xl pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              variant="teal"
              className="w-full text-lg font-semibold py-3 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </form>

          <div className="text-center mt-8">
            <p className="text-white/70 text-sm">
              Retour à la{' '}
              <Link to="/login" className="text-ml-teal hover:text-ml-teal/80 font-medium transition-colors">
                page de connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword; 