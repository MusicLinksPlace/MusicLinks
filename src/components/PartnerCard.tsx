import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';

interface Partner {
  id: string;
  name: string;
  location?: string;
  profilepicture?: string | null;
  musicStyle?: string;
  rating?: number;
}

const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => {
  const styleLabel = partner.musicStyle ? CATEGORY_TRANSLATIONS[partner.musicStyle] || partner.musicStyle : null;
  return (
    <Link
      to={`/profile/${partner.id}`}
      className="group block w-[320px] md:w-[420px] h-[280px] rounded-3xl overflow-hidden shadow-lg bg-gray-200 relative transition-all duration-300 hover:shadow-2xl hover:scale-105"
    >
      {/* Image de fond */}
      {partner.profilepicture ? (
        <img
          src={partner.profilepicture}
          alt={partner.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
          <span className="text-5xl text-white/60 font-bold">🎵</span>
        </div>
      )}
      {/* Overlay dégradé */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      {/* Overlay bas */}
      <div className="absolute bottom-0 left-0 w-full px-6 pb-6 pt-10 flex flex-col justify-end z-10">
        <div className="text-white font-bold text-2xl truncate drop-shadow-lg">{partner.name}</div>
        <div className="flex items-center gap-2 mt-1">
          {partner.location && <span className="text-gray-200 text-sm flex items-center gap-1">📍 {partner.location}</span>}
          {styleLabel && (
            <span className="ml-2 px-3 py-1 rounded-full border border-white text-white text-xs bg-white/10 backdrop-blur-sm font-medium">
              {styleLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PartnerCard; 