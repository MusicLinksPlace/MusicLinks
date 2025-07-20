import React, { useState, useRef, useEffect } from 'react';
import { Play, Video, Music } from 'lucide-react';

interface VideoThumbnailProps {
  videoUrl: string;
  fallbackImage?: string;
  className?: string;
  showPlayButton?: boolean;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoUrl,
  fallbackImage,
  className = "",
  showPlayButton = true,
  onThumbnailGenerated
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoUrl) {
      setIsLoading(false);
      return;
    }

    const generateThumbnail = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) return;

      video.addEventListener('loadeddata', () => {
        try {
          // Essayer de capturer à 1 seconde
          video.currentTime = 1;
        } catch (e) {
          // Si ça échoue, essayer à 0 seconde
          video.currentTime = 0;
        }
      });

      video.addEventListener('seeked', () => {
        try {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          setThumbnailUrl(thumbnail);
          onThumbnailGenerated?.(thumbnail);
          setIsLoading(false);
        } catch (e) {
          console.warn('Erreur lors de la génération du thumbnail:', e);
          setError(true);
          setIsLoading(false);
        }
      });

      video.addEventListener('error', () => {
        setError(true);
        setIsLoading(false);
      });

      // Charger la vidéo
      video.load();
    };

    generateThumbnail();
  }, [videoUrl, onThumbnailGenerated]);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Video className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Video className="w-8 h-8" />
          <span className="text-sm">Vidéo</span>
          {showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-2">
                <Play className="w-6 h-6 text-white fill-current" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={thumbnailUrl}
        alt="Vidéo thumbnail"
        className="w-full h-full object-cover"
      />
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>
      )}
      {/* Indicateur vidéo */}
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        <Video className="w-3 h-3" />
        Vidéo
      </div>
    </div>
  );
};

export default VideoThumbnail; 