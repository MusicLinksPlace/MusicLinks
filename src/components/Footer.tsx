import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white font-sans overflow-hidden">
      {/* Musical waveform background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 1200 120" className="w-full h-full">
            <path 
              d="M0,60 Q150,20 300,60 T600,60 T900,60 T1200,60" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
              className="animate-pulse"
            />
            <path 
              d="M0,60 Q150,100 300,60 T600,60 T900,60 T1200,60" 
              stroke="currentColor" 
              strokeWidth="1" 
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </svg>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-16">
          {/* Colonne gauche : Logo, texte, contact */}
          <div>
            <img 
              src="/lovable-uploads/d0150788-e222-4864-8f33-659fe58eafee.png" 
              alt="MusicLinks" 
              className="h-12 w-auto mb-6"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-md">
              MusicLinks connecte les artistes avec les meilleurs prestataires et partenaires du secteur musical. Trouvez votre studio, clipmaker ou photographe de confiance et signez avec le label ou le manager qui fera décoller votre carrière.
            </p>
            {/* Contact button */}
            <a 
              href="mailto:musiclinksplatform@gmail.com" 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-sm font-medium transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              <Mail className="h-4 w-4 mr-2" />
              Nous contacter
            </a>
          </div>

          {/* Colonne droite : Plateforme, Support, Réseaux */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 h-full">
              {/* Plateforme */}
              <div>
                <h3 className="font-semibold mb-6 text-white flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Plateforme
                </h3>
                <div className="space-y-4">
                  <Link 
                    to="/providers" 
                    className="block text-gray-300 hover:text-white text-sm transition-colors hover:translate-x-1 transform duration-300 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Prestataires
                  </Link>
                  <Link 
                    to="/Project" 
                    className="block text-gray-300 hover:text-white text-sm transition-colors hover:translate-x-1 transform duration-300 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Projets
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    className="block text-gray-300 hover:text-white text-sm transition-colors hover:translate-x-1 transform duration-300 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Comment ça marche
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-semibold mb-6 text-white flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Support
                </h3>
                <div className="space-y-4">
                  <Link 
                    to="/legal" 
                    className="block text-gray-300 hover:text-white text-sm transition-colors hover:translate-x-1 transform duration-300 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Mentions légales
                  </Link>
                  <a 
                    href="mailto:musiclinksplatform@gmail.com" 
                    className="block text-gray-300 hover:text-white text-sm transition-colors hover:translate-x-1 transform duration-300 flex items-center"
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Contact
                  </a>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div>
                <h3 className="font-semibold mb-6 text-white flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  Réseaux
                </h3>
                <div className="flex flex-row items-center gap-3">
                  <a href="https://www.instagram.com/musiclinksapp?igsh=MXEwYW9ybmh5ejIydA==" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full hover:bg-pink-100 transition-colors p-2">
                    <img src="/social-media/instagram.png" alt="Instagram" className="w-7 h-7" />
                  </a>
                  <a href="https://www.tiktok.com/@musiclinksapp?_t=ZN-8yWj9SRuDqQ&_r=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors p-2">
                    <img src="/social-media/tiktok.png" alt="TikTok" className="w-7 h-7" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <p className="text-gray-400 text-sm text-center">
            © 2025 MusicLinks. RGPD : les utilisateurs peuvent demander la suppression de leurs données à tout moment. 
            Les cookies sont utilisés pour le fonctionnement du site. En utilisant ce site, vous acceptez les CGU.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
