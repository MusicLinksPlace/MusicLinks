import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationFilter } from '@/components/ui/LocationFilter';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

interface User {
  id: string;
  name: string;
  subCategory: string;
  location?: string;
  profilepicture?: string;
  portfolio_url?: string;
  social_links?: string[];
}

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
    <div className="w-full max-w-xl mx-auto mt-12">
      <div className="group p-6 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md border border-neutral-200/50">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher un partenaire..."
              className="w-full h-12 pl-11 text-sm bg-white/50 border border-neutral-200/60 rounded-xl"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            />
          </div>
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
        </div>
        {isFilterActive && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" className="h-auto px-3 py-1 text-xs" onClick={onReset}>
              Réinitialiser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const PartnersPage = () => {
  const [allPartners, setAllPartners] = useState<User[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedLocation: 'all',
  });

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('role', 'partner')
        .eq('verified', 1)
        .eq('disabled', 0);

      if (error) {
        console.error('Erreur lors de la requête Supabase :', error);
      } else if (data) {
        setAllPartners(data);
        setFilteredPartners(data);
      }
      setLoading(false);
    };

    fetchPartners();
  }, []);

  useEffect(() => {
    let tempPartners = [...allPartners];

    if (filters.searchTerm) {
      tempPartners = tempPartners.filter(p => p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    }

    if (filters.selectedLocation !== 'all') {
      tempPartners = tempPartners.filter(p => p.location === filters.selectedLocation);
    }

    setFilteredPartners(tempPartners);
  }, [filters, allPartners]);

  const handleResetFilters = () => {
    setFilters({ searchTerm: '', selectedLocation: 'all' });
  };
  
  const labels = filteredPartners.filter(p => p.subCategory === 'label');
  const managers = filteredPartners.filter(p => ['manager', 'directeur artistique'].includes(p.subCategory || ''));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative bg-center bg-cover" style={{ backgroundImage: "url('/background/disque4.png')" }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 w-full py-16 md:py-24 z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                Nos <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Partenaires Stratégiques</span>
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200">
                Les piliers de l'industrie qui nous font confiance.
              </p>
            </div>
            <FilterBar
              onFilterChange={setFilters}
              onReset={handleResetFilters}
              filters={filters}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full py-12 md:py-16">
          {loading ? (
            <div className="text-center text-gray-500 text-lg">Chargement des partenaires...</div>
          ) : (
            <div className="space-y-16">
              {labels.length > 0 && (
                <HorizontalCarousel title="Maisons de disque & labels" users={labels} />
              )}
              {managers.length > 0 && (
                <HorizontalCarousel title="Managers & directeurs artistiques" users={managers} />
              )}
              {labels.length === 0 && managers.length === 0 && (
                 <div className="text-center py-16">
                   <p className="text-lg text-gray-500">
                     Aucun partenaire ne correspond à vos critères de recherche.
                   </p>
                 </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartnersPage; 