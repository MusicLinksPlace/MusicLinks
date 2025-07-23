import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { Search, MapPin, Music, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useLocation } from 'react-router-dom';
import ModernLoader, { ModernSkeleton } from '@/components/ui/ModernLoader';
import PageTransition, { StaggeredAnimation } from '@/components/ui/PageTransition';
import { MUSIC_STYLES } from '@/lib/constants';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  rating?: number;
  profilepicture?: string;
  musicStyle?: string;
  portfolio_url?: string;
  social_links?: string[];
  reviewCount: number;
  price?: number;
  bio?: string;
}

// Configuration des filtres de prix
const PRICE_RANGES = [
  { value: '0-500', label: 'Moins de 500€' },
  { value: '500-1000', label: '500€ - 1.000€' },
  { value: '1000-1500', label: '1.000€ - 1.500€' },
  { value: '1500+', label: 'Plus de 1.500€' },
];

// Composant pour les filtres dépliants
const CollapsibleFilter = ({ title, children, isOpen, onToggle }: any) => {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-3 px-0 border-b border-gray-200"
      >
        <span className="text-sm font-semibold text-neutral-800">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ onFilterChange, onReset, filters }: any) => {
  const isMobile = useIsMobile();
  const isFilterActive = filters.searchTerm !== '' || filters.selectedLocation !== 'all';
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, selectedLocation: location });
    setIsPopoverOpen(false);
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
    <div className="w-full max-w-xl mx-auto">
      <div className="group p-6 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md border border-neutral-200/50 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher par nom d'artiste..."
              className="w-full h-12 pl-11 text-sm bg-white/50 border border-neutral-200/60 rounded-xl text-neutral-800 placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            />
          </div>
          {/* Location Filter */}
          <div className="relative w-full">
            {isMobile ? (
              <Drawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <DrawerTrigger asChild>{locationButton}</DrawerTrigger>
                <DrawerContent className="h-[95vh] top-0 mt-0">
                  <DrawerHeader className="text-left">
                    <DrawerTitle className="text-2xl font-bold">Où cherchez-vous ?</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-2 overflow-y-auto">
                    {locationFilterContent}
                  </div>
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

const ArtistsPage = () => {
  const navigate = useNavigate();
  const [allArtists, setAllArtists] = useState<User[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedLocation: 'all',
    selectedMusicStyles: [] as string[],
    selectedPriceRanges: [] as string[],
  });
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMusicStyleOpen, setIsMusicStyleOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const location = useLocation();

  // Lecture de la query string pour initialiser le filtre localisation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loc = params.get('location');
    if (loc && ['Paris', 'Lyon', 'Marseille', 'all'].includes(loc)) {
      setFilters(f => ({ ...f, selectedLocation: loc }));
    }
    // eslint-disable-next-line
  }, [location.search]);

  const handleResetFilters = () => {
    setFilters({ 
      searchTerm: '', 
      selectedLocation: 'all', 
      selectedMusicStyles: [],
      selectedPriceRanges: []
    });
  };

  const handleMusicStyleChange = (style: string) => {
    setFilters(f => ({
      ...f,
      selectedMusicStyles: f.selectedMusicStyles.includes(style)
        ? f.selectedMusicStyles.filter(s => s !== style)
        : [...f.selectedMusicStyles, style]
    }));
  };

  const handlePriceRangeChange = (range: string) => {
    setFilters(f => ({
      ...f,
      selectedPriceRanges: f.selectedPriceRanges.includes(range)
        ? f.selectedPriceRanges.filter(r => r !== range)
        : [...f.selectedPriceRanges, range]
    }));
  };

  const handleLocationChange = (location: string) => {
    setFilters(f => ({ ...f, selectedLocation: location }));
    setIsLocationOpen(false);
  };

  const locationButton = (
    <button className="w-full h-12 px-4 text-left text-sm bg-white border border-neutral-200/60 rounded-xl text-neutral-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center">
      <span className={filters.selectedLocation === 'all' ? 'text-neutral-500' : ''}>
        {filters.selectedLocation === 'all' ? 'Toute la France' : filters.selectedLocation}
      </span>
    </button>
  );

  const locationFilterContent = (
    <LocationFilter
      selectedLocation={filters.selectedLocation}
      onLocationChange={handleLocationChange}
    />
  );

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('role', 'artist')
        .eq('verified', 1)
        .eq('disabled', 0);

      if (error) {
        console.error('Error fetching artists:', error);
      } else if (data) {
        // Fetch reviews groupées par artiste
        const { data: reviews } = await supabase
          .from('Review')
          .select('toUserid, rating')
          .in('toUserid', data.map((u: any) => u.id));
        // Calcule moyenne et nombre d'avis par artiste
        const reviewMap: Record<string, { sum: number, count: number }> = {};
        reviews?.forEach((r: any) => {
          if (!reviewMap[r.toUserid]) reviewMap[r.toUserid] = { sum: 0, count: 0 };
          reviewMap[r.toUserid].sum += r.rating;
          reviewMap[r.toUserid].count += 1;
        });
        // Injecte dans les users
        const sortedArtists = data.sort((a, b) => {
          const priorityCities = ['Paris', 'Lyon', 'Marseille'];
          const aIndex = priorityCities.indexOf(a.location || '');
          const bIndex = priorityCities.indexOf(b.location || '');
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return (a.location || '').localeCompare(b.location || '');
        }).map((artist: any) => ({
          ...artist,
          rating: reviewMap[artist.id]?.count ? reviewMap[artist.id].sum / reviewMap[artist.id].count : null,
          reviewCount: reviewMap[artist.id]?.count || 0
        }));
        setAllArtists(sortedArtists);
      }
      setLoading(false);
    };
    fetchArtists();
  }, []);

  useEffect(() => {
    let filtered = [...allArtists];
    const { searchTerm, selectedLocation, selectedMusicStyles, selectedPriceRanges } = filters;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(user => user.location === selectedLocation);
    }

    if (selectedMusicStyles.length > 0) {
      filtered = filtered.filter(user => selectedMusicStyles.includes(user.musicStyle || ''));
    }

    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(user => {
        const userPrice = user.price || 0;
        return selectedPriceRanges.some(range => {
          if (range === '1500+') {
            return userPrice >= 1500;
          }
          const [min, max] = range.split('-').map(Number);
          return userPrice >= min && userPrice <= max;
        });
      });
    }
    
    setFilteredArtists(filtered);
  }, [filters, allArtists]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isMobileLocationOpen, setIsMobileLocationOpen] = useState(false);
  const [isMobileMusicStyleOpen, setIsMobileMusicStyleOpen] = useState(false);
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="relative bg-center bg-cover" style={{ backgroundImage: "url('/background/disque2.png')" }}>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative w-full px-0 py-16 md:py-24 z-10">
              <StaggeredAnimation delay={200}>
                <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Découvrez nos <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Artistes</span>
                  </h1>
                  <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200">
                    Talents émergents et confirmés de la scène musicale.
                  </p>
                </div>
              </StaggeredAnimation>
            </div>
          </div>
        
          <div className="max-w-7xl mx-auto w-full flex gap-8 px-4 py-12 md:py-16">
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
              
              {/* Barre de recherche */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Rechercher un artiste..."
                  className="w-full h-12 px-4 text-sm bg-white border border-neutral-200/60 rounded-xl text-neutral-800 placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.searchTerm}
                  onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
                />
              </div>

              {/* Filtre Localisation */}
              <div className="mb-6">
                <div className="text-sm font-semibold mb-2">Localisation</div>
                <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                  <PopoverTrigger asChild>{locationButton}</PopoverTrigger>
                  <PopoverContent className="min-w-[100%] w-auto p-0 mt-2" align="start" side="bottom" sideOffset={2} avoidCollisions={false}>
                    {locationFilterContent}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtre Style Musical */}
              <CollapsibleFilter
                title="Style"
                isOpen={isMusicStyleOpen}
                onToggle={() => setIsMusicStyleOpen(!isMusicStyleOpen)}
              >
                {MUSIC_STYLES.map((style) => (
                  <div key={style.value} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`music-${style.value}`}
                      checked={filters.selectedMusicStyles.includes(style.value)}
                      onChange={() => handleMusicStyleChange(style.value)}
                      className="accent-blue-600 w-5 h-5 rounded-lg border border-neutral-300 shadow-sm"
                    />
                    <label htmlFor={`music-${style.value}`} className="text-neutral-800 cursor-pointer text-base font-medium">
                      {style.label}
                    </label>
                  </div>
                ))}
              </CollapsibleFilter>
            </aside>

            {/* Résultats à droite */}
            <section className="flex-1">
              {/* Section filtres mobile */}
              <div className="md:hidden flex items-center gap-4 px-4 py-4 mb-2">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-neutral-300 bg-white text-neutral-800 font-bold shadow-lg text-base active:scale-95 transition-transform"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="20" cy="14" r="2"/></svg>
                  Filtres
                </button>
                <span className="text-lg font-extrabold text-neutral-700 tracking-wide">{filteredArtists.length} RÉSULTATS</span>
              </div>

              {/* Popup mobile avec Drawer */}
              <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DrawerContent className="h-[95vh] top-0 mt-0">
                  <DrawerHeader className="text-left">
                    <DrawerTitle className="text-2xl font-bold">Filtres</DrawerTitle>
                    <button 
                      onClick={() => setMobileFiltersOpen(false)} 
                      className="absolute top-6 right-6 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </DrawerHeader>
                  <div className="px-6 py-4 space-y-6">
                    {/* Localisation */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setIsMobileLocationOpen(!isMobileLocationOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-base font-semibold text-neutral-900">Localisation</span>
                        {isMobileLocationOpen ? (
                          <ChevronUp className="w-5 h-5 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                      {isMobileLocationOpen && (
                        <div className="px-4 pb-3">
                          <LocationFilter
                            selectedLocation={filters.selectedLocation}
                            onLocationChange={handleLocationChange}
                          />
                        </div>
                      )}
                    </div>

                    {/* Style Musical */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setIsMobileMusicStyleOpen(!isMobileMusicStyleOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-base font-semibold text-neutral-900">Style</span>
                        {isMobileMusicStyleOpen ? (
                          <ChevronUp className="w-5 h-5 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                      {isMobileMusicStyleOpen && (
                        <div className="px-4 pb-3 space-y-2">
                          {MUSIC_STYLES.map((style) => (
                            <div key={style.value} className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`mobile-music-${style.value}`}
                                checked={filters.selectedMusicStyles.includes(style.value)}
                                onChange={() => handleMusicStyleChange(style.value)}
                                className="accent-blue-600 w-5 h-5 rounded-lg border border-neutral-300 shadow-sm"
                              />
                              <label htmlFor={`mobile-music-${style.value}`} className="text-neutral-800 cursor-pointer text-base font-medium">
                                {style.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 border-t border-neutral-100 bg-white">
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 text-base transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Valider
                    </button>
                  </div>
                </DrawerContent>
              </Drawer>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <ModernLoader size="lg" text="Chargement des artistes..." />
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <ModernSkeleton lines={3} height="h-4" className="mb-4" />
                        <ModernSkeleton lines={1} height="h-32" className="rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredArtists.length > 0 ? (
                <>
                  {/* Version mobile : card image en haut, détails dessous */}
                  <div className="flex flex-col gap-6 md:hidden">
                    {filteredArtists.map(user => (
                      <div key={user.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                        <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={user.profilepicture || '/placeholder.svg'}
                            alt={user.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex flex-col gap-1 px-5 pt-4 pb-5">
                          <div className="text-xl font-extrabold text-neutral-900 mb-1 leading-tight">{user.name}</div>
                          {user.location && <div className="text-sm text-neutral-500 mb-0.5">{user.location}</div>}
                          {user.musicStyle && <div className="text-sm text-neutral-700 font-semibold mb-1">{MUSIC_STYLES.find(s => s.value === user.musicStyle)?.label || user.musicStyle}</div>}
                          {user.bio && <div className="text-sm text-neutral-700 mb-2 line-clamp-3">{user.bio}</div>}
                          <div className="flex items-center gap-2 mb-2">
                            {user.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm font-semibold">{user.rating.toFixed(1)}</span>
                                <span className="text-sm text-neutral-500">({user.reviewCount})</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm text-neutral-500">— ({user.reviewCount})</span>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => navigate(`/profile/${user.id}`)}
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 text-base transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center gap-2"
                          >
                            Voir le profil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Version desktop : cartes en grille */}
                  <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredArtists.map(user => (
                      <div key={user.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                        <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={user.profilepicture || '/placeholder.svg'}
                            alt={user.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex flex-col gap-1 p-6">
                          <div className="text-xl font-extrabold text-neutral-900 mb-1 leading-tight">{user.name}</div>
                          {user.location && <div className="text-sm text-neutral-500 mb-0.5">{user.location}</div>}
                          {user.musicStyle && <div className="text-sm text-neutral-700 font-semibold mb-1">{MUSIC_STYLES.find(s => s.value === user.musicStyle)?.label || user.musicStyle}</div>}
                          {user.bio && <div className="text-sm text-neutral-700 mb-2 line-clamp-2">{user.bio}</div>}
                          <div className="flex items-center gap-2 mb-4">
                            {user.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm font-semibold">{user.rating.toFixed(1)}</span>
                                <span className="text-sm text-neutral-500">({user.reviewCount})</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm text-neutral-500">— ({user.reviewCount})</span>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => navigate(`/profile/${user.id}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 text-base transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center gap-2"
                          >
                            Voir le profil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
               ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-500">
                    Aucun artiste ne correspond à vos critères de recherche.
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ArtistsPage; 