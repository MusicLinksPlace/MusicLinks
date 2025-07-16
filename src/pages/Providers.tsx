import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { Megaphone, Camera, Gavel, GraduationCap, Search, MapPin, ChevronDown, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import ModernLoader, { ModernSkeleton } from '@/components/ui/ModernLoader';
import PageTransition, { StaggeredAnimation } from '@/components/ui/PageTransition';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  profilepicture?: string;
  portfolio_url?: string;
  social_links?: string[];
  bio?: string;
}

export const providerGroupsConfig = [
  {
    title: "Professionnels de l'enregistrement",
    icon: Camera,
    color: 'red',
    sections: [
      { title: 'Studios', subCategories: ['studio'] },
      { title: 'Beatmakers', subCategories: ['beatmaker'] },
      { title: 'Ingénieurs du son', subCategories: ['engineer'] },
    ],
  },
  {
    title: 'Promotion et marketing',
    icon: Megaphone,
    color: 'blue',
    sections: [
      { title: 'Programmateurs de radio/playlist', subCategories: ['radio_curator'] },
      { title: 'Community manager', subCategories: ['community_manager'] },
      { title: 'Médias', subCategories: ['media'] },
    ],
  },
  {
    title: 'Visuel',
    icon: Camera,
    color: 'purple',
    sections: [
      { title: 'Clipmakers', subCategories: ['clipmaker'] },
      { title: 'Monteurs', subCategories: ['monteur'] },
      { title: 'Photographes', subCategories: ['photographe'] },
      { title: 'Graphistes', subCategories: ['graphiste'] },
    ],
  },
  {
    title: "Distribution",
    icon: Camera,
    color: 'orange',
    sections: [
      { title: 'Distributeurs de musique', subCategories: ['distributor'] },
    ],
  },
  {
    title: "Droits",
    icon: Gavel,
    color: 'teal',
    sections: [
      { title: 'Avocats spécialisés', subCategories: ['music_lawyer'] },
    ],
  },
  {
    title: 'Formation',
    icon: GraduationCap,
    color: 'yellow',
    sections: [
      { title: 'Coach vocal', subCategories: ['vocal_coach'] },
      { title: 'Ateliers et cours de musique', subCategories: ['music_workshop'] },
      { title: 'Chorégraphes', subCategories: ['danseur'] },
    ],
  },
];

const colorMap: { [key: string]: { text: string; bg: string; border: string } } = {
  orange: { text: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500' },
  teal: { text: 'text-teal-500', bg: 'bg-teal-500', border: 'border-teal-500' },
  red: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500' },
  blue: { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500' },
  purple: { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500' },
  green: { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500' },
  yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500' },
};

const FilterBar = ({ onFilterChange, onReset, filters }: any) => {
  const isMobile = useIsMobile();
  const isFilterActive = filters.searchTerm !== '' || filters.selectedLocation !== 'all' || filters.selectedDomain !== 'all';
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, selectedLocation: location });
    setIsPopoverOpen(false); // Works for both
  };

  const locationButton = (
    <button className="w-full h-12 pl-11 pr-4 text-left text-sm bg-white/50 border border-neutral-200/60 rounded-xl text-neutral-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between">
      <span className={filters.selectedLocation === 'all' ? 'text-neutral-500' : ''}>
        {filters.selectedLocation === 'all' ? 'Toute la France' : filters.selectedLocation}
      </span>
       <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
    </button>
  );

  const locationFilterContent = (
     <LocationFilter
      selectedLocation={filters.selectedLocation}
      onLocationChange={handleLocationChange}
    />
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="group p-6 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md border border-neutral-200/50 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher un prestataire..."
              className="w-full h-12 pl-11 text-sm bg-white/50 border border-neutral-200/60 rounded-xl text-neutral-800 placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            />
          </div>
          
          {/* Select Location */}
          <div className="relative w-full">
            {isMobile ? (
               <Drawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <DrawerTrigger asChild>{locationButton}</DrawerTrigger>
                <DrawerContent className="h-[95vh] top-0 mt-0">
                  <DrawerHeader className="text-left"><DrawerTitle className="text-2xl font-bold">Où cherchez-vous ?</DrawerTitle></DrawerHeader>
                  <div className="px-2 overflow-y-auto">{locationFilterContent}</div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>{locationButton}</PopoverTrigger>
                <PopoverContent className="w-[340px] p-0" align="start">
                  {locationFilterContent}
                </PopoverContent>
              </Popover>
            )}
          </div>
          
          {/* Select Domain */}
          <div className="relative w-full">
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
             <Select 
              value={filters.selectedDomain} 
              onValueChange={(value) => onFilterChange({ ...filters, selectedDomain: value })}
            >
              <SelectTrigger className="w-full h-12 pl-11 text-sm bg-white/50 border border-neutral-200/60 rounded-xl text-neutral-800 data-[placeholder]:text-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Tous les domaines" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white/80 backdrop-blur-md border-neutral-200 shadow-lg">
                <SelectItem value="all">Tous les domaines</SelectItem>
                {providerGroupsConfig.map(group => <SelectItem key={group.title} value={group.title} className="text-sm">{group.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isFilterActive && (
          <div className="mt-4 flex justify-end">
             <Button
              variant="ghost"
              className="h-auto px-3 py-1 text-xs text-neutral-500 hover:text-neutral-800 hover:bg-white/30"
              onClick={onReset}
            >
              Réinitialiser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const getAllSubCategories = () => {
  return providerGroupsConfig.flatMap(group => group.sections.flatMap(section => section.subCategories));
};
const getAllSubCategoryLabels = () => {
  return providerGroupsConfig.flatMap(group => group.sections.map(section => ({
    label: section.title,
    value: section.subCategories[0],
  })));
};

// Mapping subCategory -> label humain
const SUBCATEGORY_LABELS: Record<string, string> = {
  studio: 'Studios',
  beatmaker: 'Beatmakers',
  engineer: 'Ingénieurs du son',
  radio_curator: 'Programmateurs de radio/playlist',
  community_manager: 'Community manager',
  media: 'Médias',
  clipmaker: 'Clipmaker',
  video_editor: 'Monteurs',
  photographer: 'Photographes',
  graphic_designer: 'Graphistes',
  distributor: 'Distributeurs de musique',
  music_lawyer: 'Avocats spécialisés',
  vocal_coach: 'Coach vocal',
  music_workshop: 'Ateliers et cours de musique',
  danseur: 'Chorégraphes',
};

const ProvidersPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allProviders, setAllProviders] = useState<User[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedLocation: 'all',
    selectedSubCategories: getAllSubCategories(),
  });
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subCategory = params.get('subCategory');
    if (subCategory) {
      setFilters(f => ({ ...f, selectedSubCategories: [subCategory] }));
    }
  }, [location.search]);

  const handleResetFilters = () => {
    setFilters({ searchTerm: '', selectedLocation: 'all', selectedSubCategories: getAllSubCategories() });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const { data: users, error } = await supabase
        .from('User')
        .select('*')
        .eq('role', 'provider')
        .eq('verified', 1)
        .eq('disabled', 0);

      if (error) {
        console.error('Error fetching providers:', error);
      } else if (users) {
        setAllProviders(users);
        // Extraire toutes les villes uniques
        const locations = Array.from(new Set(users.map(u => u.location).filter(Boolean)));
        setAllLocations(locations);
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    let filtered = [...allProviders];
    const { searchTerm, selectedLocation, selectedSubCategories } = filters;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(user => user.location === selectedLocation);
    }
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter(user => selectedSubCategories.includes(user.subCategory || ''));
    }
    setFilteredProviders(filtered);
  }, [filters, allProviders]);

  const handleCheckboxChange = (value: string) => {
    setFilters(f => {
      const arr = f.selectedSubCategories;
      const already = arr.includes(value);
      const newArr = already ? arr.filter(v => v !== value) : [...arr, value];
      return { ...f, selectedSubCategories: newArr };
    });
  };

  const handleLocationChange = (location: string) => {
    setFilters(f => ({ ...f, selectedLocation: location }));
    setIsLocationOpen(false);
  };

  const handleContact = (userId: string, userName: string) => {
    navigate(`/chat?userId=${userId}`);
  };

  const locationButton = (
    <button className="w-full h-12 pl-11 pr-4 text-left text-sm bg-white/50 border border-neutral-200/60 rounded-xl text-neutral-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between">
      <span className={filters.selectedLocation === 'all' ? 'text-neutral-500' : ''}>
        {filters.selectedLocation === 'all' ? 'Toute la France' : filters.selectedLocation}
      </span>
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
    </button>
  );

  const locationFilterContent = (
    <LocationFilter
      selectedLocation={filters.selectedLocation}
      onLocationChange={handleLocationChange}
    />
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        {/* Header image section */}
        <div className="relative bg-center bg-cover" style={{ backgroundImage: "url('/background/disque3.png')" }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 w-full py-16 md:py-24 z-10">
            <StaggeredAnimation delay={200}>
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  Trouvez les meilleurs <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Prestataires</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200">
                  Des professionnels qualifiés pour donner vie à vos projets musicaux.
                </p>
              </div>
            </StaggeredAnimation>
          </div>
        </div>
      <main className="flex-1 max-w-7xl mx-auto w-full flex gap-8 px-4 py-12 md:py-16">
        {/* Filtres à gauche, masqués sur mobile */}
        <aside className="w-full max-w-xs pr-4 self-start hidden md:block">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-semibold text-neutral-800">Filtres</span>
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={handleResetFilters}
            >
              Effacer filtres
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un prestataire..."
              className="w-full h-12 px-4 text-sm bg-white border border-neutral-200/60 rounded-xl text-neutral-800 placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchTerm}
              onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
            />
          </div>
          <div className="mb-6">
            <div className="text-sm font-semibold mb-2">Localisation</div>
            {isMobile ? (
              <Drawer open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <DrawerTrigger asChild>{
                  <button className="w-full h-12 px-4 text-left text-sm bg-white border border-neutral-200/60 rounded-xl text-neutral-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center">
                    <span className={filters.selectedLocation === 'all' ? 'text-neutral-500' : ''}>
                      {filters.selectedLocation === 'all' ? 'Toute la France' : filters.selectedLocation}
                    </span>
                  </button>
                }</DrawerTrigger>
                <DrawerContent className="h-[95vh] top-0 mt-0">
                  <DrawerHeader className="text-left"><DrawerTitle className="text-2xl font-bold">Où cherchez-vous ?</DrawerTitle></DrawerHeader>
                  <div className="px-2 overflow-y-auto">{locationFilterContent}</div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <PopoverTrigger asChild>{
                  <button className="w-full h-12 px-4 text-left text-sm bg-white border border-neutral-200/60 rounded-xl text-neutral-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center">
                    <span className={filters.selectedLocation === 'all' ? 'text-neutral-500' : ''}>
                      {filters.selectedLocation === 'all' ? 'Toute la France' : filters.selectedLocation}
                    </span>
                  </button>
                }</PopoverTrigger>
                <PopoverContent className="min-w-[100%] w-auto p-0 mt-2" align="start" side="bottom" sideOffset={2} avoidCollisions={false}>
                  {locationFilterContent}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="mb-6">
            <div className="space-y-6">
              {providerGroupsConfig.map((group, idx) => {
                let emoji = '';
                if (group.title === "Professionnels de l'enregistrement") emoji = '🎙️';
                if (group.title === "Promotion et marketing") emoji = '📈';
                if (group.title === "Visuel") emoji = '🎨';
                if (group.title === "Distribution") emoji = '📲';
                if (group.title === "Formation") emoji = '🎓';
                if (group.title === "Droits") emoji = '⚖️';
                return (
                  <div key={group.title} className="mb-6">
                    <div className="pt-8 text-base font-bold text-neutral-900 mb-2 flex items-center gap-2 pl-0 whitespace-nowrap">
                      {emoji && <span className="text-2xl">{emoji}</span>}
                      {group.title}
                    </div>
                    <ul className="space-y-4 pl-2">
                      {group.sections.map(section => (
                        <li key={section.title} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`subcat-${section.subCategories[0]}`}
                            checked={filters.selectedSubCategories.includes(section.subCategories[0])}
                            onChange={() => handleCheckboxChange(section.subCategories[0])}
                            className="accent-blue-600 w-5 h-5 rounded-lg border border-neutral-300 shadow-sm"
                          />
                          <label htmlFor={`subcat-${section.subCategories[0]}`} className="text-neutral-800 cursor-pointer text-base font-medium">{section.title}</label>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
        {/* Résultats à droite */}
        <section className="flex-1">
          {/* Section filtres mobile juste sous le wording principal */}
          <div className="md:hidden flex items-center gap-4 px-4 py-4 mb-2">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-neutral-300 bg-white text-neutral-800 font-bold shadow-lg text-base active:scale-95 transition-transform"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="20" cy="14" r="2"/></svg>
              Filtres
            </button>
            <span className="text-lg font-extrabold text-neutral-700 tracking-wide">{filteredProviders.length} RÉSULTATS</span>
          </div>
          {/* Popup filtres mobile */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex md:hidden">
              <div className="fixed inset-x-0 bottom-0 top-0 bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-full animate-slideInUp">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
                  <span className="text-xl font-bold">Filtres</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                      // Réinitialiser : tout décocher
                      providerGroupsConfig.forEach(group => {
                        group.sections.forEach(section => {
                          if (filters.selectedSubCategories.includes(section.subCategories[0])) {
                            handleCheckboxChange(section.subCategories[0]);
                          }
                        });
                      });
                    }} className="text-sm font-semibold text-ml-blue px-2 py-1 rounded hover:bg-blue-50">Réinitialiser</button>
                    <button onClick={() => {
                      // Tout cocher
                      providerGroupsConfig.forEach(group => {
                        group.sections.forEach(section => {
                          if (!filters.selectedSubCategories.includes(section.subCategories[0])) {
                            handleCheckboxChange(section.subCategories[0]);
                          }
                        });
                      });
                    }} className="text-sm font-semibold text-ml-blue px-2 py-1 rounded hover:bg-blue-50">Tout cocher</button>
                    <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {providerGroupsConfig.map(group => (
                    <div key={group.title} className="mb-6">
                      <div className="text-base font-bold text-neutral-900 mb-2">{group.title}</div>
                      <ul className="space-y-2">
                        {group.sections.map(section => (
                          <li key={section.title} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`mobile-subcat-${section.subCategories[0]}`}
                              checked={filters.selectedSubCategories.includes(section.subCategories[0])}
                              onChange={() => handleCheckboxChange(section.subCategories[0])}
                              className="accent-blue-600 w-5 h-5 rounded-lg border border-neutral-300 shadow-sm"
                            />
                            <label htmlFor={`mobile-subcat-${section.subCategories[0]}`} className="text-neutral-800 cursor-pointer text-base font-medium">{section.title}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-neutral-100">
                  <button
                    className="w-full bg-ml-blue hover:bg-ml-blue/90 text-white font-bold rounded-xl px-6 py-3 text-base transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ModernLoader size="lg" text="Chargement des prestataires..." />
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <ModernSkeleton lines={3} height="h-4" className="mb-4" />
                    <ModernSkeleton lines={1} height="h-32" className="rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProviders.length > 0 ? (
            <>
              {/* Version mobile : card image en haut, détails dessous */}
              <div className="flex flex-col gap-6 md:hidden">
                {filteredProviders.map(user => (
                  <div key={user.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                    <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center overflow-hidden">
                      <OptimizedImage
                        src={user.profilepicture || '/placeholder.svg'}
                        alt={user.name}
                        className="object-cover w-full h-full"
                        fallback="/placeholder.svg"
                      />
                    </div>
                    <div className="flex flex-col gap-1 px-5 pt-4 pb-5">
                      <div className="text-xl font-extrabold text-neutral-900 mb-1 leading-tight">{user.name}</div>
                      {user.location && <div className="text-sm text-neutral-500 mb-0.5">{user.location}</div>}
                      {user.subCategory && <div className="text-sm text-neutral-700 font-semibold mb-1">{SUBCATEGORY_LABELS[user.subCategory] || user.subCategory}</div>}
                      {user.bio && <div className="text-sm text-neutral-700 mb-2 line-clamp-3">{user.bio}</div>}
                      <button 
                        onClick={() => handleContact(user.id, user.name)}
                        className="mt-2 w-full bg-ml-blue hover:bg-ml-blue/90 text-white font-bold rounded-xl px-6 py-3 text-base transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contacter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Version desktop : inchangée */}
              <div className="hidden md:flex flex-col divide-y divide-neutral-200 bg-transparent">
                {filteredProviders.map((user, idx) => (
                  <div key={user.id} className="flex flex-row items-center bg-transparent py-5 px-0 w-full gap-0 md:gap-4 md:min-h-[180px]">
                    {/* Image */}
                    <div className="flex-shrink-0 w-[100px] h-[100px] md:w-[220px] md:h-[160px] overflow-hidden rounded-l-2xl bg-neutral-100 flex items-center justify-center">
                      <OptimizedImage
                        src={user.profilepicture || '/placeholder.svg'}
                        alt={user.name}
                        className="object-cover w-full h-full"
                        fallback="/placeholder.svg"
                      />
                    </div>
                    {/* Infos cliquables */}
                    <a href={`/profile/${user.id}`} className="flex-1 flex flex-col justify-center px-2 md:px-4 cursor-pointer group min-w-0">
                      <div className="text-lg md:text-xl font-extrabold text-neutral-900 mb-1 leading-tight group-hover:underline truncate">{user.name}</div>
                      {user.location && <div className="text-sm text-neutral-500 mb-0.5 truncate">{user.location}</div>}
                      {user.subCategory && <div className="text-sm text-neutral-700 font-semibold mb-1 truncate">{SUBCATEGORY_LABELS[user.subCategory] || user.subCategory}</div>}
                      {user.bio && <div className="text-sm text-neutral-700 line-clamp-2 md:line-clamp-2 break-words">{user.bio}</div>}
                    </a>
                    {/* CTA */}
                    <div className="flex flex-col items-center md:items-end justify-center pr-2 md:pr-4 min-w-[120px]">
                      <button
                        onClick={() => handleContact(user.id, user.name)}
                        className="inline-block bg-ml-blue hover:bg-ml-blue/90 text-white font-bold rounded-xl px-6 py-2 text-base md:text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-2"
                        style={{ minWidth: 120 }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contacter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <p className="text-lg text-gray-500">Aucun prestataire ne correspond à votre recherche.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default ProvidersPage;
