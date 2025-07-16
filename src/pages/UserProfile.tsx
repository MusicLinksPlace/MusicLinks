import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  MessageCircle, 
  Play, 
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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import ContactButton from '@/components/ContactButton';

// Composant de galerie moderne pour desktop/mobile
const ModernGallery = ({ video, images }: { video?: string, images?: string[] }) => {
  const [current, setCurrent] = useState(0);
  
  const slides = [
    ...(video ? [{ type: 'video', url: video }] : []),
    ...(images ? images.map(url => ({ type: 'image', url })) : [])
  ];
  
  if (slides.length === 0) return null;

  const nextSlide = () => setCurrent((current + 1) % slides.length);
  const prevSlide = () => setCurrent((current - 1 + slides.length) % slides.length);

  // Desktop: grille de photos comme dans l'exemple
  if (slides.length > 1) {
    return (
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4">
          {/* Photo principale - plus grande */}
          <div className="col-span-2 aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden relative">
            {slides[current].type === 'video' ? (
              <video 
                controls 
                poster={images && images[0]} 
                className="w-full h-full object-cover"
              >
                <source src={slides[current].url} />
                Votre navigateur ne supporte pas la vidéo.
              </video>
            ) : (
              <img 
                src={slides[current].url} 
                alt="media" 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay pour vidéo */}
            {slides[current].type === 'video' && (
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-full p-2">
                <Play className="w-6 h-6 text-gray-800" />
              </div>
            )}

            {/* Navigation */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Miniatures en colonne */}
          <div className="space-y-4">
            {slides.slice(0, 3).map((slide, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                  i === current ? 'border-gray-800' : 'border-transparent'
                }`}
              >
                {slide.type === 'video' ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Play className="w-5 h-5 text-gray-600" />
                  </div>
                ) : (
                  <img src={slide.url} alt="miniature" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Image du bas qui span toute la largeur */}
        {slides.length > 4 && (
          <div className="mt-4 aspect-[3/1] bg-gray-900 rounded-2xl overflow-hidden relative">
            <img src={slides[4].url} alt="media" className="w-full h-full object-cover" />
            {/* Boutons de navigation */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                Voir Vidéos {slides.filter(s => s.type === 'video').length}
              </button>
              <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                Voir Photos {slides.filter(s => s.type === 'image').length}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile: slider simple
  return (
    <div className="md:hidden">
      <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden">
        {slides[current].type === 'video' ? (
          <video 
            controls 
            poster={images && images[0]} 
            className="w-full h-full object-cover"
          >
            <source src={slides[current].url} />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        ) : (
          <img 
            src={slides[current].url} 
            alt="media" 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay pour vidéo */}
        {slides[current].type === 'video' && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 rounded-full p-4">
              <Play className="w-8 h-8 text-gray-800" />
            </div>
          </div>
        )}

        {/* Navigation mobile */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Indicateurs mobile */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
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
      <div className="relative w-full aspect-[4/3] bg-gray-900">
        {slides[current].type === 'video' ? (
          <video 
            controls 
            poster={images && images[0]} 
            className="w-full h-full object-cover"
          >
            <source src={slides[current].url} />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        ) : (
          <img 
            src={slides[current].url} 
            alt="media" 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay pour vidéo */}
        {slides[current].type === 'video' && (
          <div className="absolute bottom-4 left-4 bg-white/90 rounded-full p-2">
            <Play className="w-6 h-6 text-gray-800" />
          </div>
        )}

        {/* Navigation */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
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

// En-tête de profil moderne sans banner bleu
const ModernProfileHeader = ({ user, rating, reviewCount }: any) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div className="relative">
      {/* Navigation mobile */}
      <div className="md:hidden absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button 
          onClick={() => window.history.back()}
          className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenu principal - design moderne */}
      <div className="bg-white px-6 pt-6 pb-8">
        {/* Photo de profil et infos de base */}
        <div className="flex items-start gap-6 mb-8">
          <img 
            src={getImageUrlWithCacheBust(user.profilepicture)} 
            alt={user.name} 
            className="w-24 h-24 rounded-2xl object-cover border border-gray-200"
          />
          
          <div className="flex-1">
            {/* Nom et note */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${
                          star <= (rating || 0) ? 'text-gray-900 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="font-semibold text-lg ml-1">
                      {typeof rating === 'number' ? rating.toFixed(1) : '—'}
                    </span>
                    <span className="text-gray-600">Excellent</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {reviewCount} avis
                  </span>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-all">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Localisation */}
            {user.location && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-lg">{user.location}</span>
              </div>
            )}

            {/* Tarif */}
            {user.price && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-xl font-semibold text-gray-900">
                  <Euro className="w-5 h-5" />
                  Tarif à partir de {user.price}€
                </div>
              </div>
            )}

            {/* Bouton de contact */}
            <ContactButton 
              userId={user.id} 
              userName={user.name} 
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// En-tête mobile style Mariages.net
const MobileProfileHeader = ({ user, rating, reviewCount }: any) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div className="md:hidden bg-white">
      {/* Section nom et note */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {user.name}
        </h1>
        
        {/* Note et avis */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${
                  star <= (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="font-semibold text-lg ml-1">
              {typeof rating === 'number' ? rating.toFixed(1) : '—'}
            </span>
            <span className="text-gray-600">Excellent</span>
          </div>
          <span className="text-gray-900 font-medium">
            {reviewCount} Avis
          </span>
        </div>

        {/* Localisation */}
        {user.location && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-base">{user.location}</span>
          </div>
        )}

        {/* Tarif */}
        {user.price && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              <Euro className="w-4 h-4" />
              Tarif à partir de {user.price}€
            </div>
          </div>
        )}

        {/* Bouton de contact */}
        <ContactButton 
          userId={user.id} 
          userName={user.name} 
          size="lg"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold"
        />
      </div>
    </div>
  );
};

// Onglets modernes
const ModernTabs = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: 'informations', label: 'Informations' },
    { id: 'faq', label: 'FAQ' },
    { id: 'avis', label: 'Avis' }
  ];

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-4 font-medium whitespace-nowrap border-b-2 transition-colors text-sm md:text-base ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Section avis moderne style Airbnb
const ModernReviewsSection = ({ reviews, rating, reviewCount }: any) => {
  const distributionData = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter((r: any) => Math.floor(r.rating) === stars).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="space-y-8">
      {/* Résumé des notes - Design moderne style Airbnb */}
      <div className="border border-gray-200 rounded-2xl p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Note globale */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {typeof rating === 'number' ? rating.toFixed(1) : '—'}
            </div>
            <div className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${
                    star <= (rating || 0) ? 'text-gray-900 fill-current' : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <p className="text-gray-600">{reviewCount} avis</p>
          </div>

          {/* Distribution des notes */}
          <div className="space-y-3">
            {distributionData.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8 text-gray-900">{item.stars}</span>
                <Star className="w-4 h-4 text-gray-900 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-900 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des avis - Design moderne */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Pas encore d'avis pour ce profil.
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex gap-4">
                <img 
                  src={review.fromUserid?.profilepicture || '/placeholder.svg'} 
                  alt={review.fromUserid?.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {review.fromUserid?.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'text-gray-900 fill-current' : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdat).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
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
  const [activeTab, setActiveTab] = useState<'informations' | 'faq' | 'avis'>('informations');
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-lg">Chargement du profil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-10 text-red-500">Erreur: {error}</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-10">Utilisateur non trouvé.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      {/* Version Mobile */}
      <div className="md:hidden">
        {/* Galerie mobile en haut */}
        <MobileGallery video={user.galleryVideo} images={user.galleryimages} />
        
        {/* En-tête mobile */}
        <MobileProfileHeader user={user} rating={rating} reviewCount={reviewCount} />
        
        {/* Onglets mobile */}
        <div className="bg-white">
          <ModernTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Contenu mobile */}
          <div className="p-6 pb-8">
            {activeTab === 'informations' && (
              <div className="space-y-8">
                {/* Description */}
                {user.bio && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">À propos</h3>
                    <p className="text-gray-700 leading-relaxed text-base">{user.bio}</p>
                  </div>
                )}

                {/* Informations pratiques */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Informations</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-base">
                        {(() => {
                          const createdDate = new Date(user.created_at);
                          const now = new Date();
                          const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
                          
                          if (monthsDiff < 1) {
                            return "Sur MusicLinks depuis moins d'un mois";
                          } else if (monthsDiff === 1) {
                            return "Sur MusicLinks depuis 1 mois";
                          } else {
                            return `Sur MusicLinks depuis ${monthsDiff} mois`;
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                {user.social_links && user.social_links.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Réseaux sociaux</h3>
                    <div className="flex flex-wrap gap-3">
                      {user.social_links.map((url: string, i: number) => (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 font-medium text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {url.includes('linkedin') ? 'LinkedIn' : 
                           url.includes('youtube') ? 'YouTube' : 
                           url.includes('instagram') ? 'Instagram' : 'Réseau'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Questions fréquentes</h3>
                <div className="text-gray-600 text-base">
                  Aucune question fréquente n'a encore été configurée pour ce profil.
                </div>
              </div>
            )}

            {activeTab === 'avis' && (
              <ModernReviewsSection reviews={reviews} rating={rating} reviewCount={reviewCount} />
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
          <div className="md:grid md:grid-cols-3 md:gap-8">
            {/* Colonne gauche : Galerie */}
            <div className="md:col-span-2 p-6">
              <ModernGallery video={user.galleryVideo} images={user.galleryimages} />
            </div>
            
            {/* Colonne droite : Onglets et contenu */}
            <div className="md:col-span-1">
              {/* Onglets */}
              <ModernTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Contenu */}
              <div className="p-6">
                {activeTab === 'informations' && (
                  <div className="space-y-8">
                    {/* Description */}
                    {user.bio && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">À propos</h3>
                        <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                      </div>
                    )}

                    {/* Informations pratiques */}
                    <div>
                      <h3 className="text-xl font-bold mb-4">Informations</h3>
                      <div className="space-y-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {(() => {
                              const createdDate = new Date(user.created_at);
                              const now = new Date();
                              const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
                              
                              if (monthsDiff < 1) {
                                return "Sur MusicLinks depuis moins d'un mois";
                              } else if (monthsDiff === 1) {
                                return "Sur MusicLinks depuis 1 mois";
                              } else {
                                return `Sur MusicLinks depuis ${monthsDiff} mois`;
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Réseaux sociaux */}
                    {user.social_links && user.social_links.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Réseaux sociaux</h3>
                        <div className="flex gap-3">
                          {user.social_links.map((url: string, i: number) => (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 font-medium text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {url.includes('linkedin') ? 'LinkedIn' : 
                               url.includes('youtube') ? 'YouTube' : 
                               url.includes('instagram') ? 'Instagram' : 'Réseau'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Questions fréquentes</h3>
                    <div className="text-gray-600">
                      Aucune question fréquente n'a encore été configurée pour ce profil.
                    </div>
                  </div>
                )}

                {activeTab === 'avis' && (
                  <ModernReviewsSection reviews={reviews} rating={rating} reviewCount={reviewCount} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfile; 