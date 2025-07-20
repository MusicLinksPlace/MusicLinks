import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Mic, Headphones, Users, ChevronRight, Camera, Megaphone, GraduationCap, Gavel, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import { providerGroupsConfig } from '../pages/Providers';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getImageUrlWithCacheBust } from '@/lib/utils';

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
    sub: ["Programmateurs de radio/playlist", "Community manager", "Médias"],
  },
  {
    title: "Visuel",
    sub: ["Clipmakers", "Monteurs", "Photographes", "Graphistes"],
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
    sub: ["Coach vocal", "Ateliers et cours de musique", "Chorégraphes"],
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
  'Studios': '🎙️',
  'Beatmakers': '🎵',
  'Ingénieurs du son': '🎧',
  'Programmateurs de radio/playlist': '📻',
  'Community manager': '📱',
  'Médias': '📺',
  'Clipmakers': '🎬',
  'Monteurs': '✂️',
  'Photographes': '📸',
  'Graphistes': '🎨',
  'Distributeurs de musique': '📲',
  'Avocats spécialisés': '⚖️',
  'Coach vocal': '🎤',
  'Ateliers et cours de musique': '🎓',
  'Chorégraphes': '💃',
};

const navIcons = {
  artists: '🎤',
  providers: '⭐️',
  partners: '🤝',
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [displayedMenu, setDisplayedMenu] = useState<string | null>(null);
  const closeMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const openMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [drawerStep, setDrawerStep] = useState<'main' | 'providers'>('main');
  const [showSocialDialog, setShowSocialDialog] = useState(false);

  // Détecter si on est sur une page profil
  const isProfilePage = location.pathname.startsWith('/profile/');

  // Hook pour gérer le scroll sur les pages profil
  useEffect(() => {
    if (!isProfilePage) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si on scrolle vers le bas (plus de 100px), masquer le header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } 
      // Si on scrolle vers le haut ou on est en haut, afficher le header
      else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isProfilePage]);

  // Nettoyage des timeouts lors du démontage du composant
  useEffect(() => {
    return () => {
      if (closeMenuTimeout.current) {
        clearTimeout(closeMenuTimeout.current);
      }
      if (openMenuTimeout.current) {
        clearTimeout(openMenuTimeout.current);
      }
    };
  }, []);

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
    // Annuler le timeout de fermeture s'il existe
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current);
      closeMenuTimeout.current = null;
    }
    
    // Annuler le timeout d'ouverture précédent s'il existe
    if (openMenuTimeout.current) {
      clearTimeout(openMenuTimeout.current);
    }
    
    setHoveredMenu(type);
    
    // Délai de 0,5 secondes avant d'afficher le menu
    openMenuTimeout.current = setTimeout(() => {
      setDisplayedMenu(type);
    }, 500);
  };

  const handleMenuLeave = () => {
    // Annuler le timeout d'ouverture s'il existe
    if (openMenuTimeout.current) {
      clearTimeout(openMenuTimeout.current);
      openMenuTimeout.current = null;
    }
    
    closeMenuTimeout.current = setTimeout(() => {
      setHoveredMenu(null);
      setDisplayedMenu(null);
    }, 150);
  };

  const handleChatClick = () => {
    const user = localStorage.getItem('musiclinks_user');
    if (!user) {
      navigate('/signup', { state: { from: location.pathname } });
      return;
    }
    navigate('/chat');
  };

  return (
    <>
      {/* Header Desktop */}
      <header className={`${isProfilePage ? 'fixed' : 'sticky'} top-0 z-50 bg-white border-b border-gray-100 shadow-sm hidden md:block transition-transform duration-300 ${
        isProfilePage && !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
      }`} style={isProfilePage ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}}>
        <div className="flex items-center justify-between w-full px-8 h-20">
          {/* Logo à gauche */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center min-w-[160px]">
              <img 
                src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
                alt="MusicLinks" 
                className="h-8 w-auto"
              />
            </Link>
          </div>
          {/* Centre : navigation principale */}
          <nav className="flex items-center gap-8">
            <div className="flex gap-8 items-center justify-center">
              {megaMenu.map((item) => {
                const isSelected = isActive(item.link);
                return (
                  <div
                    key={item.type}
                    className="relative"
                    onMouseEnter={() => handleMenuEnter(item.type)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-150 ${isSelected ? 'font-bold text-blue-700' : 'font-medium text-gray-700 hover:text-blue-700'} bg-transparent border-none focus:outline-none`}
                      style={{ fontSize: '1.1rem', position: 'relative' }}
                      onClick={() => navigate(item.link)}
                    >
                      <span className="text-xl flex items-center justify-center" style={{ lineHeight: 1 }}>{navIcons[item.type]}</span>
                      <span className="truncate text-base" style={{ lineHeight: 1 }}>{item.type === 'providers' ? 'Prestataires' : item.type === 'partners' ? 'Partenaires' : item.label}</span>
                    </button>
                    {(isSelected || hoveredMenu === item.type) && (
                      <span className="block absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-blue-600" style={{ width: '80%', margin: '0 auto' }} />
                    )}
                    {/* Mega-menu déroulant ARTISTES */}
                    {displayedMenu === item.type && item.type === 'artists' && (
                      <div
                        className="fixed left-0 right-0 top-[80px] z-40 w-full"
                        onMouseEnter={() => handleMenuEnter(item.type)}
                        onMouseLeave={handleMenuLeave}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-full bg-white shadow-2xl rounded-b-3xl border-t-0 border border-neutral-100 pt-8 pb-10 px-0">
                          <div className="max-w-7xl mx-auto px-8">
                            <div className="grid grid-cols-4 gap-8">
                              {[
                                { label: 'Nos artistes à Paris', value: 'Paris', icon: '/bnbicons/paris.png' },
                                { label: 'Nos artistes à Lyon', value: 'Lyon', icon: '/bnbicons/lyon.png' },
                                { label: 'Nos artistes à Marseille', value: 'Marseille', icon: '/bnbicons/marseille.png' },
                                { label: 'Partout en France', value: 'all', icon: '/bnbicons/france.png' },
                              ].map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    navigate(`/artists?location=${option.value}`);
                                    setHoveredMenu(null);
                                  }}
                                  className="flex flex-col items-center justify-center gap-3 text-neutral-800 hover:text-blue-600 text-lg font-semibold py-8 px-4 rounded-2xl transition-colors border border-transparent hover:border-blue-200 bg-white shadow-sm hover:shadow-lg"
                                  style={{ minHeight: 120 }}
                                >
                                  <img src={option.icon} alt={option.label} className="w-32 h-32 object-contain" />
                                  <span className="text-center">{option.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Mega-menu déroulant PARTENAIRES */}
                    {displayedMenu === item.type && item.type === 'partners' && (
                      <div
                        className="fixed left-0 right-0 top-[80px] z-40 w-full"
                        onMouseEnter={() => handleMenuEnter(item.type)}
                        onMouseLeave={handleMenuLeave}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-full bg-white shadow-2xl rounded-b-3xl border-t-0 border border-neutral-100 pt-8 pb-10 px-0">
                          <div className="max-w-7xl mx-auto px-8">
                            <div className="grid grid-cols-3 gap-8">
                              {[
                                { label: 'Maisons de disque & labels', value: 'label', icon: '/bnbicons/recordCompany.png' },
                                { label: 'Managers & directeurs artistiques', value: 'manager', icon: '/bnbicons/manager.png' },
                                { label: 'Tous nos partenaires', value: 'all', icon: '/bnbicons/allPartner.png' },
                              ].map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    navigate(`/partners?subCategory=${option.value}`);
                                    setHoveredMenu(null);
                                  }}
                                  className="flex flex-col items-center justify-center gap-3 text-neutral-800 hover:text-blue-600 text-lg font-semibold py-8 px-4 rounded-2xl transition-colors border border-transparent hover:border-blue-200 bg-white shadow-sm hover:shadow-lg"
                                  style={{ minHeight: 120 }}
                                >
                                  <img src={option.icon} alt={option.label} className="w-32 h-32 object-contain" />
                                  <span className="text-center">{option.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Mega-menu déroulant PRESTATAIRES */}
                    {displayedMenu === item.type && item.type === 'providers' && (
                      <div
                        className="fixed left-0 right-0 top-[80px] z-40 w-full"
                        onMouseEnter={() => handleMenuEnter(item.type)}
                        onMouseLeave={handleMenuLeave}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-full bg-white shadow-2xl rounded-b-3xl border-t-0 border border-neutral-100 pt-8 pb-10 px-0">
                          <div className="max-w-7xl mx-auto px-8">
                            <div className="grid grid-cols-3 gap-12">
                              {providerMegaMenu.map(cat => {
                                let emoji = '';
                                if (cat.title === "Professionnels de l'enregistrement") emoji = '🎙️';
                                if (cat.title === "Promotion et marketing") emoji = '📈';
                                if (cat.title === "Visuel") emoji = '🎨';
                                if (cat.title === "Distribution") emoji = '📲';
                                if (cat.title === "Formation") emoji = '🎓';
                                if (cat.title === "Droits") emoji = '⚖️';
                                return (
                                  <div key={cat.title} className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-3">
                                      {emoji && <span className="text-2xl">{emoji}</span>}
                                      {cat.title}
                                    </h3>
                                    <ul className="space-y-1">
                                      {cat.sub.map(sub => {
                                        const group = providerGroupsConfig.find(g => g.title === cat.title);
                                        const section = group?.sections.find(s => s.title === sub);
                                        const subCat = section?.subCategories[0] || sub.toLowerCase();
                                        return (
                                          <li key={sub}>
                                            <button
                                              onClick={() => {
                                                navigate(`/providers?subCategory=${encodeURIComponent(subCat)}`);
                                                setHoveredMenu(null);
                                              }}
                                              className="flex items-center text-sm text-gray-700 hover:text-gray-900 py-1.5 px-1 rounded transition-colors w-full text-left"
                                            >
                                              <span className="font-normal">{sub}</span>
                                            </button>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-base font-medium text-gray-700 hover:text-blue-700 px-2 py-1 border-b-2 border-transparent hover:border-blue-600 bg-transparent">Découvrir</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/Project" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600">Projets</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/how-it-works" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600">Comment ça marche</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600">Qui sommes-nous ?</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSocialDialog(true)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 cursor-pointer">Suivez-nous</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          {/* Actions à droite */}
          <div className="flex items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleChatClick} variant="ghost" size="icon" className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 relative flex items-center justify-center" style={{ height: '48px', width: '48px' }}>
                    <span className="text-2xl">💬</span>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center" className="text-xs font-medium">
                  Messages
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                      <span className="text-white font-bold text-sm uppercase tracking-wider">
                        {currentUser.name?.[0] || 'U'}
                      </span>
                    </div>
                    <span>{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/mon-compte" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/Project" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600">Mes projets</Link>
                  </DropdownMenuItem>
                  {currentUser.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600">Administration</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 py-2 text-gray-700 hover:text-red-600 cursor-pointer">Déconnexion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="mr-2">
                  <Button variant="outline" className="rounded-full px-6 py-2 text-[16px] font-medium border-gray-300 hover:border-blue-600 hover:text-blue-600 bg-white shadow-none">Connexion</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="rounded-full px-6 py-2 text-[16px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Header Mobile */}
      <header className={`${isProfilePage ? 'fixed' : 'sticky'} top-0 z-50 bg-white border-b border-gray-200 shadow-sm md:hidden transition-transform duration-300 ${
        isProfilePage && !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
      }`} style={isProfilePage ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}}>
        <div className="w-full px-4 flex items-center h-16 justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
              alt="MusicLinks" 
              className="h-6 w-auto"
            />
          </Link>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="mobile-menu absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Navigation principale */}
              <div className="space-y-2">
                {megaMenu.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      navigate(item.link);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.link) 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{navIcons[item.type]}</span>
                      <span className="text-base font-medium">
                        {item.type === 'providers' ? 'Prestataires' : item.type === 'partners' ? 'Partenaires' : item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Actions utilisateur */}
              <div className="space-y-2">
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                        <span className="text-white font-bold text-base uppercase tracking-wider">
                          {currentUser.name?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{currentUser.name}</div>
                        <div className="text-sm text-gray-500">Connecté</div>
                      </div>
                    </div>
                    
                    <Link 
                      to="/mon-compte" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Mon profil</span>
                    </Link>
                    
                    <Link 
                      to="/Project" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Mes projets</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleChatClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Messages</span>
                    </button>
                    
                    {currentUser.isAdmin && (
                      <Link 
                        to="/admin/users" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Gavel className="w-5 h-5" />
                        <span>Administration</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Connexion</span>
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>S'inscrire</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Liens supplémentaires */}
              <div className="space-y-2">
                <Link 
                  to="/Project" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span>Projets</span>
                </Link>
                <Link 
                  to="/how-it-works" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Comment ça marche</span>
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>Qui sommes-nous ?</span>
                </Link>
                <button
                  onClick={() => {
                    setShowSocialDialog(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                >
                  <Megaphone className="w-5 h-5" />
                  <span>Suivez-nous</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>



      {/* Dialog Réseaux sociaux */}
      <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Suivez-nous sur les réseaux sociaux</h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://www.instagram.com/musiclinks.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <img src="/social-media/instagram.png" alt="Instagram" className="w-6 h-6" />
                <span className="font-medium">Instagram</span>
              </a>
              <a
                href="https://www.linkedin.com/company/musiclinks-fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <img src="/social-media/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
                <span className="font-medium">LinkedIn</span>
              </a>
              <a
                href="https://www.facebook.com/musiclinks.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <img src="/social-media/facebook.png" alt="Facebook" className="w-6 h-6" />
                <span className="font-medium">Facebook</span>
              </a>
              <a
                href="https://www.youtube.com/@musiclinks-fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <img src="/social-media/youtube.png" alt="YouTube" className="w-6 h-6" />
                <span className="font-medium">YouTube</span>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
