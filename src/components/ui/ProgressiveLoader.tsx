import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ModernLoader from './ModernLoader';

interface LoadingStep {
  id: string;
  label: string;
  duration?: number;
}

interface ProgressiveLoaderProps {
  steps: LoadingStep[];
  onComplete?: () => void;
  className?: string;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  steps,
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete?.();
      return;
    }

    const step = steps[currentStep];
    const duration = step.duration || 1000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const stepProgress = Math.min(elapsed / duration, 1);
      
      const totalProgress = ((currentStep + stepProgress) / steps.length) * 100;
      setProgress(totalProgress);

      if (stepProgress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [currentStep, steps, onComplete]);

  if (currentStep >= steps.length) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current step */}
      <div className="text-center mb-4">
        <ModernLoader size="md" text="" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          {currentStepData.label}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Étape {currentStep + 1} sur {steps.length}
        </p>
      </div>

      {/* Progress percentage */}
      <div className="text-2xl font-bold text-gray-900">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// Composant de loading pour les pages spécifiques
export const PageSpecificLoader = ({ pageType }: { pageType: 'artists' | 'profile' | 'providers' | 'partners' | 'general' }) => {
  const getSteps = (): LoadingStep[] => {
    switch (pageType) {
      case 'artists':
        return [
          { id: 'init', label: 'Initialisation...', duration: 500 },
          { id: 'fetch', label: 'Récupération des artistes...', duration: 800 },
          { id: 'reviews', label: 'Calcul des notes...', duration: 600 },
          { id: 'images', label: 'Préchargement des images...', duration: 1000 },
          { id: 'ready', label: 'Préparation de l\'affichage...', duration: 400 }
        ];
      case 'providers':
        return [
          { id: 'init', label: 'Initialisation...', duration: 500 },
          { id: 'fetch', label: 'Récupération des prestataires...', duration: 800 },
          { id: 'categories', label: 'Organisation par catégories...', duration: 600 },
          { id: 'images', label: 'Préchargement des images...', duration: 1000 },
          { id: 'ready', label: 'Préparation de l\'affichage...', duration: 400 }
        ];
      case 'partners':
        return [
          { id: 'init', label: 'Initialisation...', duration: 500 },
          { id: 'fetch', label: 'Récupération des partenaires...', duration: 800 },
          { id: 'labels', label: 'Organisation des labels...', duration: 600 },
          { id: 'managers', label: 'Organisation des managers...', duration: 600 },
          { id: 'images', label: 'Préchargement des images...', duration: 1000 },
          { id: 'ready', label: 'Préparation de l\'affichage...', duration: 400 }
        ];
      case 'profile':
        return [
          { id: 'init', label: 'Chargement du profil...', duration: 600 },
          { id: 'gallery', label: 'Préparation de la galerie...', duration: 800 },
          { id: 'reviews', label: 'Récupération des avis...', duration: 700 },
          { id: 'media', label: 'Optimisation des médias...', duration: 900 },
          { id: 'ready', label: 'Finalisation...', duration: 500 }
        ];
      default:
        return [
          { id: 'init', label: 'Chargement...', duration: 1000 },
          { id: 'ready', label: 'Préparation...', duration: 500 }
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <ProgressiveLoader steps={getSteps()} />
    </div>
  );
};

export default ProgressiveLoader; 