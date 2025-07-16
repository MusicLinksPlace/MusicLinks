import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useImageLoader } from '@/hooks/use-image-loader';
import ModernLoader from './ModernLoader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  className,
  containerClassName,
  priority = false,
  onLoad,
  onError
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isLoading, hasError, imageSrc } = useImageLoader({
    src,
    fallback,
    preload: priority
  });

  const handleLoad = () => {
    setIsVisible(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ModernLoader size="sm" text="" />
        </div>
      )}

      {/* Image */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100",
          isVisible && "animate-fade-in",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />

      {/* Error state */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 