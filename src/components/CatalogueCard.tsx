import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { MUSIC_STYLES } from '@/lib/constants';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface User {
  id: string;
  name: string;
  location?: string;
  rating?: number;
  reviewCount?: number; // Placeholder
  profilepicture?: string | null;
  musicStyle?: string;
  social_links?: (string | null)[] | null;
  portfolio_url?: string | null;
  price?: number;
}

interface CatalogueCardProps {
  user: User;
}

const socialIcons: { [key: string]: string } = {
    youtube: '/social-media/youtube.png',
    instagram: '/social-media/instagram.png',
    tiktok: '/social-media/tiktok.png',
    soundcloud: '/social-media/soundcloud.png',
    facebook: '/social-media/facebook.png',
    x: '/social-media/x.png'
};

const getSocialIcon = (url: string) => {
    for (const platform in socialIcons) {
        if (url.toLowerCase().includes(platform)) {
            return socialIcons[platform];
        }
    }
    return null;
};

const CatalogueCard: React.FC<CatalogueCardProps> = ({ user }) => {
  const navigate = useNavigate();
  const musicStyleLabel = MUSIC_STYLES.find(style => style.value === user.musicStyle)?.label;
  const userSocials = (user.social_links || []).map(link => ({
    url: link,
    icon: link ? getSocialIcon(link) : null
  })).filter(social => social.icon);

  const handleCardClick = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-md overflow-hidden w-48 sm:w-56 flex-shrink-0 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 sm:h-52 p-4">
        <OptimizedImage
          src={getImageUrlWithCacheBust(user.profilepicture)}
          alt={user.name}
          className="w-full h-full object-cover rounded-2xl"
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
        />
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-grow overflow-hidden pr-2">
            <h3 className="text-base font-bold text-gray-900 truncate">{user.name}</h3>
            <p className="text-gray-500 text-xs truncate">{user.location || 'Lieu non spécifié'}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-bold text-sm">{typeof user.rating === 'number' ? user.rating.toFixed(1) : '—'}/5</span>
            </div>
            <p className="text-xs text-gray-400">({user.reviewCount ?? 0} avis)</p>
          </div>
        </div>
        
        <hr className="my-3" />

        <div className="h-8 flex items-center">
          {musicStyleLabel && (
            <Badge className="bg-gray-100 text-gray-800 font-medium text-xs px-2.5 py-1">
              {musicStyleLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueCard; 