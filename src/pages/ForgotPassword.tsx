import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      setEmailSent(true);
      toast.success("Un email de réinitialisation a été envoyé à votre adresse email");

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
              Email envoyé !
            </h1>
            <p className="text-white/70">
              Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-ml-teal/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-ml-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <p className="text-white/70 text-sm">
                  Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez vos spams.
                </p>
              </div>

              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Envoyer un autre email
              </Button>

              <Link 
                to="/login" 
                className="inline-flex items-center text-ml-teal hover:text-ml-teal/80 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
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
              src="/lovable-uploads/logo-white.png"
            />
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-white/70">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Adresse email</Label>
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

            <Button 
              type="submit"
              variant="teal"
              className="w-full text-lg font-semibold py-3 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>

          <div className="text-center mt-8">
            <Link 
              to="/login" 
              className="inline-flex items-center text-white/70 hover:text-white font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 