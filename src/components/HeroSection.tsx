import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Users, ArrowRight, Music, TrendingUp, Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background vidéo */}
      <video
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay sombre */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}
      ></div>

      {/* Contenu principal */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          padding: '0 1rem'
        }}
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight text-white">
          <span className="block">L'univers musical</span>
          <span className="block bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            enfin connecté !
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          La plateforme qui réunit artistes, prestataires et partenaires de confiance 
          pour booster votre activité au sein du secteur musical.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link to="/providers">
            <Button 
              size="lg" 
              className="font-semibold px-10 py-5 rounded-2xl text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-0"
            >
              <Search className="mr-3 h-5 w-5" />
              Trouver un prestataire
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/signup">
            <Button 
              size="lg" 
              className="font-semibold px-10 py-5 rounded-2xl text-lg bg-white/20 backdrop-blur border border-white/30 text-white hover:bg-white/30 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Users className="mr-3 h-5 w-5" />
              Rejoindre MusicLinks
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-nowrap justify-center items-center space-x-4 md:space-x-16 overflow-x-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3">
                <Music className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">500+</span>
            </div>
            <p className="text-[11px] md:text-sm text-gray-200 font-medium leading-tight whitespace-nowrap">
              profils vérifiés
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">1200+</span>
            </div>
            <p className="text-[11px] md:text-sm text-gray-200 font-medium leading-tight whitespace-nowrap">
              Collaborations
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">98%</span>
            </div>
            <p className="text-[11px] md:text-sm text-gray-200 font-medium leading-tight whitespace-nowrap">
              Satisfaction client
            </p>
          </div>
        </div>
        
        {/* Phrase discrète */}
        <p className="text-xs text-gray-300/70 mt-4 font-light">
          (c'est ce qu'on vise avant la fin de l'année !)
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
