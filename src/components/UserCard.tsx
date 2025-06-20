import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  rating?: number;
  profilepicture?: string | null;
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const subCategoryLabel = user.subCategory?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const isPlaceholder = !(user.profilepicture && 
                        user.profilepicture.startsWith('http') && 
                        !user.profilepicture.includes('placeholder'));

  const imageUrl = isPlaceholder
    ? '/lovable-uploads/logo2.png'
    : user.profilepicture;

  return (
    <Link to={`/profile/${user.id}`} className="block w-64 md:w-72 flex-shrink-0 snap-start group">
      <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
        <div className="relative h-40 md:h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={user.name}
            className={cn(
              "w-full h-full transition-transform duration-300 group-hover:scale-105",
              isPlaceholder ? "object-contain p-10" : "object-cover"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {subCategoryLabel && (
            <Badge
              variant="default"
              className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white border-white/20"
            >
              {subCategoryLabel}
            </Badge>
          )}
        </div>
        <div className="p-4 bg-white">
          <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
          <div className="flex items-center justify-between mt-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-700">{(user.rating || 4.8).toFixed(1)}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard; 