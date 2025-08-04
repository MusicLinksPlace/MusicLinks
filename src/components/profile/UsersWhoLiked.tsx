import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLikes } from '@/hooks/use-likes';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import ModernLoader, { ModernSkeleton } from '@/components/ui/ModernLoader';

interface UserWhoLiked {
  id: string;
  name: string;
  profilepicture?: string;
  role?: string;
  likedAt: string;
}

interface UsersWhoLikedProps {
  targetUserId: string;
  className?: string;
  userRole?: string; // Ajout du rôle de l'utilisateur
}

const UsersWhoLiked: React.FC<UsersWhoLikedProps> = ({ targetUserId, className = "", userRole }) => {
  const [users, setUsers] = useState<UserWhoLiked[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { getUsersWhoLiked } = useLikes();

  useEffect(() => {
    loadUsers();
  }, [targetUserId]);

  const loadUsers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const newUsers = await getUsersWhoLiked(targetUserId, pageNumber, 20);
      
      if (pageNumber === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }
      
      setHasMore(newUsers.length === 20);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadUsers(page + 1);
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

  if (loading && users.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold">Qui a liké ce profil</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <ModernSkeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-2">
          <Heart className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600">Erreur lors du chargement des likes</p>
        <button 
          onClick={() => loadUsers(1)}
          className="mt-2 text-blue-500 hover:text-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Utiliser le rôle passé en props ou par défaut
  const profileRole = userRole || 'artist';

  // Déterminer le lien de redirection selon le rôle du profil
  const getRedirectLink = () => {
    switch (profileRole) {
      case 'artist':
        return '/providers';
      case 'provider':
        return '/artists';
      case 'partner':
        return '/artists';
      default:
        return '/artists';
    }
  };

  // Déterminer le texte du bouton selon le rôle du profil
  const getButtonText = () => {
    switch (profileRole) {
      case 'artist':
        return 'Découvrir les prestataires';
      case 'provider':
        return 'Découvrir les artistes';
      case 'partner':
        return 'Découvrir les artistes';
      default:
        return 'Découvrir les artistes';
    }
  };

  // Déterminer l'icône selon le rôle du profil
  const getButtonIcon = () => {
    switch (profileRole) {
      case 'artist':
        return '🎛️';
      case 'provider':
        return '🎵';
      case 'partner':
        return '🎵';
      default:
        return '🎵';
    }
  };

  if (users.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-2">
          <Heart className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">Aucun like pour le moment</p>
        <Link
          to={getRedirectLink()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <span className="text-base">{getButtonIcon()}</span>
          {getButtonText()}
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold">
          Qui a liké ce profil ({users.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            {/* Photo de profil */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {user.profilepicture ? (
                <img
                  src={getImageUrlWithCacheBust(user.profilepicture)}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 truncate">
                  {user.name}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(user.likedAt)}</span>
              </div>
            </div>

            {/* Icône like */}
            <div className="text-red-500">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </Link>
        ))}
      </div>

      {/* Bouton "Voir plus" */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersWhoLiked; 