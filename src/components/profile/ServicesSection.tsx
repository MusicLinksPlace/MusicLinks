import React from 'react';
import { Euro, FileText, Package } from 'lucide-react';

interface ServicesSectionProps {
  price?: number | null;
  serviceDescription?: string | null;
  userRole?: string;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ price, serviceDescription, userRole }) => {
  // Pour les artistes, on ne montre pas la section des prix
  const shouldShowPrice = userRole !== 'artist' && price;
  
  if (!shouldShowPrice && !serviceDescription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Services</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-gray-500 text-sm">
            Aucune information de service n'a encore été configurée pour ce profil.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Services</h3>
      </div>
      
      {/* Prix - seulement pour les prestataires et partenaires */}
      {shouldShowPrice && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-blue-600 font-medium mb-1">Tarif de base</div>
              <div className="text-lg font-semibold text-gray-900">
                À partir de {price!.toLocaleString('fr-FR')}€
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Description du service */}
      {serviceDescription && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Description des services</h4>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {serviceDescription}
            </p>
          </div>
        </div>
      )}

      {/* Informations supplémentaires pour les prestataires */}
      {userRole === 'provider' && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-xs">💡</span>
            </div>
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Prestataire de services</div>
              <div>Ce profil propose des services professionnels dans le domaine musical. Contactez directement pour discuter de vos besoins spécifiques.</div>
            </div>
          </div>
        </div>
      )}

      {/* Informations supplémentaires pour les partenaires */}
      {userRole === 'partner' && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 text-xs">🤝</span>
            </div>
            <div className="text-sm text-purple-800">
              <div className="font-medium mb-1">Partenaire stratégique</div>
              <div>Ce profil représente une organisation ou un partenaire stratégique dans l'industrie musicale. Contactez pour des collaborations.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSection; 