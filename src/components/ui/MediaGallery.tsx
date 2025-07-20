import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Video, Music, Image } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import VideoThumbnail from '@/components/ui/VideoThumbnail';

interface MediaItem {
  id: string;
  url: string;
  type: 'video' | 'audio' | 'image';
  thumbnail?: string;
  title?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia.type === 'video';
  const isAudio = currentMedia.type === 'audio';

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = e.target as HTMLVideoElement | HTMLAudioElement;
    setCurrentTime(target.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = e.target as HTMLVideoElement | HTMLAudioElement;
    setDuration(target.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    // Mettre à jour la position de la vidéo/audio
    const mediaElement = document.querySelector('video, audio') as HTMLVideoElement | HTMLAudioElement;
    if (mediaElement) {
      mediaElement.currentTime = time;
    }
  };

  const getMediaIcon = (type: 'video' | 'audio' | 'image') => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Media principal */}
      <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden">
        {isVideo ? (
          <video
            src={currentMedia.url}
            controls={false}
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-cover"
          />
        ) : isAudio ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="text-center text-white">
              <Music className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">{currentMedia.title || 'Audio'}</p>
              <audio
                src={currentMedia.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <OptimizedImage
            src={currentMedia.url}
            alt={currentMedia.title || 'Image'}
            className="w-full h-full object-cover"
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
          />
        )}

        {/* Contrôles pour vidéo/audio */}
        {(isVideo || isAudio) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getMediaIcon(currentMedia.type)}
                <span className="text-sm capitalize">{currentMedia.type}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {media.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicateur de position */}
        {media.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Miniatures */}
      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-gray-300' : 'border-transparent hover:border-gray-300'
              }`}
            >
              {item.type === 'video' ? (
                <VideoThumbnail
                  videoUrl={item.url}
                  className="w-full h-full"
                  showPlayButton={false}
                />
              ) : item.type === 'audio' ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
              ) : (
                <OptimizedImage
                  src={item.url}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
                />
              )}
              
              {/* Indicateur de type */}
              <div className="absolute top-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                {getMediaIcon(item.type)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaGallery; 