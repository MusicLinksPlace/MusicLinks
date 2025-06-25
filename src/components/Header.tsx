import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Mic, Headphones, Users, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const megaMenu = [
  {
    label: 'Artistes',
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

const providerMegaMenu = [
  {
    title: "Professionnels de l'enregistrement",
    sub: ["Studios", "Beatmakers", "Ingénieurs du son"],
  },
  {
    title: "Promotion et marketing",
    sub: ["Programmateurs de radio/playlist", "Community manager"],
  },
  {
    title: "Visuel",
    sub: ["CLIPMAKERS", "Monteurs", "Photographes", "Graphistes"],
  },
  {
    title: "Distribution",
    sub: ["Distributeurs de musique"],
  },
  {
    title: "Droits",
    sub: ["Avocats spécialisés"],
  },
  {
    title: "Formation",
    sub: ["Coach vocal", "Ateliers et cours de musique"],
  },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showProviderMenu, setShowProviderMenu] = useState(false);

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
                    {currentUser.role === 'provider' && (
                      <DropdownMenuItem onClick={() => navigate('/provider-settings')}>
                        Mon profil prestataire
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
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div 
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out mobile-menu flex flex-col ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          
          <nav className="flex-grow pt-8 px-4">
            <ul>
              {megaMenu.map((item) => (
                <li key={item.type}>
                  <Link
                    to={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
            
            <hr className="my-4 mx-4 border-gray-200" />

            <ul>
              <li>
                <Link
                  to="/Project"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  <span>Projets</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  <span>Comment ça marche</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-6 border-t border-gray-200">
            {currentUser ? (
              <div className="space-y-4">
                 <Link to={currentUser.role === 'artist' ? '/profile/artist' : currentUser.role === 'provider' ? '/provider-settings' : `/profile/${currentUser.id}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-base font-medium flex items-center gap-3">
                      <User className="h-5 w-5" /> Mon compte
                    </Button>
                  </Link>
                <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-base font-medium flex items-center gap-3">
                  <LogOut className="h-5 w-5" /> Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" state={{ from: location }} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold text-base py-3">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup" state={{ from: location }} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full font-semibold text-base py-3 bg-blue-600 hover:bg-blue-700 text-white">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
