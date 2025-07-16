import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useLocation } from 'react-router-dom';
import ModernLoader, { ModernSkeleton } from '@/components/ui/ModernLoader';
import PageTransition, { StaggeredAnimation } from '@/components/ui/PageTransition';

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
}

// Fonction pour trier les villes par priorité
const sortCitiesByPriority = (cities: string[]) => {
  const priorityCities = ['Paris', 'Lyon', 'Marseille'];
  return cities.sort((a, b) => {
    const aIndex = priorityCities.indexOf(a);
    const bIndex = priorityCities.indexOf(b);
    
    // Si les deux villes sont dans la liste de priorité
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // Si seule la première est dans la liste de priorité
    if (aIndex !== -1) return -1;
    // Si seule la seconde est dans la liste de priorité
    if (bIndex !== -1) return 1;
    // Sinon, tri alphabétique
    return a.localeCompare(b);
  });
};

const FilterBar = ({ onFilterChange, onReset, filters }: any) => {
  const isMobile = useIsMobile();
  const isFilterActive = filters.searchTerm !== '' || filters.selectedLocation !== 'all';
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, selectedLocation: location });
    setIsPopoverOpen(false); // Works for both Popover and Drawer
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
  const [allArtists, setAllArtists] = useState<User[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedLocation: 'all',
  });
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
    setFilters({ searchTerm: '', selectedLocation: 'all' });
  };

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
    const { searchTerm, selectedLocation } = filters;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(user => user.location === selectedLocation);
    }
    
    setFilteredArtists(filtered);
  }, [filters, allArtists]);

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
              <StaggeredAnimation delay={400}>
                <FilterBar 
                  onFilterChange={setFilters} 
                  onReset={handleResetFilters}
                  filters={filters}
                />
              </StaggeredAnimation>
            </div>
          </div>
        
        <div className="w-full px-0 py-12 md:py-16">
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
            <div className="space-y-16">
              {/* Carrousel Paris */}
              {filteredArtists.filter(artist => artist.location === 'Paris').length > 0 && (
                <StaggeredAnimation delay={600}>
                  <HorizontalCarousel 
                    title="Artistes à Paris" 
                    users={filteredArtists.filter(artist => artist.location === 'Paris')}
                    userRole="artist"
                  />
                </StaggeredAnimation>
              )}
              
              {/* Carrousel Lyon */}
              {filteredArtists.filter(artist => artist.location === 'Lyon').length > 0 && (
                <StaggeredAnimation delay={800}>
                  <HorizontalCarousel 
                    title="Artistes à Lyon" 
                    users={filteredArtists.filter(artist => artist.location === 'Lyon')}
                    userRole="artist"
                  />
                </StaggeredAnimation>
              )}
              
              {/* Carrousel Marseille */}
              {filteredArtists.filter(artist => artist.location === 'Marseille').length > 0 && (
                <StaggeredAnimation delay={1000}>
                  <HorizontalCarousel 
                    title="Artistes à Marseille" 
                    users={filteredArtists.filter(artist => artist.location === 'Marseille')}
                    userRole="artist"
                  />
                </StaggeredAnimation>
              )}
              
              {/* Carrousel Autres villes */}
              {filteredArtists.filter(artist => !['Paris', 'Lyon', 'Marseille'].includes(artist.location || '')).length > 0 && (
                <StaggeredAnimation delay={1200}>
                  <HorizontalCarousel 
                    title="Autres villes" 
                    users={filteredArtists.filter(artist => !['Paris', 'Lyon', 'Marseille'].includes(artist.location || ''))}
                    userRole="artist"
                  />
                </StaggeredAnimation>
              )}
            </div>
           ) : (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">
                Aucun artiste ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default ArtistsPage; 