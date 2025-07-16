import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({ 
  images, 
  onProgress, 
  onComplete 
}) => {
  useEffect(() => {
    if (!images || images.length === 0) {
      onComplete?.();
      return;
    }

    let loadedCount = 0;
    const totalCount = images.length;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          loadedCount++;
          onProgress?.(loadedCount, totalCount);
          resolve();
        };
        
        img.onerror = () => {
          loadedCount++;
          onProgress?.(loadedCount, totalCount);
          resolve(); // Continue even if image fails
        };
        
        img.src = src;
      });
    };

    const preloadAll = async () => {
      try {
        // Preload images in batches to avoid overwhelming the browser
        const batchSize = 3;
        for (let i = 0; i < images.length; i += batchSize) {
          const batch = images.slice(i, i + batchSize);
          await Promise.all(batch.map(preloadImage));
          
          // Small delay between batches
          if (i + batchSize < images.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        onComplete?.();
      } catch (error) {
        console.warn('Error preloading images:', error);
        onComplete?.();
      }
    };

    preloadAll();
  }, [images, onProgress, onComplete]);

  return null; // This component doesn't render anything
};

export default ImagePreloader; 