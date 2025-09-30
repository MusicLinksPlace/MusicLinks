import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Mic, Headphones, Users, ChevronRight, Camera, Megaphone, GraduationCap, Gavel, MessageCircle, ChevronLeft, Shield, Search, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import { providerGroupsConfig } from '../pages/Providers';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [currentSubMenu, setCurrentSubMenu] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  const [displayedMenu, setDisplayedMenu] = useState<string | null>(null);
  const [menuTimeout, setMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [drawerStep, setDrawerStep] = useState<'main' | 'providers'>('main');
  const closeMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const openMenuTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Détecter si on est sur une page profil
  const isProfilePage = location.pathname.startsWith('/profile/');

  // Hook pour gérer le scroll sur les pages profil
  useEffect(() => {
    if (!isProfilePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si on scrolle vers le bas (plus de 100px), masquer le header
      if (currentScrollY > 100) {
        setIsScrolled(true);
      } 
      // Si on scrolle vers le haut ou on est en haut, afficher le header
      else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProfilePage]);

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
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('musiclinks_user');
      setCurrentUser(null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  // Données des sous-menus
  const subMenus = {
    artists: {
      title: "Artistes",
      icon: Mic,
      color: "text-blue-600",
      items: [
        { label: "Tous les artistes", link: "/artists" },
        { label: "Artistes à Paris", link: "/artists?location=Paris" },
        { label: "Artistes à Lyon", link: "/artists?location=Lyon" },
        { label: "Artistes à Marseille", link: "/artists?location=Marseille" },
        { label: "Partout en France", link: "/artists?location=all" }
      ]
    },
    providers: {
      title: "Prestataires",
      icon: Headphones,
      color: "text-green-600",
      items: [
        { label: "Tous les prestataires", link: "/providers" },
        { label: "Professionnels de l'enregistrement", link: "/providers?category=recording" },
        { label: "Promotion et marketing", link: "/providers?category=marketing" },
        { label: "Visuel", link: "/providers?category=visuals" },
        { label: "Distribution", link: "/providers?category=distribution" },
        { label: "Droits", link: "/providers?category=rights" },
        { label: "Formation", link: "/providers?category=training" }
      ]
    },
    partners: {
      title: "Partenaires",
      icon: Users,
      color: "text-purple-600",
      items: [
        { label: "Tous les partenaires", link: "/partners" },
        { label: "Labels", link: "/partners?category=label" },
        { label: "Managers", link: "/partners?category=manager" },
        { label: "Directeurs artistiques", link: "/partners?category=director" }
      ]
    }
  };

  // Fonction pour ouvrir un sous-menu
  const openSubMenu = (menuType: string) => {
    setCurrentSubMenu(subMenus[menuType as keyof typeof subMenus]);
    setIsSubMenuOpen(true);
    setIsMobileMenuOpen(false); // Fermer le drawer principal
  };

  // Fonction pour fermer tous les menus
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsSubMenuOpen(false);
    setCurrentSubMenu(null);
  };

  // Fonction pour retourner au menu principal
  const goBackToMainMenu = () => {
    setIsSubMenuOpen(false);
    setCurrentSubMenu(null);
    setIsMobileMenuOpen(true); // Rouvrir le drawer principal
  };

  // Fonction pour naviguer et fermer les menus
  const navigateAndClose = (link: string) => {
    navigate(link);
    closeAllMenus();
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
      <header className={`${isProfilePage ? 'fixed' : 'sticky'} top-0 z-50 hidden md:block transition-all duration-500 ${
        isProfilePage && isScrolled ? '-translate-y-full' : 'translate-y-0'
      }`} style={isProfilePage ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}}>
        {/* Background moderne avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-gray-50/95 to-slate-50/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-black/5"></div>
        
        {/* Pattern overlay subtil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
        
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"></div>
        
        <div className="relative flex items-center justify-between w-full px-8 h-20">
          {/* Logo à gauche avec animation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center min-w-[160px] group">
              <div className="relative">
                <img 
                  src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
                  alt="MusicLinks" 
                  className="h-8 w-auto transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>
          {/* Centre : navigation principale */}
          <nav className="flex items-center gap-2">
            <div className="flex gap-1 items-center justify-center">
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
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 font-medium text-gray-700 hover:text-white bg-transparent border-none focus:outline-none relative overflow-hidden ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:shadow-md hover:shadow-blue-500/10'
                      }`}
                      style={{ fontSize: '0.95rem', position: 'relative' }}
                      onClick={() => navigate(item.link)}
                    >
                      {/* Background animé */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      
                      {/* Contenu */}
                      <div className="relative flex items-center gap-2">
                        <span className="text-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ lineHeight: 1 }}>
                          {navIcons[item.type]}
                        </span>
                        <span className="truncate font-semibold" style={{ lineHeight: 1 }}>
                          {item.type === 'providers' ? 'Prestataires' : item.type === 'partners' ? 'Partenaires' : item.label}
                        </span>
                      </div>
                      
                      {/* Indicateur de sélection */}
                      {isSelected && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-lg"></div>
                        </div>
                      )}
                    </button>
                    {/* Mega-menu déroulant ARTISTES */}
                    {displayedMenu === item.type && item.type === 'artists' && (
                      <div
                        className="fixed left-0 right-0 top-[80px] z-40 w-full animate-in slide-in-from-top-2 duration-300"
                        onMouseEnter={() => handleMenuEnter(item.type)}
                        onMouseLeave={handleMenuLeave}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-full bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-b-3xl border-t-0 border border-white/20 pt-8 pb-10 px-0">
                          <div className="max-w-7xl mx-auto px-8">
                            <div className="grid grid-cols-4 gap-6">
                              {[
                                { label: 'Nos artistes à Paris', value: 'Paris', icon: '/bnbicons/paris.png', gradient: 'from-pink-500 to-rose-500' },
                                { label: 'Nos artistes à Lyon', value: 'Lyon', icon: '/bnbicons/lyon.png', gradient: 'from-blue-500 to-cyan-500' },
                                { label: 'Nos artistes à Marseille', value: 'Marseille', icon: '/bnbicons/marseille.png', gradient: 'from-orange-500 to-yellow-500' },
                                { label: 'Partout en France', value: 'all', icon: '/bnbicons/france.png', gradient: 'from-purple-500 to-indigo-500' },
                              ].map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    navigate(`/artists?location=${option.value}`);
                                    setHoveredMenu(null);
                                  }}
                                  className="group flex flex-col items-center justify-center gap-4 text-gray-800 hover:text-white text-lg font-semibold py-8 px-6 rounded-3xl transition-all duration-300 border border-gray-100 hover:border-transparent bg-white/50 hover:bg-gradient-to-br hover:shadow-xl hover:shadow-black/10 relative overflow-hidden"
                                  style={{ minHeight: 140 }}
                                >
                                  {/* Background gradient au hover */}
                                  <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>
                                  
                                  {/* Contenu */}
                                  <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                      <img src={option.icon} alt={option.label} className="w-12 h-12 object-contain" />
                                    </div>
                                    <span className="text-center font-bold text-sm leading-tight">{option.label}</span>
                                  </div>
                                  
                                  {/* Effet de brillance */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl"></div>
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
                <Button variant="ghost" className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-gray-700 hover:text-white bg-transparent hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-gray-600/10 hover:shadow-md transition-all duration-300 font-semibold">
                  <span>Découvrir</span>
                  <Sparkles className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 bg-slate-50/95 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-black/10 rounded-2xl p-2">
                <DropdownMenuItem asChild>
                  <Link to="/Project" className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600">📁</span>
                    </div>
                    Projets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/how-it-works" className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-green-600">⚙️</span>
                    </div>
                    Comment ça marche
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all duration-200 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600">👥</span>
                    </div>
                    Qui sommes-nous ?
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSocialDialog(true)} className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50/50 rounded-xl transition-all duration-200 font-medium cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <span className="text-pink-600">📱</span>
                  </div>
                  Suivez-nous
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          {/* Actions à droite */}
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleChatClick} 
                    variant="ghost" 
                    size="icon" 
                    className="group relative rounded-2xl p-3 text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-lg hover:shadow-blue-500/25" 
                    style={{ height: '48px', width: '48px' }}
                  >
                    <div className="relative">
                      <MessageCircle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      {/* Notification dot */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center" className="text-xs font-medium bg-gray-900 text-white rounded-lg px-2 py-1">
                  Messages
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-semibold shadow-sm hover:shadow-lg hover:shadow-blue-500/25">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-sm uppercase tracking-wider">
                          {currentUser.name?.[0] || 'U'}
                        </span>
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="font-semibold">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-slate-50/95 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-black/10 rounded-2xl p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">En ligne</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/mon-compte" className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/Project" className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <span className="text-green-600">📁</span>
                      </div>
                      Mes projets
                    </Link>
                  </DropdownMenuItem>
                  {currentUser.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all duration-200 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-200 font-medium cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline" className="group rounded-2xl px-6 py-2.5 text-sm font-semibold border-gray-200 hover:border-blue-500 hover:text-blue-600 bg-white/50 hover:bg-blue-50/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <span className="group-hover:scale-105 transition-transform duration-200">Connexion</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="group rounded-2xl px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
                    <span className="group-hover:scale-105 transition-transform duration-200">S'inscrire</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Header Mobile */}
      <header className={`${isProfilePage ? 'fixed' : 'sticky'} top-0 z-50 md:hidden transition-all duration-500 ${
        isProfilePage && isScrolled ? '-translate-y-full' : 'translate-y-0'
      }`} style={isProfilePage ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}}>
        {/* Background moderne avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-gray-50/95 to-slate-50/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-black/5"></div>
        
        {/* Pattern overlay subtil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
        
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"></div>
        
        <div className="relative w-full px-4 flex items-center h-16 justify-between">
          {/* Logo avec animation */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
                alt="MusicLinks" 
                className="h-7 w-auto transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Actions à droite */}
          <div className="flex items-center gap-2">
            {/* Bouton messages si connecté */}
            {currentUser && (
              <button
                onClick={handleChatClick}
                className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/25"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}
            
            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="group p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-gray-600/10 transition-all duration-300"
            >
              <div className="relative w-6 h-6">
                <Menu className={`w-6 h-6 text-gray-700 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                <X className={`w-6 h-6 text-gray-700 absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Menu mobile drawer principal */}
        <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DrawerContent className="h-full w-80 top-0 mt-0 transition-none ml-auto">
            <DrawerHeader className="text-left pb-4">
              <div className="flex justify-between items-center">
                <DrawerTitle className="text-lg font-medium text-gray-800">Menu</DrawerTitle>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto">
              <div className="space-y-1">
                {/* Section Artistes */}
                <div>
                  <button
                    onClick={() => openSubMenu('artists')}
                    className="w-full text-left py-3 text-gray-700 hover:text-gray-900 flex items-center justify-between transition-colors"
                  >
                    <span className="text-base">Artistes</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Section Prestataires */}
                <div>
                  <button
                    onClick={() => openSubMenu('providers')}
                    className="w-full text-left py-3 text-gray-700 hover:text-gray-900 flex items-center justify-between transition-colors"
                  >
                    <span className="text-base">Prestataires</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Section Partenaires */}
                <div>
                  <button
                    onClick={() => openSubMenu('partners')}
                    className="w-full text-left py-3 text-gray-700 hover:text-gray-900 flex items-center justify-between transition-colors"
                  >
                    <span className="text-base">Partenaires</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Séparateur */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Liens supplémentaires */}
                <div className="space-y-1">
                  <Link 
                    to="/Project" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-base">Projets</span>
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-base">Comment ça marche</span>
                  </Link>
                  <Link 
                    to="/about" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-base">Qui sommes-nous ?</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowSocialDialog(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-base">Suivez-nous</span>
                  </button>
                </div>

                {/* Séparateur */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Actions utilisateur - en bas */}
                <div className="space-y-1">
                  {currentUser ? (
                    <>
                      <Link 
                        to="/mon-compte" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <span className="text-base">Mon profil</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleChatClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-3 text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <span className="text-base">Messages</span>
                      </button>
                      
                      {currentUser.isAdmin && (
                        <Link 
                          to="/admin/users" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <span className="text-base">Administration</span>
                        </Link>
                      )}
                      
                      <div className="py-3">
                        <div className="text-sm text-gray-500">{currentUser.name}</div>
                        <div className="text-xs text-gray-400">Connecté</div>
                      </div>
                      
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-3 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <span className="text-base">Déconnexion</span>
                      </button>
                      

                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <span className="text-base">Connexion</span>
                      </Link>
                      <Link 
                        to="/signup" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <span className="text-base">S'inscrire</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Drawer sous-menu */}
        <Drawer open={isSubMenuOpen} onOpenChange={setIsSubMenuOpen}>
          <DrawerContent className="h-full w-80 top-0 mt-0 transition-none ml-auto">
            <DrawerHeader className="text-left pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={goBackToMainMenu}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                {currentSubMenu && (
                  <DrawerTitle className="text-lg font-medium text-gray-800">{currentSubMenu.title}</DrawerTitle>
                )}
              </div>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto">
              <div className="space-y-1">
                {currentSubMenu?.items.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => navigateAndClose(item.link)}
                    className="w-full text-left py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-base">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </header>



      {/* Dialog Réseaux sociaux */}
      <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
        <DialogContent className="sm:max-w-md bg-slate-50/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-black/10 rounded-3xl">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                Suivez-nous
              </h3>
              <p className="text-gray-500">Restez connecté avec MusicLinks</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://www.instagram.com/musiclinksapp?igsh=MXEwYW9ybmh5ejIydA=="
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <img src="/social-media/instagram.png" alt="Instagram" className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">Instagram</span>
                  <p className="text-sm text-gray-500">Photos et stories</p>
                </div>
              </a>
              <a
                href="https://www.tiktok.com/@musiclinksapp?_t=ZN-8yWj9SRuDqQ&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <img src="/social-media/tiktok.png" alt="TikTok" className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-gray-800 group-hover:text-gray-600 transition-colors duration-300">TikTok</span>
                  <p className="text-sm text-gray-500">Vidéos courtes</p>
                </div>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
