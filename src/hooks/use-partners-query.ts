import { useOptimizedQuery } from './use-optimized-query';
import { supabase } from '@/lib/supabaseClient';

interface Partner {
  id: string;
  name: string;
  subCategory: string;
  location?: string;
  profilepicture?: string;
  portfolio_url?: string;
  social_links?: string[];
  rating?: number;
  reviewCount?: number;
}

interface PartnerFilters {
  searchTerm: string;
  selectedLocation: string;
  selectedSubCategory: string;
}

export const usePartnersQuery = (filters: PartnerFilters) => {
  return useOptimizedQuery({
    queryFn: async () => {
      // Requête de base
      let query = supabase
        .from('User')
        .select('*')
        .eq('role', 'partner')
        .eq('verified', 1)
        .eq('disabled', 0);

      // Appliquer les filtres
      if (filters.selectedLocation !== 'all') {
        query = query.eq('location', filters.selectedLocation);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filtrer côté client
      let filteredData = data || [];

      // Filtre par terme de recherche
      if (filters.searchTerm) {
        filteredData = filteredData.filter(partner =>
          partner.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      // Filtre par sous-catégorie
      if (filters.selectedSubCategory !== 'all') {
        if (filters.selectedSubCategory === 'label') {
          filteredData = filteredData.filter(partner => partner.subCategory === 'label');
        } else if (filters.selectedSubCategory === 'manager') {
          filteredData = filteredData.filter(partner => 
            ['manager', 'directeur artistique'].includes(partner.subCategory || '')
          );
        }
      }

      // Calculer les notes et avis
      const partnerIds = filteredData.map(p => p.id);
      if (partnerIds.length > 0) {
        const { data: reviews } = await supabase
          .from('Review')
          .select('toUserid, rating')
          .in('toUserid', partnerIds);

        const reviewMap: Record<string, { sum: number; count: number }> = {};
        reviews?.forEach((review: any) => {
          if (!reviewMap[review.toUserid]) {
            reviewMap[review.toUserid] = { sum: 0, count: 0 };
          }
          reviewMap[review.toUserid].sum += review.rating;
          reviewMap[review.toUserid].count += 1;
        });

        // Ajouter les notes aux partenaires
        filteredData = filteredData.map(partner => ({
          ...partner,
          rating: reviewMap[partner.id]?.count 
            ? reviewMap[partner.id].sum / reviewMap[partner.id].count 
            : null,
          reviewCount: reviewMap[partner.id]?.count || 0
        }));
      }

      return filteredData;
    },
    dependencies: [
      filters.searchTerm,
      filters.selectedLocation,
      filters.selectedSubCategory
    ],
    cacheTime: 3 * 60 * 1000, // 3 minutes
    staleTime: 30 * 1000 // 30 secondes
  });
};

// Fonction helper pour organiser les partenaires par catégorie
export const organizePartnersByCategory = (partners: Partner[]) => {
  const labels = partners.filter(p => p.subCategory === 'label');
  const managers = partners.filter(p => 
    ['manager', 'directeur artistique'].includes(p.subCategory || '')
  );

  return {
    labels,
    managers,
    all: partners
  };
}; 