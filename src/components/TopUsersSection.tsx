import React, { useEffect, useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { translateCategory } from '@/lib/constants';

interface User {
  id: string;
  name: string;
  profilepicture?: string;
  subCategory?: string;
  location?: string;
}

interface TopUsersSectionProps {
  role: 'artist' | 'provider' | 'partner';
  title: string;
}

const TopUsersSection: React.FC<TopUsersSectionProps> = ({ role, title }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching users for role:', role);

      const { data, error } = await supabase
        .from('User')
        .select('id, name, profilepicture, subCategory, location')
        .eq('role', role)
        .eq('star', 1)
        .limit(3);

      if (error) {
        console.error('❌ Supabase error:', error.message);
        setError("Erreur lors du chargement des profils.");
        setUsers([]);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    fetchUsers();
  }, [role]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex justify-center gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 lg:px-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-64 md:w-72">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            {/* Avatar skeleton */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Name skeleton */}
            <div className="text-center mb-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-24"></div>
            </div>
            
            {/* Speciality skeleton */}
            <div className="text-center mb-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-32"></div>
            </div>
            
            {/* Location skeleton */}
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">Aucun profil mis en avant</p>
        <p className="text-gray-400 text-sm mt-1">Revenez bientôt pour découvrir nos talents</p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-500 text-lg font-medium">Erreur de chargement</p>
        <p className="text-gray-400 text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Users Carousel */}
        <div className="relative">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState />
          ) : users.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex justify-start md:justify-center gap-4 md:gap-6 lg:gap-8 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth mobile-scroll-container relative pl-[calc(50vw-128px)] pr-[calc(50vw-128px)] md:pl-0 md:pr-0 pb-8">
              {users.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className="flex-shrink-0 w-64 md:w-72 group"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    {/* Avatar with Star Badge */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img
                          src={user.profilepicture || '/lovable-uploads/logo2.png'}
                          alt={user.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1.5 shadow-lg">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {user.name}
                      </h3>
                      
                      {user.subCategory && (
                        <p className="text-sm text-gray-600 mb-1 font-medium">
                          {translateCategory(user.subCategory)}
                        </p>
                      )}
                      
                      {user.location && (
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopUsersSection;
