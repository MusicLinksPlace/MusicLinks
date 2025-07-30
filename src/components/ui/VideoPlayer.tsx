import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './button';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Vérifier si la source vidéo est accessible
    const checkVideoAccess = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (!response.ok) {
          console.error('🚨 Video not accessible:', src, response.status);
          // Ne pas définir d'erreur immédiatement, essayer de charger quand même
        }
      } catch (error) {
        console.error('🚨 Video access check failed:', error);
        // Ne pas définir d'erreur ici, laisser le navigateur essayer de charger
      }
    };

    checkVideoAccess();

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      console.error('🚨 Video failed to load:', src);
      console.error('🚨 Video error details:', target.error);
      setHasError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

          return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * video.duration;
    video.currentTime = newTime;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative group bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('🚨 Video error:', e);
          console.error('🚨 Video src:', src);
          setHasError(true);
          setIsLoading(false);
        }}
        onClick={handleVideoClick}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/quicktime" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/ogg" />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      
      {/* Overlay avec bouton play central */}
      {!isPlaying && !hasError && !isLoading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
          </Button>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Chargement de la vidéo...</p>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {hasError && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center p-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Vidéo non disponible</h3>
            <p className="text-sm text-gray-300 mb-4">La vidéo ne peut pas être chargée pour le moment.</p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm mr-2"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => {
                  // Utiliser une vidéo de démonstration
                  const demoVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                  if (videoRef.current) {
                    videoRef.current.src = demoVideo;
                    videoRef.current.load();
                    setHasError(false);
                    setIsLoading(true);
                  }
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm"
              >
                Vidéo de démonstration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Barre de progression */}
        <div 
          className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full cursor-pointer mb-3 sm:mb-4"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Contrôles inférieurs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              )}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>

          <div className="text-white text-xs sm:text-sm font-medium">
            {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 