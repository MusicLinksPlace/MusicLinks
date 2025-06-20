import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { Megaphone, Camera, Gavel, GraduationCap, Search, MapPin, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  profilepicture?: string;
}

const providerGroupsConfig = [
  {
    title: 'Promotion et marketing',
    icon: Megaphone,
    sections: [
      { title: 'Programmateurs de radio/playlist', subCategories: ['radio_curator'] },
      { title: 'Community manager', subCategories: ['community_manager'] },
    ],
  },
  {
    title: 'VISUEL',
    icon: Camera,
    sections: [
      { title: 'CLIPMAKERS', subCategories: ['clipmaker'] },
      { title: 'Monteurs', subCategories: ['video_editor'] },
      { title: 'Photographes', subCategories: ['photographer'] },
      { title: 'Graphistes', subCategories: ['graphic_designer'] },
    ],
  },
  {
    title: 'Droits et distribution',
    icon: Gavel,
    sections: [
      { title: 'Distributeurs de musique', subCategories: ['distributor'] },
      { title: 'Avocats spécialisés', subCategories: ['music_lawyer'] },
    ],
  },
  {
    title: 'Formation',
    icon: GraduationCap,
    sections: [
      { title: 'Coach vocal', subCategories: ['vocal_coach'] },
      { title: 'Ateliers et cours de musique', subCategories: ['music_workshop'] },
    ],
  },
];

const FilterBar = ({ locations, onFilterChange }: any) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    onFilterChange({ searchTerm, selectedLocation, selectedDomain });
  }, [searchTerm, selectedLocation, selectedDomain]);

  const filters = (
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Rechercher un nom..."
          className="pl-10 h-12 text-base border-slate-200 bg-slate-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger className="h-12 text-base border-slate-200 bg-slate-50 text-zinc-900 focus:ring-2 focus:ring-blue-500 [&>span]:data-[placeholder]:text-zinc-500">
          <MapPin className="h-5 w-5 text-zinc-400 mr-2" />
          <SelectValue placeholder="Toutes les villes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les villes</SelectItem>
          {locations.map((loc: string) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={selectedDomain} onValueChange={setSelectedDomain}>
        <SelectTrigger className="h-12 text-base border-slate-200 bg-slate-50 text-zinc-900 focus:ring-2 focus:ring-blue-500 [&>span]:data-[placeholder]:text-zinc-500">
           <ChevronDown className="h-5 w-5 text-zinc-400 mr-2" />
          <SelectValue placeholder="Tous les domaines" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les domaines</SelectItem>
          {providerGroupsConfig.map(group => <SelectItem key={group.title} value={group.title}>{group.title}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full h-12 text-base font-semibold shadow-sm border-slate-200">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filtres
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-white rounded-t-2xl shadow-xl p-6 border-none focus:outline-none">
          <div className="relative mb-6 text-center">
            <img
              src="/lovable-uploads/451a0a63-4154-4a97-91cf-b1db62593cb0.png"
              alt="MusicLinks Logo"
              className="h-8 w-auto inline-block mb-4"
            />
            <DrawerHeader className="text-center p-0">
              <DrawerTitle className="font-semibold text-zinc-900 text-xl">Filtres</DrawerTitle>
            </DrawerHeader>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 rounded-full h-9 w-9 text-zinc-500 hover:bg-slate-100 hover:text-zinc-900"
              onClick={() => setIsDrawerOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
          {filters}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="sticky top-[65px] z-40 bg-gray-50/80 backdrop-blur-sm py-4">
      {filters}
    </div>
  );
};

const ProvidersPage = () => {
  const [allProviders, setAllProviders] = useState<User[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedLocation: 'all',
    selectedDomain: 'all',
  });

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
        const distinctLocations = [...new Set(users.map(u => u.location).filter(Boolean) as string[])];
        setLocations(distinctLocations.sort());
      }
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    let filteredProviders = [...allProviders];
    const { searchTerm, selectedLocation, selectedDomain } = filters;

    if (searchTerm) {
      filteredProviders = filteredProviders.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation !== 'all') {
      filteredProviders = filteredProviders.filter(user => user.location === selectedLocation);
    }

    const groupsWithUsers = providerGroupsConfig
      .map(groupConfig => {
        if (selectedDomain !== 'all' && groupConfig.title !== selectedDomain) {
          return { ...groupConfig, sections: [] };
        }

        const sectionsWithUsers = groupConfig.sections
          .map(sectionConfig => {
            const usersInSection = filteredProviders.filter(user =>
              sectionConfig.subCategories.includes(user.subCategory || '')
            );
            return { ...sectionConfig, users: usersInSection };
          })
          .filter(section => section.users.length > 0);

        return { ...groupConfig, sections: sectionsWithUsers };
      })
      .filter(group => group.sections.length > 0);
    
    setFilteredGroups(groupsWithUsers);

  }, [filters, allProviders]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 w-full py-12 md:py-16">
            <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Trouvez les meilleurs <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Prestataires</span>
              </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              Des professionnels qualifiés pour donner vie à vos projets musicaux.
              </p>
            </div>

          <div className="mb-8">
            <FilterBar locations={locations} onFilterChange={setFilters} />
          </div>

          {loading ? (
            <div className="text-center text-gray-500 text-lg">Chargement des prestataires...</div>
          ) : (
            <div className="space-y-16">
              {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                  <div key={group.title}>
                    <div className="flex items-center gap-x-4 mb-8">
                      <group.icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <h2 className="text-3xl font-bold text-gray-800 tracking-tight shrink-0">
                        {group.title}
                </h2>
                      <hr className="w-full border-t-2 border-gray-200" />
                    </div>
                    <div className="space-y-12">
                      {group.sections.map((section: any) => (
                         <HorizontalCarousel key={section.title} title={section.title} users={section.users} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-500">Aucun prestataire ne correspond à votre recherche.</p>
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

export default ProvidersPage;
