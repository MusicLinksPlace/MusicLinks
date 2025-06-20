import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  rating?: number;
  profilepicture?: string;
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

const FilterBar = ({ locations, onFilterChange, onReset, filters }: any) => {
  const isFilterActive = filters.searchTerm !== '' || filters.selectedLocation !== 'all';

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="group p-6 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md border border-neutral-200/50 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20">
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
          {/* Select Location */}
          <div className="relative w-full">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 pointer-events-none" />
            <Select 
              value={filters.selectedLocation} 
              onValueChange={(value) => onFilterChange({ ...filters, selectedLocation: value })}
            >
              <SelectTrigger className="w-full h-12 pl-11 text-sm bg-white/50 border border-neutral-200/60 rounded-xl text-neutral-800 data-[placeholder]:text-neutral-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white/80 backdrop-blur-md border-neutral-200 shadow-lg">
                <SelectItem value="all">Toutes les villes</SelectItem>
                {locations.map((loc: string) => <SelectItem key={loc} value={loc} className="text-sm">{loc}</SelectItem>)}
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

const ArtistsPage = () => {
  const [allArtists, setAllArtists] = useState<User[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedLocation: 'all',
  });

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
        // Trier les artistes par ville (Paris, Lyon, Marseille, puis autres)
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
        });
        
        setAllArtists(sortedArtists);
        const distinctLocations = [...new Set(data.map(u => u.location).filter(Boolean) as string[])];
        setLocations(sortCitiesByPriority(distinctLocations));
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 w-full py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Découvrez nos <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Artistes</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              Talents émergents et confirmés de la scène musicale.
            </p>
          </div>

          <div className="mb-12">
            <FilterBar 
              locations={locations} 
              onFilterChange={setFilters} 
              onReset={handleResetFilters}
              filters={filters}
            />
          </div>

          {loading ? (
            <div className="text-center text-gray-500 text-lg">Chargement des artistes...</div>
          ) : filteredArtists.length > 0 ? (
            <div className="space-y-16">
              {/* Carrousel Paris */}
              {filteredArtists.filter(artist => artist.location === 'Paris').length > 0 && (
                <HorizontalCarousel 
                  title="Artistes à Paris" 
                  users={filteredArtists.filter(artist => artist.location === 'Paris')} 
                />
              )}
              
              {/* Carrousel Lyon */}
              {filteredArtists.filter(artist => artist.location === 'Lyon').length > 0 && (
                <HorizontalCarousel 
                  title="Artistes à Lyon" 
                  users={filteredArtists.filter(artist => artist.location === 'Lyon')} 
                />
              )}
              
              {/* Carrousel Marseille */}
              {filteredArtists.filter(artist => artist.location === 'Marseille').length > 0 && (
                <HorizontalCarousel 
                  title="Artistes à Marseille" 
                  users={filteredArtists.filter(artist => artist.location === 'Marseille')} 
                />
              )}
              
              {/* Carrousel Autres villes */}
              {filteredArtists.filter(artist => !['Paris', 'Lyon', 'Marseille'].includes(artist.location || '')).length > 0 && (
                <HorizontalCarousel 
                  title="Autres villes" 
                  users={filteredArtists.filter(artist => !['Paris', 'Lyon', 'Marseille'].includes(artist.location || ''))} 
                />
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
  );
};

export default ArtistsPage; 