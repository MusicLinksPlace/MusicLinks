import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star, Play } from 'lucide-react';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface User {
  id: string;
  name: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  profilepicture?: string | null;
  musicStyle?: string;
  subcategory?: string;
  bio?: string;
  portfolio_url?: string | null;
  social_links?: (string | null)[] | null;
  coverImage?: string | null;
  isVideo?: boolean;
  price?: number;
  badges?: string[];
}

interface ArtistCardProps {
  user: User;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ user }) => {
  const categoryLabel = user.subcategory ? CATEGORY_TRANSLATIONS[user.subcategory] : null;
  const musicStyleLabel = user.musicStyle ? CATEGORY_TRANSLATIONS[user.musicStyle] : null;
  
  // Description courte basée sur la bio ou le style musical
  const shortDescription = user.bio 
    ? user.bio.length > 80 ? `${user.bio.substring(0, 80)}...` : user.bio
    : musicStyleLabel || categoryLabel || "Artiste talentueux";

  // Badges Fiverr-like
  let displayBadges = user.badges || [];
  if (user.rating && user.rating >= 4.8 && !displayBadges.includes('Top Rated')) {
    displayBadges = [...displayBadges, 'Top Rated'];
  }
  if (user.reviewCount && user.reviewCount >= 50 && !displayBadges.includes('Vetted')) {
    displayBadges = [...displayBadges, 'Vetted'];
  }

  return (
    <div className="relative flex flex-col w-[260px] sm:w-[270px] md:w-[300px] flex-shrink-0">
      {/* Image 16/9 */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl group">
        <OptimizedImage
          src={user.coverImage || user.profilepicture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
        />
        {user.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <Play className="w-7 h-7 text-white fill-current" />
            </div>
          </div>
        )}
      </div>
      {/* Bloc infos */}
      <div className="bg-white px-3 pt-2 pb-3 flex flex-col flex-1">
        {/* Ligne annonce + badges */}
        <div className="flex items-center gap-2 mb-1 min-h-[24px]">
          <span className="text-xs text-gray-500 truncate">Annonce par <span className="font-medium text-gray-700">{user.name}</span></span>
          <div className="flex gap-1 ml-auto">
            {displayBadges.slice(0,2).map((badge, i) => (
              <Badge key={i} className={
                badge === 'Top Rated'
                  ? 'bg-yellow-100 text-yellow-700 text-[11px] font-semibold px-2 py-0.5'
                  : badge === 'Vetted'
                  ? 'bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5'
                  : 'bg-purple-100 text-purple-700 text-[11px] font-semibold px-2 py-0.5'
              }>
                {badge}
              </Badge>
            ))}
          </div>
        </div>
        {/* Description/tagline */}
        <div className="mb-2">
          <span className="block text-xs text-gray-500 leading-snug line-clamp-2">
            {shortDescription}
          </span>
        </div>
        <div className="flex-1" />
        {/* Footer note */}
        <div className="flex items-end justify-between mt-auto pt-2 pb-1">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-bold text-sm text-gray-900">{typeof user.rating === 'number' ? user.rating.toFixed(1) : '—'}</span>
            <span className="text-xs text-gray-500">({user.reviewCount ?? 0})</span>
          </div>
        </div>
      </div>
      <Link to={`/profile/${user.id}`} className="absolute inset-0 z-10" aria-label={`Voir le profil de ${user.name}`} />
    </div>
  );
};

export default ArtistCard; 