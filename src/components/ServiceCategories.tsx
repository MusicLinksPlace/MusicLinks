import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const roles = [
  {
    id: 'artists',
    title: 'Artistes',
    description: 'Trouvez des chanteurs, rappeurs, musiciens ou encore compositeurs pour mener une belle collaboration comme un featuring magistral !',
    slogan: 'Collaborez avec des talents de la musique',
    icon: User,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    link: '/artists',
  },
  {
    id: 'providers',
    title: 'Prestataires de services',
    description: "Trouvez le studio d'enregistrement de vos rêves, des clipmakers top niveau, des graphistes talentueux et bien d'autres experts du secteur musical.",
    slogan: 'Entourez vous des meilleurs',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    link: '/providers',
  },
  {
    id: 'partners',
    title: 'Partenaires stratégiques',
    description: 'Connectez-vous avec des labels, managers, et directeurs artistiques pour faire décoller votre carrière.',
    slogan: 'Développez votre réseau',
    icon: Users,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    link: '/partners',
  }
];

const ServiceCategories = () => {
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const { count: artistsCount, error: artistsError } = await supabase
          .from('User')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'artist');
        if (artistsError) throw artistsError;
        
        const { count: providersCount, error: providersError } = await supabase
          .from('User')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'provider');
        if (providersError) throw providersError;

        const { count: partnersCount, error: partnersError } = await supabase
          .from('User')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'partner');
        if (partnersError) throw partnersError;

        setCounts({
          artists: artistsCount || 0,
          providers: providersCount || 0,
          partners: partnersCount || 0,
        });

      } catch (error) {
        console.error("Error fetching role counts:", error);
        setCounts({ artists: 0, providers: 0, partners: 0 }); // Set default on error
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explorez notre communauté
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Que vous soyez un artiste en quête de collaborateurs, un prestataire offrant vos services, ou un partenaire en recherche de talents, MusicLinks est votre point de ralliement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const count = counts[role.id];
            const countText = {
              artists: "Talents",
              providers: "Experts",
              partners: "Partenaires"
            }[role.id];

            return (
              <Link
                key={role.id}
                to={role.link}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-lg hover:shadow-xl p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-600/50"
              >
                <div className={`absolute inset-0 ${role.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ease-out`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 ease-out shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300">
                    {role.title}
                  </h3>
                  
                  <p className="text-sm font-medium text-blue-400 mb-4 group-hover:text-blue-300 transition-colors duration-300">
                    {role.slogan}
                  </p>
                  
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {role.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs font-semibold text-gray-200 bg-gray-700/50 px-3 py-1 rounded-full">
                      {loading ? (
                        <Skeleton className="h-4 w-16" />
                      ) : (
                        <span>{count} {countText}</span>
                      )}
                    </div>
                    <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                      <span className="text-sm font-medium mr-2">Voir le catalogue</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
