import React, { useState, useEffect, useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, MapPin, Star, Dot } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

const MUSIC_STYLES_MAP = {
    french_chanson: 'Variété / Chanson française',
    pop_folk: 'Pop / Folk',
    rock_punk: 'Rock / Punk',
    rap_hiphop: 'Rap / Hip‑Hop',
    rnb_soul: 'R&B / Soul',
    funk_disco: 'Funk / Disco',
    electronic: 'Musiques électroniques',
    jazz_blues: 'Jazz / Blues',
    classical: 'Musique classique',
    metal_hardrock: 'Metal / Hard Rock',
    latin: 'Musique latine',
    reggae_dub: 'Reggae / Dub',
    dancehall_zouk: 'Dancehall / Zouk',
    kpop: 'K‑Pop',
    other: 'Autre',
};

const UserProfileHeader = ({ user }) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );
    
    const subCategoryLabel = user.subCategory?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const imageUrls = [
        user.profilepicture,
        ...(user.galleryimages || [])
    ].filter(url => url);

    const musicStyleLabel = user.musicStyle 
        ? MUSIC_STYLES_MAP[user.musicStyle] 
        : "Style non défini";

    useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const rawJoinDate = user.created_at ? format(new Date(user.created_at), "MMMM yyyy", { locale: fr }) : '';
    const formattedJoinDate = rawJoinDate.charAt(0).toUpperCase() + rawJoinDate.slice(1);

  return (
    <div className="relative">
      {/* --- Image Carousel --- */}
      <Carousel 
        setApi={setApi} 
        className="w-full"
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
            {imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                    <div className="h-64 md:h-72">
                        <img src={url} alt={`Profile image ${index + 1}`} className="w-full h-full object-cover rounded-t-2xl"/>
                    </div>
                </CarouselItem>
            ))}
        </CarouselContent>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl pointer-events-none" />

        <div className="absolute top-4 left-4">
            <button onClick={() => window.history.back()} className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all">
                <ArrowLeft className="w-5 h-5" />
            </button>
        </div>
        
        {imageUrls.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {imageUrls.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${current === i ? 'w-6 bg-white' : 'w-3 bg-white/50'}`} />
                ))}
            </div>
        )}
      </Carousel>

      {/* --- Content Area with curved top --- */}
      <div className="relative bg-white pt-14 px-6 pb-6 -mt-10 rounded-t-3xl">
        <div className="absolute -top-12 left-6">
            <img src={user.profilepicture || '/lovable-uploads/logo2.png'} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"/>
        </div>

        <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">
                    {musicStyleLabel}
                </Badge>
            </div>
          
            {subCategoryLabel && (<p className="mt-1.5 text-md text-gray-600">{subCategoryLabel}</p>)}
          
            {user.location && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
              </div>
            )}
           
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-gray-800">4.2/5</span>
                <span className="text-gray-500">(120 reviews)</span>
              </div>
              {formattedJoinDate && (
                <>
                  <Dot className="text-gray-300" />
                  <span className="font-semibold text-gray-700">Membre depuis {formattedJoinDate}</span>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader; 