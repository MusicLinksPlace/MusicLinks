import { useState, useEffect } from 'react';

interface UseImageLoaderOptions {
  src: string;
  fallback?: string;
  preload?: boolean;
}

export const useImageLoader = ({ src, fallback, preload = true }: UseImageLoaderOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(src);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
      setImageSrc(src);
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      if (fallback) {
        setImageSrc(fallback);
      }
    };

    img.src = src;

    // Preload image if requested
    if (preload) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback, preload]);

  return {
    isLoading,
    hasError,
    imageSrc
  };
};

// Hook pour optimiser le chargement de plusieurs images
export const useBatchImageLoader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    if (imageUrls.length === 0) return;

    setLoadingCount(imageUrls.length);
    const newLoadedImages = new Set<string>();

    const loadImage = (url: string) => {
      const img = new Image();
      
      img.onload = () => {
        newLoadedImages.add(url);
        setLoadedImages(new Set(newLoadedImages));
        setLoadingCount(prev => prev - 1);
      };

      img.onerror = () => {
        setLoadingCount(prev => prev - 1);
      };

      img.src = url;
    };

    // Load images with a small delay to prevent overwhelming the browser
    imageUrls.forEach((url, index) => {
      setTimeout(() => loadImage(url), index * 50);
    });
  }, [imageUrls]);

  return {
    loadedImages,
    loadingCount,
    isAllLoaded: loadingCount === 0 && loadedImages.size === imageUrls.length
  };
}; 