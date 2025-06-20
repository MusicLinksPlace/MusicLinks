import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Users, ArrowRight, Music, TrendingUp, Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 lg:py-32 font-sans">
      {/* Musical background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-900">
          Connectez votre
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            univers musical
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          La plateforme qui réunit artistes et prestataires de confiance. 
          Trouvez votre ingénieur son, clipmaker ou coach musical.
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
              className="font-semibold px-10 py-5 rounded-2xl text-lg bg-white/20 backdrop-blur border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Users className="mr-3 h-5 w-5" />
              Rejoindre MusicLinks
            </Button>
          </Link>
        </div>

        {/* Stats de réassurance - Layout horizontal compact */}
        <div className="flex justify-center items-center space-x-8 md:space-x-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3">
                <Music className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-gray-900">500+</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 font-medium leading-tight">
              Presta.<br className="md:hidden" />
              vérifiés
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-gray-900">1200+</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 font-medium leading-tight">
              Projets<br className="md:hidden" />
              réalisés
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-gray-900">98%</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 font-medium leading-tight">
              Satisf.<br className="md:hidden" />
              client
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
