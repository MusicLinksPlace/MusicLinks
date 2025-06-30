import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Search, Users, MessageCircle, Star, CheckCircle, Music, Briefcase, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-ml-white font-sans">
      <Header />
      
      <main className="pt-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-ml-teal/10 to-ml-navy/10 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Music className="h-16 w-16 text-ml-teal mx-auto mb-6" />
            <h1 className="text-3xl md:text-5xl font-bold text-ml-charcoal mb-6">
              Comment ça marche ?
            </h1>
            <p className="text-xl text-ml-charcoal/70 max-w-3xl mx-auto leading-relaxed">
              Découvrez comment MusicLinks facilite les connexions ainsi que les opportunités d'affaires entre artistes, prestataires et partenaires du secteur musical.
            </p>
          </div>
        </section>

        {/* Étapes */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Étape 1 */}
              <div className="bg-ml-blue/10 backdrop-blur border border-ml-blue/30 rounded-2xl shadow-xl p-8 mx-auto max-w-sm flex flex-col items-center hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-ml-blue/80 text-white text-2xl font-bold mb-4 shadow border border-white/30">1</div>
                <Search className="w-10 h-10 mb-3 text-ml-blue-dark" />
                <h3 className="text-xl font-semibold text-ml-blue-dark mb-2 text-center">Trouvez votre profil idéal</h3>
                <p className="text-ml-gray-medium text-center text-base leading-relaxed">
                Publiez votre besoin ou choisissez le talent fait pour booster votre projet musical.</p>
              </div>
              {/* Étape 2 */}
              <div className="bg-ml-blue/10 backdrop-blur border border-ml-blue/30 rounded-2xl shadow-xl p-8 mx-auto max-w-sm flex flex-col items-center hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-ml-blue/80 text-white text-2xl font-bold mb-4 shadow border border-white/30">2</div>
                <MessageCircle className="w-10 h-10 mb-3 text-ml-blue-dark" />
                <h3 className="text-xl font-semibold text-ml-blue-dark mb-2 text-center">Échangez et collaborez</h3>
                <p className="text-ml-gray-medium text-center text-base leading-relaxed">
                  Discutez directement de votre projet avec vos coups de cœur et définissez ensemble les modalités.
                </p>
              </div>
              {/* Étape 3 */}
              <div className="bg-ml-blue/10 backdrop-blur border border-ml-blue/30 rounded-2xl shadow-xl p-8 mx-auto max-w-sm flex flex-col items-center hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-ml-blue/80 text-white text-2xl font-bold mb-4 shadow border border-white/30">3</div>
                <Music className="w-10 h-10 mb-3 text-ml-blue-dark" />
                <h3 className="text-xl font-semibold text-ml-blue-dark mb-2 text-center">Place à la création</h3>
                <p className="text-ml-gray-medium text-center text-base leading-relaxed">
                  Donnez vie à votre projet musical avec l'expertise de professionnels passionnés et talentueux.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les artistes */}
        <section className="py-20 bg-gradient-to-r from-ml-light-gray/20 to-ml-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="bg-gradient-to-br from-ml-teal/10 to-ml-navy/10 rounded-3xl p-8 text-center order-2 lg:order-1">
                <Users className="h-24 w-24 text-ml-teal mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Rejoignez notre communauté
                </h3>
                <p className="text-ml-charcoal/70">
                  Plus de 1200 artistes font déjà confiance à MusicLinks
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-ml-charcoal mb-6">
                  Pour les artistes
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Trouvez des prestataires qualifiés près de chez vous
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Publiez vos projets et recevez des candidatures
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Consultez les avis et portfolios des prestataires
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button size="lg" variant="gradient" className="rounded-full px-8">
                      Créer mon profil artiste
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les prestataires */}
        <section className="py-20 bg-gradient-to-r from-ml-light-gray/20 to-ml-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-ml-charcoal mb-6">
                  Pour les prestataires
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Créez votre vitrine professionnelle avec portfolio
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Recevez et accédez à des clients et projets qualifiés
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Renforcez votre visibilité et votre réputation
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button size="lg" variant="gradient" className="rounded-full px-8">
                      Créer mon profil professionnel
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-gradient-to-br from-ml-teal/10 to-ml-navy/10 rounded-3xl p-8 text-center">
                <Briefcase className="h-24 w-24 text-ml-teal mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Développez votre activité
                </h3>
                <p className="text-ml-charcoal/70">
                  Plus de 500 prestataires développent leur business avec nous
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les partenaires stratégiques */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="bg-gradient-to-br from-ml-navy/10 to-ml-teal/10 rounded-3xl p-8 text-center order-2 lg:order-1">
                <Handshake className="h-24 w-24 text-ml-teal mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Connectez-vous avec les talents
                </h3>
                <p className="text-ml-charcoal/70">
                  Plus de 200 partenaires stratégiques font confiance à MusicLinks
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-ml-charcoal mb-6">
                  Pour les partenaires stratégiques
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Découvrez des artistes talentueux et prometteurs
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Accédez à un réseau de professionnels qualifiés
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-ml-teal rounded-full mt-3"></div>
                    <p className="text-ml-charcoal/80 text-lg">
                      Développez des collaborations durables et fructueuses
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button size="lg" variant="gradient" className="px-8 py-3 rounded-full font-semibold">Créer mon profil partenaire</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-ml-teal to-ml-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à commencer votre aventure musicale ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez MusicLinks et connectez-vous avec les meilleurs professionnels de la musique
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks; 