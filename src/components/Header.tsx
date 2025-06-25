import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Mic, Headphones, Users, ChevronRight, Camera, Megaphone, GraduationCap, Gavel } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import { providerGroupsConfig } from '../pages/Providers';

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

const artistLocations = [
  { label: 'Paris', value: 'Paris' },
  { label: 'Lyon', value: 'Lyon' },
  { label: 'Marseille', value: 'Marseille' },
  { label: 'Autres villes', value: 'autres' },
];

const partnerCategories = [
  { label: 'Maisons de disque & labels', value: 'label' },
  { label: 'Managers & directeurs artistiques', value: 'manager' },
];

const subCategoryIcons: Record<string, React.ReactNode> = {
  'Studios': <Camera className="w-5 h-5 text-blue-500" />,
  'Beatmakers': <Mic className="w-5 h-5 text-blue-500" />,
  'Ingénieurs du son': <Headphones className="w-5 h-5 text-blue-500" />,
  'Programmateurs de radio/playlist': <Megaphone className="w-5 h-5 text-blue-500" />,
  'Community manager': <Users className="w-5 h-5 text-blue-500" />,
  'CLIPMAKERS': <Camera className="w-5 h-5 text-blue-500" />,
  'Monteurs': <Camera className="w-5 h-5 text-blue-500" />,
  'Photographes': <Camera className="w-5 h-5 text-blue-500" />,
  'Graphistes': <Camera className="w-5 h-5 text-blue-500" />,
  'Distributeurs de musique': <GraduationCap className="w-5 h-5 text-blue-500" />,
  'Avocats spécialisés': <Gavel className="w-5 h-5 text-blue-500" />,
  'Coach vocal': <Mic className="w-5 h-5 text-blue-500" />,
  'Ateliers et cours de musique': <GraduationCap className="w-5 h-5 text-blue-500" />,
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const closeMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [drawerStep, setDrawerStep] = useState<'main' | 'providers'>('main');

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

  const handleMenuEnter = (type: string) => {
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current);
      closeMenuTimeout.current = null;
    }
    setHoveredMenu(type);
  };

  const handleMenuLeave = () => {
    closeMenuTimeout.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
  };

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

          <nav className="hidden md:flex items-center space-x-6 font-sans font-medium whitespace-nowrap">
            {megaMenu.map((item) => {
              // Emoji mapping
              const emoji = item.type === 'artists' ? '🎤' : item.type === 'providers' ? '🛠' : item.type === 'partners' ? '🎯' : '';
              return (
                <div
                  key={item.type}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(item.type)}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    className={`flex items-center gap-1.5 text-[15px] font-medium transition-colors relative pb-2 ${hoveredMenu === item.type ? 'text-ml-blue' : 'hover:text-ml-blue'}`}
                    style={{ minWidth: 0, padding: 0, lineHeight: 1.2 }}
                    onClick={() => navigate(item.link)}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="truncate">{item.label}</span>
                    {hoveredMenu === item.type && (
                      <span className="absolute left-0 right-0" style={{ bottom: -14 }}>
                        <span className="block w-full h-[3px] rounded-full bg-ml-blue"></span>
                      </span>
                    )}
                  </button>
                  {/* Mega-menu déroulant */}
                  {hoveredMenu === item.type && item.type === 'providers' && (
                    <div
                      className="fixed left-0 right-0 top-[64px] z-40 w-full"
                      onMouseEnter={() => handleMenuEnter(item.type)}
                      onMouseLeave={handleMenuLeave}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="w-full bg-white shadow-2xl rounded-b-3xl border-t-0 border border-neutral-100 pt-8 pb-10 px-0">
                        <div className="max-w-7xl mx-auto px-8">
                          <div className="grid grid-cols-3 gap-8">
                            {providerMegaMenu.map(cat => (
                              <div key={cat.title}>
                                <div className="font-semibold text-blue-900 mb-3 text-base">{cat.title}</div>
                                <ul className="space-y-2">
                                  {cat.sub.map(sub => {
                                    const group = providerGroupsConfig.find(g => g.title === cat.title);
                                    const section = group?.sections.find(s => s.title === sub);
                                    const subCat = section?.subCategories[0] || sub.toLowerCase();
                                    return (
                                      <li key={sub}>
                                        <a
                                          href={`/providers?subCategory=${encodeURIComponent(subCat)}`}
                                          className="flex items-center gap-3 text-neutral-800 hover:text-ml-blue text-base py-2 px-2 rounded-lg transition-colors"
                                        >
                                          {subCategoryIcons[sub] || <Camera className="w-5 h-5 text-blue-400" />}<span>{sub}</span>
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <Link 
              to="/Project" 
              className={`text-[15px] font-medium transition-colors hover:text-blue-600 ${isActive('/Project') ? 'text-blue-600' : 'text-gray-700'} whitespace-nowrap`}
              style={{ minWidth: 0, padding: 0, lineHeight: 1.2 }}
            >
              Projets
            </Link>
            <Link 
              to="/how-it-works" 
              className={`text-[15px] font-medium transition-colors hover:text-blue-600 ${isActive('/how-it-works') ? 'text-blue-600' : 'text-gray-700'} whitespace-nowrap`}
              style={{ minWidth: 0, padding: 0, lineHeight: 1.2 }}
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
                    <Button size="sm" className="font-bold rounded-xl px-6 py-2 bg-ml-blue hover:bg-ml-blue/90 text-white text-base shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors">
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
          onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}
        />
        <div 
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out mobile-menu flex flex-col ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pb-0 flex items-center justify-between">
            {drawerStep === 'providers' ? (
              <button onClick={() => setDrawerStep('main')} className="p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            ) : <span />}
            <span className="text-lg font-bold flex-1 text-center">
              {drawerStep === 'providers' ? 'Prestataires de services' : ''}
            </span>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          {drawerStep === 'main' && (
            <nav className="flex-grow pt-8 px-4">
              <ul>
                <li>
                  <Link to="/artists" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Artistes
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <button onClick={() => setDrawerStep('providers')} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Prestataires de services
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </li>
                <li>
                  <Link to="/partners" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Partenaires stratégiques
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </li>
              </ul>
              <hr className="my-4 mx-4 border-gray-200" />
              <ul>
                <li>
                  <Link to="/Project" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Projets
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Comment ça marche
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </li>
              </ul>
            </nav>
          )}
          {drawerStep === 'providers' && (
            <nav className="flex-grow pt-6 px-4 overflow-y-auto">
              <button onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); navigate('/providers'); }} className="w-full flex items-center justify-between px-4 py-3 mb-2 bg-transparent border-none shadow-none">
                <span className="text-lg font-bold text-neutral-900">Voir tout</span>
              </button>
              {providerMegaMenu.map(cat => (
                <div key={cat.title} className="mb-4">
                  <div className="font-semibold text-blue-900 mb-2 text-base">{cat.title}</div>
                  <ul className="space-y-1">
                    {cat.sub.map(sub => {
                      const group = providerGroupsConfig.find(g => g.title === cat.title);
                      const section = group?.sections.find(s => s.title === sub);
                      const subCat = section?.subCategories[0] || sub.toLowerCase();
                      return (
                        <li key={sub}>
                          <button
                            onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); navigate(`/providers?subCategory=${encodeURIComponent(subCat)}`); }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-base text-neutral-800 rounded-lg hover:bg-gray-100"
                          >
                            {sub}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}
          <div className="p-6 border-t border-gray-200 mt-auto">
            {currentUser ? (
              <div className="space-y-4">
                 <Link to={currentUser.role === 'artist' ? '/profile/artist' : currentUser.role === 'provider' ? '/provider-settings' : `/profile/${currentUser.id}`} onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}>
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
                <Link to="/login" state={{ from: location }} className="block" onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}>
                  <Button variant="outline" className="w-full font-semibold text-base py-3">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup" state={{ from: location }} className="block" onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}>
                  <Button className="w-full font-bold text-base py-3 bg-ml-blue hover:bg-ml-blue/90 text-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors">
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
