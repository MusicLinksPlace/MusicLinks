import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HorizontalCarousel from '@/components/HorizontalCarousel';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  rating?: number;
  profilepicture?: string;
}

const ArtistsPage = () => {
  const [artists, setArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      } else {
        setArtists(data);
      }
      setLoading(false);
    };

    fetchArtists();
  }, []);

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
          {loading ? (
            <div className="text-center text-gray-500 text-lg">Chargement des artistes...</div>
          ) : artists.length > 0 ? (
            <HorizontalCarousel title="Artistes & Créateurs de contenus" users={artists} />
           ) : (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">
                Aucun artiste n'est disponible pour le moment.
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