import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, Heart, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section with Background Image */}
        <section 
          className="relative bg-center bg-cover min-h-screen flex items-center justify-center"
          style={{ backgroundImage: "url('/background/about-us-bk.png')" }}
        >
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
              QUI SOMMES-NOUS ?
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
              Nous sommes de grands passionnés de la musique qui aidons artistes, prestataires et partenaires stratégiques du secteur à se mettre en relation pour collaborer et créer des opportunités d'affaires.
            </p>
          </div>

          {/* Fondateurs Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="relative mb-6">
                  <img 
                    src="/pp-mauly.jpeg" 
                    alt="Mauly Dieng" 
                    className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-white/30"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Mauly Dieng</h3>
                <p className="text-green-200 font-medium text-lg">Directeur Commercial</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="relative mb-6">
                  <img 
                    src="/pp-nico.jpeg" 
                    alt="Nicolas Bohbot" 
                    className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-white/30"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Nicolas Bohbot</h3>
                <p className="text-blue-200 font-medium text-lg">Fondateur</p>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="relative mb-6">
                  <img 
                    src="/pp-raph.jpg" 
                    alt="Raphaël Levy" 
                    className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-white/30"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Raphaël Levy</h3>
                <p className="text-purple-200 font-medium text-lg">CPO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              À propos de nous
            </h2>
          </div>
          
          {/* Main Description */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6 text-lg leading-relaxed">
              <p className="text-gray-300">
                <span className="text-white font-bold">MusicLinks</span>, c'est la première marketplace dédiée à connecter tous les acteurs de la musique (artistes, studios, clipmakers, graphistes, labels...)
              </p>
              
              <p className="text-gray-300">
                On est là pour <span className="text-blue-400 font-semibold">simplifier la rencontre</span>, <span className="text-purple-400 font-semibold">booster les collaborations</span> et <span className="text-green-400 font-semibold">développer vos projets</span>.
              </p>
              
              <p className="text-gray-300">
                Née de la passion commune pour la musique et l'entrepreneuriat, notre équipe croit à un écosystème plus ouvert, plus simple et plus rentable pour tous.
              </p>
              
              <p className="text-gray-300">
                On veut <span className="text-orange-400 font-semibold">briser les barrières</span>, <span className="text-pink-400 font-semibold">fluidifier les échanges</span> et <span className="text-cyan-400 font-semibold">créer des opportunités</span>.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Notre Passion</h3>
                <p className="text-gray-300 text-center">
                  Connecter les talents et créer des synergies dans l'univers musical français et international.
                </p>
              </div>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-blue-400">Notre Mission</h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Donner à chaque talent et chaque professionnel les outils pour trouver les bonnes personnes, signer les bons deals et faire rayonner leur talent.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-purple-400">Notre Vision</h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Une industrie musicale plus transparente, plus connectée et plus accessible, où chacun peut vivre de sa passion, quel que soit son rôle.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Maintenant que vous nous connaissez,<br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  n'attendez plus !
                </span>
              </h3>
              
              <Link 
                to="/signup" 
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                S'inscrire
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
} 