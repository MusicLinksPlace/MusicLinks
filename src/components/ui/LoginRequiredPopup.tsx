import React from 'react';
import { X, Heart, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LoginRequiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginRequiredPopup: React.FC<LoginRequiredPopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreateAccount = () => {
    onClose();
    navigate('/signup');
  };

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ minHeight: '100vh', height: '100vh' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" style={{ transform: 'translateY(-10%)' }}>
        {/* Header avec bouton fermer */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connexion requise</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            Pour liker des profils et les enregistrer dans vos favoris, vous devez avoir un compte MusicLinks.
          </p>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button
              onClick={handleCreateAccount}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Créer un compte
            </Button>
            
            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Se connecter
            </Button>
          </div>

          {/* Texte informatif */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Créez votre compte gratuitement pour accéder à toutes les fonctionnalités
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredPopup; 