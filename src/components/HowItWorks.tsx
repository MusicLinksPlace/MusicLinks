import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, Music, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    step: '01',
    title: 'Trouvez votre profil idéal',
    description: 'Publiez votre recherche ou choisissez le talent fait pour booster votre projet musical.',
    icon: Search,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  },
  {
    step: '02',
    title: 'Échangez et collaborez',
    description: 'Discutez directement de votre projet avec vos coups de cœur et définissez ensemble les modalités.',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50'
  },
  {
    step: '03',
    title: 'Place à la création',
    description: 'Donnez vie à votre projet musical avec l\'expertise de professionnels passionnés et talentueux.',
    icon: Music,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50'
  }
];

const HowItWorks = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Musical background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-purple-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-pink-400 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Play className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment MusicLinks facilite les connexions ainsi que les opportunités d'affaires entre artistes, prestataires et partenaires du secteur musical.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 rounded-full z-0"></div>
          
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center relative z-10 group">
                {/* Step circle with animation */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-xl font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  
                  {/* Pulse animation */}
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 animate-ping"></div>
                  </div>

                {/* Icon with background */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-gray-700" />
                  </div>

                  {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {step.title}
                  </h3>
                  
                <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-20">
          <Link to="/signup">
            <Button 
              size="lg" 
              className="font-semibold px-10 py-5 rounded-2xl text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-0"
            >
              Créer mon profil
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button 
              size="lg" 
              className="font-semibold px-10 py-5 rounded-2xl text-lg bg-white/20 backdrop-blur border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              En savoir plus
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 