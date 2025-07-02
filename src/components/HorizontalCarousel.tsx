import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CatalogueCard from '@/components/CatalogueCard';
import ArtistCard from '@/components/ArtistCard';
import PartnerCard from '@/components/PartnerCard';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  profilepicture?: string;
  musicStyle?: string;
  portfolio_url?: string;
  social_links?: string[];
  role?: string;
  subcategory?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  coverImage?: string | null;
  isVideo?: boolean;
  price?: number;
  badges?: string[];
}

interface HorizontalCarouselProps {
  title: string;
  users: User[];
  cardClassName?: string;
  userRole?: string;
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ title, users, cardClassName, userRole }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-8 lg:px-[5vw]">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </Button>
          <Button
            variant="outline"
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className={cn(
          "w-full flex overflow-x-auto gap-x-4 scroll-smooth scrollbar-hide py-4 -mb-4 px-8 lg:px-[5vw]",
          userRole === 'artist' || userRole === 'partner' ? '' : 'px-4 md:px-0 md:-mx-24'
        )}
      >
        {users.map((user, index) => (
          <div key={user.id} className={cn(
            "snap-start",
            cardClassName
          )}>
            {userRole === 'partner' ? (
              <PartnerCard partner={user} />
            ) : userRole === 'artist' ? (
              <ArtistCard user={user} />
            ) : (
              <CatalogueCard user={user} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalCarousel; 