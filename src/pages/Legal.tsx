import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail } from 'lucide-react';

const Legal = () => {
  return (
    <div className="min-h-screen bg-ml-white">
      <Header />
      
      <main className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-ml-charcoal mb-8">
            Mentions légales
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  RGPD - Protection des données
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed mb-4">
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-ml-charcoal/80 leading-relaxed space-y-2 ml-4">
                  <li>droit d'accès à vos données personnelles,</li>
                  <li>droit de rectification,</li>
                  <li>droit à l'effacement,</li>
                  <li>droit à la limitation du traitement,</li>
                  <li>droit à la portabilité,</li>
                  <li>droit d'opposition.</li>
                </ul>
                <p className="text-ml-charcoal/80 leading-relaxed mt-4">
                  Vous pouvez exercer ces droits en nous contactant à l'adresse : 
                  <a href="mailto:musiclinksplatform@gmail.com" className="text-ml-teal hover:underline ml-1">
                    musiclinksplatform@gmail.com
                  </a>
                </p>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Nous nous engageons à répondre dans un délai de 30 jours.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Cookies
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Le site utilise uniquement des cookies strictement nécessaires au bon fonctionnement de la plateforme (navigation, sécurité, session utilisateur).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Conditions générales d'utilisation
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed mb-4">
                  En accédant et en utilisant MusicLinks, vous acceptez les présentes conditions d'utilisation.
                  MusicLinks est une plateforme de mise en relation entre artistes, prestataires de services et partenaires stratégiques de l'industrie musicale.
                </p>
                <ul className="list-disc list-inside text-ml-charcoal/80 leading-relaxed space-y-2 ml-4">
                  <li>La plateforme n'intervient pas dans les transactions entre les utilisateurs.</li>
                  <li>Chaque utilisateur est responsable de ses engagements, paiements, et prestations.</li>
                  <li>En cas de litige, MusicLinks ne saurait être tenu pour responsable.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Propriété intellectuelle
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed mb-4">
                  Tous les contenus présents sur le site (textes, visuels, logos, vidéos, design, structure…) sont la propriété exclusive de MusicLinks, sauf mention contraire.
                </p>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Toute reproduction, diffusion ou exploitation sans autorisation préalable est strictement interdite et constitue une contrefaçon.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Contact
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed mb-4">
                  Pour toute question concernant les mentions légales, les données personnelles ou l'utilisation du site :
                </p>
                <div className="flex items-center text-ml-teal font-medium">
                  <Mail className="w-5 h-5 mr-2" />
                  <a href="mailto:musiclinksplatform@gmail.com" className="hover:underline">
                    musiclinksplatform@gmail.com
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Legal;
