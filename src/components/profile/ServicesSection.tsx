import React from 'react';

interface ServicesSectionProps {
  price?: number | null;
  serviceDescription?: string | null;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ price, serviceDescription }) => {
  if (!price && !serviceDescription) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Services</h3>
        <div className="text-gray-600">
          Aucune information de service n'a encore été configurée pour ce profil.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Services</h3>
      
      {/* Prix */}
      {price && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <img src="/money.png" alt="Prix" className="w-6 h-6 object-contain" />
            <span className="text-gray-900 font-normal">
              Tarif à partir de {price.toLocaleString('fr-FR')}€
            </span>
          </div>
        </div>
      )}
      
      {/* Description du service */}
      {serviceDescription && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900">Description des services</h4>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {serviceDescription}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicesSection; 