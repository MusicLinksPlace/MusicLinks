import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Mic, Headphones, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const megaMenu = [
  {
    label: 'Artistes & Créateurs',
    type: 'artists',
    link: '/artists',
    description: "Musiciens, chanteurs, compositeurs...",
    icon: Mic
  },
  {
    label: 'Prestataires de services',
    type: 'providers',
    link: '/providers',
    description: "Ingénieurs du son, studios, techniciens...",
    icon: Headphones
  },
  {
    label: 'Partenaires stratégiques',
    type: 'partners',
    link: '/partners',
    description: "Labels, managers, directeurs artistiques...",
    icon: Users
  },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthChange = () => {
      const user = localStorage.getItem('musiclinks_user');
      if (user) {
        try {
          setCurrentUser(JSON.parse(user));
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    handleAuthChange(); // Initial check on component mount

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    // Clear local storage and notify UI
    localStorage.removeItem('musiclinks_user');
    window.dispatchEvent(new Event('auth-change'));

    if (error) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
        duration: 3000,
      });
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
              alt="MusicLinks" 
                className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-base font-semibold px-5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all shadow-sm border border-blue-100"
                  >
                    Professionnels
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[420px] p-4">
                  {megaMenu.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <DropdownMenuItem key={item.type} asChild>
            <Link 
                          to={item.link}
                          className="block p-4 rounded-lg hover:bg-blue-50 focus:bg-blue-50"
                        >
                          <div className="flex items-start gap-4">
                            <IconComponent className="h-6 w-6 text-blue-600 mt-1" />
                            <div>
                              <div className="text-base font-bold text-gray-900">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </div>
            </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
            <Link 
                to="/Project" 
                className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
                  isActive('/Project') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              Projets
            </Link>
            <Link 
              to="/how-it-works" 
                className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
                  isActive('/how-it-works') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              Comment ça marche
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2">
                      {currentUser.profilepicture ? (
                        <img
                          src={currentUser.profilepicture}
                          alt="Profile"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      {currentUser.name || 'Mon compte'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {currentUser.role === 'artist' && (
                      <DropdownMenuItem onClick={() => navigate('/profile/artist')}>
                        Mon profil artiste
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login" state={{ from: location }}>
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium">
                Connexion
              </Button>
            </Link>
                  <Link to="/signup" state={{ from: location }}>
                    <Button size="sm" className="font-medium rounded-full px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                S'inscrire
              </Button>
            </Link>
                </>
              )}
          </div>

          <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
            ) : (
                <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className={`absolute right-0 top-0 h-full w-80 bg-[#f9fafb] shadow-2xl transform transition-transform duration-300 ease-in-out mobile-menu flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <img 
                src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
                alt="MusicLinks" 
                className="h-8 w-auto"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <nav className="flex-1 px-6 pt-6 pb-0">
              <ul className="divide-y divide-gray-200">
                <li>
                  <Link to="/artists" onClick={() => setIsMobileMenuOpen(false)} className="flex items-start gap-4 py-4 focus:outline-none">
                    <span className="mt-1 text-xl">🎤</span>
                    <span>
                      <span className="block text-base font-semibold text-gray-900">Artistes & Créateurs</span>
                      <span className="block text-sm text-gray-500">Musiciens, compositeurs…</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/providers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-start gap-4 py-4 focus:outline-none">
                    <span className="mt-1 text-xl">🎧</span>
                    <span>
                      <span className="block text-base font-semibold text-gray-900">Prestataires de services</span>
                      <span className="block text-sm text-gray-500">Studios, beatmakers…</span>
                    </span>
            </Link>
                </li>
                <li>
                  <Link to="/partners" onClick={() => setIsMobileMenuOpen(false)} className="flex items-start gap-4 py-4 focus:outline-none">
                    <span className="mt-1 text-xl">🧑‍💼</span>
                    <span>
                      <span className="block text-base font-semibold text-gray-900">Partenaires stratégiques</span>
                      <span className="block text-sm text-gray-500">Labels, managers…</span>
                    </span>
            </Link>
                </li>
              </ul>
            </nav>
            <div className="p-6 mt-auto border-t border-gray-200">
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {currentUser.profilepicture ? (
                      <img src={currentUser.profilepicture} alt="Profile" className="w-10 h-10 rounded-full object-cover"/>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-800">{currentUser.name || 'Utilisateur'}</div>
                      <div className="text-sm text-gray-500">{currentUser.role === 'artist' ? 'Artiste' : 'Prestataire'}</div>
                    </div>
                  </div>
                  
                  <Button asChild variant="ghost" className="w-full justify-start text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                    <Link to={currentUser.role === 'artist' ? '/profile/artist' : '/profile/provider'} onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      <span>Mon profil</span>
            </Link>
                  </Button>

                  <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" state={{ from: location }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl h-12 text-base font-semibold shadow-sm">
                  Connexion
                </Button>
              </Link>
                  <Link to="/signup" state={{ from: location }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl h-12 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                  S'inscrire
                </Button>
              </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
