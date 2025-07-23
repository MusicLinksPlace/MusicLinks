import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Music, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLikes } from '@/hooks/use-likes';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';
import ModernLoader, { ModernSkeleton } from '@/components/ui/ModernLoader';
import LoginRequiredPopup from '@/components/ui/LoginRequiredPopup';

interface LikedProfile {
  id: string;
  name: string;
  profilepicture?: string;
  location?: string;
  role?: string;
  subCategory?: string;
  musicStyle?: string;
  likeCount?: number;
  likedAt: string;
}

const LikedProfiles: React.FC = () => {
  const [likedProfiles, setLikedProfiles] = useState<LikedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getLikedProfiles, toggleLike, showLoginPopup, setShowLoginPopup } = useLikes();

  useEffect(() => {
    loadLikedProfiles();
  }, []);

  const loadLikedProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await getLikedProfiles();
      setLikedProfiles(profiles as unknown as LikedProfile[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (userId: string) => {
    try {
      await toggleLike(userId);
      // Recharger la liste
      await loadLikedProfiles();
    } catch (err: any) {
      console.error('Erreur lors du unlike:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'artist':
        return 'Artiste';
      case 'provider':
        return 'Prestataire';
      case 'partner':
        return 'Partenaire';
      default:
        return 'Utilisateur';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Profils likés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ModernSkeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erreur lors du chargement des profils likés</p>
        <button
          onClick={loadLikedProfiles}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (likedProfiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun profil liké</h3>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas encore liké de profils. Commencez à explorer et likez vos favoris !
        </p>
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Music className="w-5 h-5" />
          Découvrir des artistes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Popup de connexion requise */}
      <LoginRequiredPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
      />
      
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Profils likés ({likedProfiles.length})
        </h3>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Heart className="w-4 h-4 mr-1 fill-current" />
          Favoris
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {likedProfiles.map((profile) => {
          const musicStyleLabel = profile.musicStyle ? CATEGORY_TRANSLATIONS[profile.musicStyle] : null;
          const subCategoryLabel = profile.subCategory;
          
          return (
            <div
              key={profile.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <Link to={`/profile/${profile.id}`} className="block">
                {/* Image de profil */}
                <div className="relative h-32 bg-gray-100">
                  <img
                    src={getImageUrlWithCacheBust(profile.profilepicture)}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Badge de rôle */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-white/90 text-gray-800 text-xs">
                      {getRoleLabel(profile.role)}
                    </Badge>
                  </div>

                  {/* Date du like */}
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-white/90 text-gray-600 text-xs px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {formatDate(profile.likedAt)}
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate flex-1">
                      {profile.name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnlike(profile.id);
                      }}
                      className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Localisation */}
                  {profile.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}

                  {/* Note */}
                  {profile.likeCount && profile.likeCount > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Heart className="w-4 h-4 text-red-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {profile.likeCount}
                      </span>
                      <span className="text-sm text-gray-500">
                        like{profile.likeCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Style musical */}
                  {musicStyleLabel && (
                    <Badge variant="secondary" className="text-xs">
                      {musicStyleLabel}
                    </Badge>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LikedProfiles; 