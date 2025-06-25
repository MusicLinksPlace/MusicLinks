import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Conformément au Règlement Général sur la Protection des Données (RGPD), 
                  les utilisateurs peuvent demander la suppression de leurs données à tout moment 
                  en nous contactant à l'adresse email mentionnée ci-dessus.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Cookies
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Les cookies sont utilisés uniquement pour le bon fonctionnement du site. 
                  Aucun cookie de tracking publicitaire n'est utilisé.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Conditions générales d'utilisation
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  En utilisant ce site, vous acceptez les conditions générales d'utilisation. 
                  MusicLinks est une plateforme de mise en relation entre artistes et prestataires musicaux. 
                  Nous ne sommes pas responsables des transactions effectuées entre les utilisateurs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Propriété intellectuelle
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Le contenu de ce site, incluant les textes, images, logos et éléments graphiques, 
                  est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ml-charcoal mb-4">
                  Contact
                </h2>
                <p className="text-ml-charcoal/80 leading-relaxed">
                  Pour toute question concernant ces mentions légales ou l'utilisation du site, 
                  vous pouvez nous contacter à l'adresse : 
                  <a href="mailto:musiclinksplatform@gmail.com" className="text-ml-teal hover:underline ml-1">
                    musiclinksplatform@gmail.com
                  </a>
                </p>
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
