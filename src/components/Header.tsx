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
  'Clipmakers': <Camera className="w-5 h-5 text-blue-500" />,
  'Monteurs': <Camera className="w-5 h-5 text-blue-500" />,
  'Photographes': <Camera className="w-5 h-5 text-blue-500" />,
  'Graphistes': <Camera className="w-5 h-5 text-blue-500" />,
  'Distributeurs de musique': <GraduationCap className="w-5 h-5 text-blue-500" />,
  'Avocats spécialisés': <Gavel className="w-5 h-5 text-blue-500" />,
  'Coach vocal': <Mic className="w-5 h-5 text-blue-500" />,
  'Ateliers et cours de musique': <GraduationCap className="w-5 h-5 text-blue-500" />,
};

const navIcons = {
  artists: '🎤',
  providers: '🎧',
  partners: '🤝',
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
  const [showSocialDialog, setShowSocialDialog] = useState(false);

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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm hidden md:block">
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
                    {hoveredMenu === item.type && item.type === 'artists' && (
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
                    {hoveredMenu === item.type && item.type === 'partners' && (
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
                    {hoveredMenu === item.type && item.type === 'providers' && (
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
                                let icon = null;
                                if (cat.title === "Professionnels de l'enregistrement") icon = '/bnbicons/recorder.png';
                                if (cat.title === "Promotion et marketing") icon = '/bnbicons/marketing.png';
                                if (cat.title === "Visuel") icon = '/bnbicons/visuel.png';
                                if (cat.title === "Distribution") icon = '/bnbicons/distributor.png';
                                if (cat.title === "Formation") icon = '/bnbicons/formation.png';
                                if (cat.title === "Droits") icon = '/bnbicons/law.png';
                                return (
                                  <div key={cat.title} className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2 flex items-center gap-3">
                                      {icon && <img src={icon} alt={cat.title} className="w-12 h-12 object-contain" />}
                                      {cat.title}
                                    </h3>
                                    <ul className="space-y-1">
                                      {cat.sub.map(sub => {
                                        const group = providerGroupsConfig.find(g => g.title === cat.title);
                                        const section = group?.sections.find(s => s.title === sub);
                                        const subCat = section?.subCategories[0] || sub.toLowerCase();
                                        return (
                                          <li key={sub}>
                                            <a
                                              href={`/providers?subCategory=${encodeURIComponent(subCat)}`}
                                              className="flex items-center text-sm text-gray-700 hover:text-gray-900 py-1.5 px-1 rounded transition-colors"
                                            >
                                              <span className="font-normal">{sub}</span>
                                            </a>
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
                    <img src="/bnbicons/message.png" alt="Messages" className="w-12 h-12 object-contain" style={{ display: 'block' }} />
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
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.profilepicture} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
                    </Avatar>
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm md:hidden">
        <div className="w-full px-4 flex items-center h-16 justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/952112ae-fc5d-48cc-ade8-53267f24bc4d.png" 
              alt="MusicLinks" 
              className="h-6 w-auto"
            />
          </Link>

          {/* Menu burger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer - double step */}
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
                  </Link>
                </li>
                <hr className="my-4 mx-4 border-gray-200" />
                <li>
                  <Link to="/Project" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Projets
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center w-full px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-800 rounded-lg hover:bg-gray-100 relative">
                    <span className="relative">
                      <img src="/bnbicons/message.png" alt="Messages" className="w-10 h-10 object-contain" style={{ display: 'block' }} />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </span>
                    Messages
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
                <Link to="/mon-compte" onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}>
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
                <Link to="/signup" state={{ from: location }} className="block" onClick={() => { setIsMobileMenuOpen(false); setDrawerStep('main'); }}>
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

      <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
        <DialogContent className="max-w-xs flex flex-col items-center gap-6 py-8">
          <div className="text-lg font-bold text-blue-700 mb-2">Suivez-nous</div>
          <div className="flex gap-8 items-center justify-center">
            <button onClick={() => window.open('https://instagram.com/', '_blank')} className="hover:scale-110 transition-transform">
              <img src="/social-media/instagram.png" alt="Instagram" className="w-14 h-14" />
            </button>
            <button onClick={() => window.open('https://tiktok.com/', '_blank')} className="hover:scale-110 transition-transform">
              <img src="/social-media/tiktok.png" alt="TikTok" className="w-14 h-14" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
