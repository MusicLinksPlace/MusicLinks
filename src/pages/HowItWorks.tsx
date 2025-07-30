import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { Search, Users, MessageCircle, Star, CheckCircle, Music, Briefcase, Handshake, ArrowRight, Target, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section 
          className="relative bg-center bg-cover flex-1 min-h-screen flex items-center justify-center"
          style={{ backgroundImage: "url('/background/disque1.png')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Musical background elements avec glow effects */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
            <div className="mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                <Music className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
                Comment ça marche ?
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
                Découvrez comment MusicLinks facilite les connexions ainsi que les opportunités d'affaires entre artistes, prestataires et partenaires du secteur musical.
              </p>
            </div>

            {/* Étapes Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
                      1
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Search className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Trouvez votre profil idéal</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Publiez votre recherche ou choisissez le talent fait pour booster votre projet musical.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
                      2
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Échangez et collaborez</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Discutez directement de votre projet avec vos coups de cœur et définissez ensemble les modalités.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg">
                      3
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Place à la création</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Donnez vie à votre projet musical avec l'expertise de professionnels passionnés et talentueux.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Vidéo */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Découvrez MusicLinks en action
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Regardez notre vidéo de présentation pour comprendre comment MusicLinks révolutionne les connexions dans l'industrie musicale
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative">
                  <VideoPlayer 
                    src="/video-web.mp4" 
                    className="w-full aspect-video"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les artistes */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50 text-center">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 mx-auto">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Rejoignez notre communauté
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Plus de 1200 artistes font déjà confiance à MusicLinks
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Pour les artistes
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Trouvez des prestataires qualifiés près de chez vous
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Publiez vos projets et recevez des candidatures
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Consultez les avis et portfolios des prestataires
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
                    >
                      Créer mon profil artiste
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les prestataires */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Pour les prestataires
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Créez votre vitrine professionnelle avec portfolio
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Recevez et accédez à des clients et projets qualifiés
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Renforcez votre visibilité et votre réputation
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
                    >
                      Créer mon profil professionnel
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50 text-center">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 mx-auto">
                    <Briefcase className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Développez votre activité
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Plus de 500 prestataires développent leur business avec nous
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les partenaires stratégiques */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50 text-center">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl mb-6 mx-auto">
                    <Handshake className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Connectez-vous avec les talents
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Plus de 200 partenaires stratégiques font confiance à MusicLinks
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Pour les partenaires stratégiques
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Découvrez des artistes talentueux et prometteurs
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Accédez à un réseau de professionnels qualifiés
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mt-3"></div>
                    <p className="text-gray-300 text-lg">
                      Développez des collaborations durables et fructueuses
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
                    >
                      Créer mon profil partenaire
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Prêt à commencer votre 
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                    aventure musicale ?
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Rejoignez MusicLinks et connectez-vous avec les meilleurs professionnels de la musique
                </p>
                
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
                  >
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks; 