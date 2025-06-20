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
  profilepicture?: string;
}

const PartnersPage = () => {
  const [labelUsers, setLabelUsers] = useState<User[]>([]);
  const [managerUsers, setManagerUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterPartners = async () => {
      setLoading(true);

      const { data: users, error } = await supabase
        .from('User')
        .select('*')
        .eq('role', 'partner')
        .eq('verified', 1)
        .eq('disabled', 0);

      if (error) {
        console.error('Erreur lors de la requête Supabase :', error);
        setLoading(false);
        return;
      }

      if (users) {
        const labels = users.filter(user => user.subCategory === 'label');
        const managers = users.filter(user =>
          ['manager', 'directeur artistique'].includes(user.subCategory || '')
        );

        setLabelUsers(labels);
        setManagerUsers(managers);
      }

      setLoading(false);
    };

    fetchAndFilterPartners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 w-full py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Découvrez nos <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Partenaires</span> Stratégiques
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              Des experts pour vous accompagner dans votre développement de carrière.
            </p>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 text-lg">Chargement des partenaires...</div>
          ) : (
            <div className="space-y-16">
              {labelUsers.length > 0 && (
                <HorizontalCarousel title="Maisons de disque et labels" users={labelUsers} />
              )}
              {managerUsers.length > 0 && (
                <HorizontalCarousel title="Managers et directeurs artistiques" users={managerUsers} />
              )}
              {labelUsers.length === 0 && managerUsers.length === 0 && (
                 <div className="text-center py-16">
                   <p className="text-lg text-gray-500">
                     Aucun partenaire n'est disponible pour le moment.
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