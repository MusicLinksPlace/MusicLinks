import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import UserCard from './UserCard';

interface User {
  id: string;
  name: string;
  subCategory?: string;
  location?: string;
  rating?: number;
  profilePicture?: string;
}

interface HorizontalCarouselProps {
  title: string;
  users: User[];
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ title, users }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-4 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
};

export default HorizontalCarousel; 