import { useOptimizedQuery } from './use-optimized-query';
import { supabase } from '@/lib/supabaseClient';

interface Provider {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  profilepicture?: string;
  portfolio_url?: string;
  social_links?: string[];
  bio?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProviderFilters {
  searchTerm: string;
  selectedLocation: string;
  selectedDomain: string;
  selectedSubCategories: string[];
}

export const useProvidersQuery = (filters: ProviderFilters) => {
  return useOptimizedQuery({
    queryFn: async () => {
      // Requête de base
      let query = supabase
        .from('User')
        .select('*')
        .eq('role', 'provider')
        .eq('disabled', 0);

      // Appliquer les filtres
      if (filters.selectedLocation !== 'all') {
        query = query.eq('location', filters.selectedLocation);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filtrer côté client pour les filtres complexes
      let filteredData = data || [];

      // Filtre par terme de recherche
      if (filters.searchTerm) {
        filteredData = filteredData.filter(provider =>
          provider.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          provider.bio?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      // Filtre par sous-catégories
      if (filters.selectedSubCategories.length > 0) {
        filteredData = filteredData.filter(provider =>
          provider.subCategory && filters.selectedSubCategories.includes(provider.subCategory)
        );
      }

      // Filtre par domaine
      if (filters.selectedDomain !== 'all') {
        // Logique pour filtrer par domaine (à adapter selon vos besoins)
        const domainSubCategories = getDomainSubCategories(filters.selectedDomain);
        if (domainSubCategories.length > 0) {
          filteredData = filteredData.filter(provider =>
            provider.subCategory && domainSubCategories.includes(provider.subCategory)
          );
        }
      }

      // Calculer les notes et avis
      const providerIds = filteredData.map(p => p.id);
      if (providerIds.length > 0) {
        const { data: reviews } = await supabase
          .from('Review')
          .select('toUserid, rating')
          .in('toUserid', providerIds);

        const reviewMap: Record<string, { sum: number; count: number }> = {};
        reviews?.forEach((review: any) => {
          if (!reviewMap[review.toUserid]) {
            reviewMap[review.toUserid] = { sum: 0, count: 0 };
          }
          reviewMap[review.toUserid].sum += review.rating;
          reviewMap[review.toUserid].count += 1;
        });

        // Ajouter les notes aux prestataires
        filteredData = filteredData.map(provider => ({
          ...provider,
          rating: reviewMap[provider.id]?.count 
            ? reviewMap[provider.id].sum / reviewMap[provider.id].count 
            : null,
          reviewCount: reviewMap[provider.id]?.count || 0
        }));
      }

      return filteredData;
    },
    dependencies: [
      filters.searchTerm,
      filters.selectedLocation,
      filters.selectedDomain,
      filters.selectedSubCategories.join(',')
    ],
    cacheTime: 3 * 60 * 1000, // 3 minutes
    staleTime: 30 * 1000 // 30 secondes
  });
};

// Fonction helper pour obtenir les sous-catégories d'un domaine
const getDomainSubCategories = (domain: string): string[] => {
  const domainMap: Record<string, string[]> = {
    "Professionnels de l'enregistrement": ['studio', 'beatmaker', 'engineer'],
    "Promotion et marketing": ['radio_curator', 'community_manager', 'media'],
    "Visuel": ['clipmaker', 'monteur', 'photographe', 'graphiste'],
    "Distribution": ['distributor'],
    "Droits": ['music_lawyer'],
    "Formation": ['vocal_coach', 'music_workshop', 'danseur']
  };

  return domainMap[domain] || [];
}; 