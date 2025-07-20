import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  MessageCircle, 
  Play, 
  PlayCircle,
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  Euro,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  ExternalLink,
  Users,
  X,
  Image,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import ContactButton from '@/components/ContactButton';
import ShareProfile from '@/components/ui/ShareProfile';
import { useLikes } from '@/hooks/use-likes';
import ModernLoader, { ModernSkeleton } from '@/components/ui/ModernLoader';
import OptimizedImage from '@/components/ui/OptimizedImage';
import VideoThumbnail from '@/components/ui/VideoThumbnail';
import VideoPlayer from '@/components/ui/VideoPlayer';
import PageTransition, { StaggeredAnimation } from '@/components/ui/PageTransition';
import ServicesSection from '@/components/profile/ServicesSection';
import LikedProfiles from '@/components/profile/LikedProfiles';

// Composant de galerie moderne et fluide
const ModernGallery = ({ video, images }: { video?: string, images?: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Seulement les images dans la galerie
  const imageSlides = images ? images.map(url => ({ type: 'image', url })) : [];
  
  if (imageSlides.length === 0 && !video) return null;

  const nextSlide = () => setCurrent((current + 1) % imageSlides.length);
  const prevSlide = () => setCurrent((current - 1 + imageSlides.length) % imageSlides.length);

  // Gestion du scroll du body quand le modal est ouvert
  useEffect(() => {
    if (showCarousel || showVideoModal) {
      document.body.style.overflow = 'hidden';
      // Scroll automatique vers le haut quand on ouvre le modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCarousel, showVideoModal]);

  return (
    <>
      {/* Desktop: galerie fluide avec grille responsive */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4">
          {/* Grande image à gauche */}
          <div 
            className="col-span-2 aspect-square bg-white rounded-2xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group"
            onClick={() => setShowCarousel(true)}
          >
            <div className="w-full h-full flex items-center justify-center">
              <OptimizedImage
                src={imageSlides[current]?.url}
                alt="media"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
              />
            </div>
          </div>

          {/* Deux petites images à droite */}
          <div className="space-y-4">
            {imageSlides.slice(0, 2).map((slide, i) => (
              <div
                key={i}
                className="w-full aspect-square bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => setShowCarousel(true)}
              >
                <div className="w-full h-full flex items-center justify-center">
                                          <OptimizedImage
                          src={slide.url}
                          alt="miniature"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
                        />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Section "Autres contenus" - UI moderne */}
        {(imageSlides.length > 2 || video) && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Autres contenus</h3>
            
            <div className="flex gap-3">
              {/* Bouton "Voir toutes les images" */}
              {imageSlides.length > 2 && (
                <button 
                  onClick={() => setShowCarousel(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm font-medium">Voir toutes les images</span>
                </button>
              )}

              {/* Bouton "Voir les vidéos" */}
              {video && (
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="text-sm">Voir les vidéos</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: galerie fluide */}
      <div className="md:hidden">
        <div 
          className="relative aspect-square bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group"
          onClick={() => setShowCarousel(true)}
        >
          <div className="w-full h-full flex items-center justify-center">
            <OptimizedImage
              src={imageSlides[current]?.url}
              alt="media"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
            />
          </div>

          {/* Navigation mobile */}
          {imageSlides.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicateurs mobile */}
          {imageSlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {imageSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? 'bg-violet-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section "Autres contenus" mobile */}
        {(imageSlides.length > 2 || video) && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Autres contenus</h3>
            
            <div className="flex flex-col gap-2">
              {imageSlides.length > 2 && (
                <button 
                  onClick={() => setShowCarousel(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm font-medium">Voir toutes les images</span>
                </button>
              )}

              {video && (
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="text-sm">Voir les vidéos</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Carrousel Modal - IDENTIQUE POUR IMAGES ET VIDÉOS */}
      {showCarousel && (
        <div 
          className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center pt-20 p-4 animate-in fade-in duration-300"
          onClick={() => setShowCarousel(false)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer en haut */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setShowCarousel(false)}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu principal - RESPECTE LES FORMATS */}
            <div className="relative bg-white rounded-t-2xl overflow-hidden p-6">
              <div className="w-full max-w-lg mx-auto flex items-center justify-center">
                <OptimizedImage
                  src={imageSlides[current]?.url}
                  alt="media"
                  className="max-w-full max-h-[50vh] object-contain object-center"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
                />
              </div>

              {/* Navigation */}
              {imageSlides.length > 1 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all z-20"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all z-20"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Indicateur de position */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                {current + 1} / {imageSlides.length}
              </div>
            </div>

            {/* Miniatures en bas - BOÎTES CARRÉES */}
            {imageSlides.length > 1 && (
              <div className="p-4 rounded-b-2xl">
                <div className="flex gap-3 justify-center">
                  {imageSlides.map((slide, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-white shadow-sm ${
                        i === current ? 'border-gray-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <OptimizedImage
                          src={slide.url}
                          alt="miniature"
                          className="w-full h-full object-contain object-center"
                          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Vidéo - PETIT ET EN HAUT */}
      {showVideoModal && video && (
        <div 
          className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center pt-20 p-4 animate-in fade-in duration-300"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer en haut */}
            <div className="absolute top-2 right-2 z-20">
              <button 
                onClick={() => setShowVideoModal(false)}
                className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vidéo principale - PETITE ET COMPACTE */}
            <div className="relative bg-white rounded-t-2xl overflow-hidden p-3">
              <div className="w-full flex items-center justify-center">
                <VideoPlayer
                  videoUrl={video}
                  className="w-full max-w-full"
                  showControls={true}
                />
              </div>

              {/* Indicateur de position */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs z-10">
                1 / 1
              </div>
            </div>

            {/* Miniatures en bas - PETITES */}
            <div className="p-3 rounded-b-2xl">
              <div className="flex gap-2 justify-center">
                <button
                  className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-300 transition-all flex-shrink-0 bg-white shadow-sm"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoThumbnail
                      videoUrl={video}
                      className="w-full h-full"
                      showPlayButton={true}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Galerie mobile style Mariages.net
const MobileGallery = ({ video, images }: { video?: string, images?: string[] }) => {
  const [current, setCurrent] = useState(0);
  
  const slides = [
    ...(video ? [{ type: 'video', url: video }] : []),
    ...(images ? images.map(url => ({ type: 'image', url })) : [])
  ];
  
  if (slides.length === 0) return null;

  const nextSlide = () => setCurrent((current + 1) % slides.length);
  const prevSlide = () => setCurrent((current - 1 + slides.length) % slides.length);

  return (
    <div className="md:hidden relative">
      {/* Image/Vidéo principale plein écran */}
      <div className="relative w-full bg-white rounded-2xl overflow-hidden">
        {slides[current].type === 'video' ? (
          <div className="w-full flex items-center justify-center bg-white">
            <VideoPlayer
              videoUrl={slides[current].url}
              poster={images && images[0]}
              className="w-full max-w-full"
            />
          </div>
        ) : (
          <div className="w-full aspect-square flex items-center justify-center">
            <img 
              src={slides[current].url} 
              alt="media" 
              className="w-full h-full object-contain object-center"
            />
          </div>
        )}

        {/* Navigation */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicateur de position */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-gray-800/80 text-white px-3 py-1 rounded-full text-sm">
            {current + 1} / {slides.length}
          </div>
        )}
      </div>
    </div>
  );
};

// En-tête de profil moderne et sobre
const ModernProfileHeader = ({ user, rating, reviewCount }: any) => {
  const { isLiked, toggleLike, loading: likeLoading, likeCount } = useLikes(user?.id);

  // Calcul de la date d'inscription
  const getMemberSince = (createdAt?: string) => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `Membre depuis ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Navigation et actions */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <button 
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={() => toggleLike(user.id)}
            disabled={likeLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 relative"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            {likeCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {likeCount > 99 ? '99+' : likeCount}
              </div>
            )}
          </button>
          <ShareProfile
            userId={user.id}
            userName={user.name}
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-gray-100"
          />
        </div>
      </div>

      {/* Carte profil compacte */}
      <div className="px-4 md:px-6 pb-6">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Photo de profil */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img 
                  src={getImageUrlWithCacheBust(user.profilepicture)} 
                  alt={user.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Nom et note */}
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-light text-gray-900 truncate">{user.name}</h1>
                    {rating && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full border border-amber-200">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="text-sm font-medium text-amber-700">{rating.toFixed(1)}</span>
                        <span className="text-xs text-amber-600">({reviewCount || 0})</span>
                      </div>
                    )}
                  </div>

                  {/* Localisation et membre depuis */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getMemberSince(user.createdat)}</span>
                    </div>
                  </div>

                  {/* Tarif */}
                  {user.price && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg mb-4">
                      <Euro className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">À partir de {user.price}€</span>
                    </div>
                  )}
                </div>

                {/* Bouton de contact */}
                <div className="flex-shrink-0">
                  <ContactButton 
                    userId={user.id} 
                    userName={user.name} 
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// Onglets modernes et élégants
const ModernTabs = ({ activeTab, setActiveTab, isOwnProfile }: any) => {
  const baseTabs = [
    { id: 'informations', label: 'Informations' },
    { id: 'services', label: 'Services' },
    { id: 'avis', label: 'Avis' }
  ];

  const allTabs = isOwnProfile 
    ? [...baseTabs, { id: 'likes', label: 'Likes' }]
    : baseTabs;

  return (
    <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-all duration-200 text-sm md:text-base relative group ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-700 bg-violet-50/50'
                : 'border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-600"></div>
            )}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 transition-all duration-200 ${
              activeTab === tab.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
            }`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Section avis moderne et épurée
const ModernReviewsSection = ({ reviews, rating, reviewCount }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const distributionData = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter((r: any) => Math.floor(r.rating) === stars).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { stars, count, percentage };
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Résumé des notes - Design moderne et épuré */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Note globale - Impact visuel */}
          <div className="text-center">
            <div 
              className={`text-6xl font-bold mb-3 transition-all duration-700 ease-out ${
                isLoaded 
                  ? 'text-gray-900 scale-100 opacity-100' 
                  : 'text-gray-300 scale-95 opacity-0'
              }`}
            >
              {typeof rating === 'number' ? rating.toFixed(1) : '—'}
            </div>
            
            {/* Étoiles fines et modernes */}
            <div className="flex justify-center gap-0.5 mb-3">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${
                    star <= (rating || 0) 
                      ? 'text-amber-400 fill-current' 
                      : 'text-gray-200'
                  }`} 
                />
              ))}
            </div>
            
            {/* Nombre d'avis discret */}
            <p className="text-xs font-light text-gray-500 tracking-wide">
              {reviewCount} avis
            </p>
          </div>

          {/* Distribution des notes - Barres fines et élégantes */}
          <div className="space-y-2.5">
            {distributionData.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                {/* Nombre d'étoiles aligné à gauche */}
                <div className="flex items-center gap-1.5 w-12">
                  <span className="text-sm font-medium text-gray-700">{item.stars}</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                </div>
                
                {/* Barre de progression fine et élégante */}
                <div className="flex-1 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: isLoaded ? `${item.percentage}%` : '0%',
                      transform: isLoaded ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left'
                    }}
                  />
                </div>
                
                {/* Nombre d'avis */}
                <span className="text-xs text-gray-500 w-6 text-right font-light">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des avis - Design moderne */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-sm font-light">Pas encore d'avis pour ce profil.</div>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <img 
                  src={review.fromUserid?.profilepicture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'} 
                  alt={review.fromUserid?.name} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-medium text-gray-900 text-sm">
                      {review.fromUserid?.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating 
                              ? 'text-amber-400 fill-current' 
                              : 'text-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-light">
                      {new Date(review.createdat).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Composant principal
const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'informations' | 'services' | 'avis' | 'likes'>('informations');
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const storedUser = localStorage.getItem('musiclinks_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Vérifier si l'utilisateur regarde son propre profil
  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        setError('User ID is missing.');
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setUser(data);
        
        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('Review')
          .select('*, fromUserid (name, profilepicture)')
          .eq('toUserid', userId)
          .order('createdat', { ascending: false });
        setReviews(reviewsData || []);
        
        if (reviewsData && reviewsData.length > 0) {
          setReviewCount(reviewsData.length);
          setRating(reviewsData.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsData.length);
        } else {
          setReviewCount(0);
          setRating(null);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleContact = () => {
    if (userId) {
      navigate(`/chat?userId=${userId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <ModernLoader size="lg" text="Chargement du profil..." />
          <div className="mt-8 max-w-4xl mx-auto px-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Gallery skeleton */}
              <div className="lg:col-span-2">
                <ModernSkeleton lines={1} height="h-96" className="rounded-2xl" />
              </div>
              {/* Profile info skeleton */}
              <div className="space-y-6">
                <ModernSkeleton lines={3} height="h-4" />
                <ModernSkeleton lines={1} height="h-32" className="rounded-xl" />
                <ModernSkeleton lines={2} height="h-4" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center py-10 text-red-500">Erreur: {error}</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center py-10">Utilisateur non trouvé.</div>
        <Footer />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">
        <Header />
        {/* Espace pour compenser le header fixe sur les pages profil */}
        <div className="h-20 md:h-20 bg-white"></div>
        
        {/* Version Mobile */}
        <div className="md:hidden bg-white">
        {/* Galerie mobile en haut */}
        <MobileGallery video={user.galleryVideo} images={user.galleryimages} />
        
        {/* En-tête mobile - utilise le même header que desktop */}
        <ModernProfileHeader user={user} rating={rating} reviewCount={reviewCount} />
        
        {/* Onglets mobile */}
        <div className="bg-white">
          {/* Onglets */}
          <ModernTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwnProfile={isOwnProfile} />
          
          {/* Contenu mobile */}
          <div className="p-6 pb-8 bg-white">
            {activeTab === 'informations' && (
              <div className="space-y-8">
                {/* Description */}
                {user.bio && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">À propos</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-base">{user.bio}</p>
                  </div>
                )}

                {/* Informations pratiques */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informations</h3>
                  </div>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-3 p-3 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {(() => {
                          const createdDate = new Date(user.createdat);
                          const now = new Date();
                          const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
                          
                          if (monthsDiff < 1) {
                            return "Membre depuis moins d'un mois";
                          } else if (monthsDiff === 1) {
                            return "Membre depuis 1 mois";
                          } else {
                            return `Membre depuis ${monthsDiff} mois`;
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                {user.social_links && user.social_links.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Réseaux sociaux</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {user.social_links.map((url: string, i: number) => (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm transition-all duration-200 hover:scale-105 border border-gray-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {url.includes('linkedin') ? 'LinkedIn' : 
                           url.includes('youtube') ? 'YouTube' : 
                           url.includes('instagram') ? 'Instagram' : 
                           url.includes('soundcloud') ? 'SoundCloud' :
                           url.includes('spotify') ? 'Spotify' : 'Réseau'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <ServicesSection 
                price={user.price} 
                serviceDescription={user.serviceDescription} 
              />
            )}

                            {activeTab === 'avis' && (
                  <ModernReviewsSection reviews={reviews} rating={rating} reviewCount={reviewCount} />
                )}

                {activeTab === 'likes' && isOwnProfile && (
                  <LikedProfiles />
                )}

            {activeTab === 'likes' && isOwnProfile && (
              <LikedProfiles />
            )}
          </div>
        </div>
      </div>
      
      {/* Version Desktop */}
      <div className="hidden md:block">
        <main className="max-w-7xl mx-auto bg-white">
          {/* En-tête */}
          <ModernProfileHeader user={user} rating={rating} reviewCount={reviewCount} />
          
          {/* Layout desktop : images à gauche, contenu à droite */}
          <div className="md:grid md:grid-cols-3 md:gap-8 bg-white">
            {/* Colonne gauche : Galerie */}
            <div className="md:col-span-2 p-6 bg-white">
              <ModernGallery video={user.galleryVideo} images={user.galleryimages} />
            </div>
            
            {/* Colonne droite : Onglets et contenu */}
            <div className="md:col-span-1 bg-white">
              {/* Onglets */}
              <ModernTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwnProfile={user.id === userId} />
              
              {/* Contenu */}
              <div className="p-6 bg-white">
                {activeTab === 'informations' && (
                  <div className="space-y-6">
                    {/* Description */}
                    {user.bio && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-violet-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">À propos</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                      </div>
                    )}

                    {/* Informations pratiques */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Informations</h3>
                      </div>
                      <div className="space-y-3 text-gray-600">
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {(() => {
                              const createdDate = new Date(user.createdat);
                              const now = new Date();
                              const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
                              
                              if (monthsDiff < 1) {
                                return "Membre depuis moins d'un mois";
                              } else if (monthsDiff === 1) {
                                return "Membre depuis 1 mois";
                              } else {
                                return `Membre depuis ${monthsDiff} mois`;
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Réseaux sociaux */}
                    {user.social_links && user.social_links.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Réseaux sociaux</h3>
                        </div>
                        <div className="flex gap-3">
                          {user.social_links.map((url: string, i: number) => (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm transition-all duration-200 hover:scale-105 border border-gray-200"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {url.includes('linkedin') ? 'LinkedIn' : 
                               url.includes('youtube') ? 'YouTube' : 
                               url.includes('instagram') ? 'Instagram' : 
                               url.includes('soundcloud') ? 'SoundCloud' :
                               url.includes('spotify') ? 'Spotify' : 'Réseau'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'services' && (
                  <ServicesSection 
                    price={user.price} 
                    serviceDescription={user.serviceDescription} 
                  />
                )}

                {activeTab === 'avis' && (
                  <ModernReviewsSection reviews={reviews} rating={rating} reviewCount={reviewCount} />
                )}

                {activeTab === 'likes' && isOwnProfile && (
                  <LikedProfiles />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
      </div>
    </PageTransition>
  );
};

export default UserProfile; 