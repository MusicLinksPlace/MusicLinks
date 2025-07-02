import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, MessageCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';

// Composants à créer (stubs pour l'instant)
const ProfileGalleryCarousel = ({ video, images }: { video?: string, images?: string[] }) => {
  const [current, setCurrent] = React.useState(0);
  const slides = [
    ...(video ? [{ type: 'video', url: video }] : []),
    ...(images ? images.map(url => ({ type: 'image', url })) : [])
  ];
  if (slides.length === 0) return null;
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
        {slides[current].type === 'video' ? (
          <video controls poster={images && images[0]} className="w-full h-full object-cover rounded-2xl">
            <source src={slides[current].url} />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        ) : (
          <img src={slides[current].url} alt="media" className="w-full h-full object-cover rounded-2xl" />
        )}
        {/* Flèches */}
        {slides.length > 1 && (
          <>
            <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-2 z-10">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setCurrent((current + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-2 z-10">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
        {/* Play icon overlay for video (if not playing) */}
        {slides[current].type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-4">
              <Play className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        )}
      </div>
      {/* Miniatures */}
      {slides.length > 1 && (
        <div className="flex gap-2 mt-3 justify-center">
          {slides.map((slide, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`rounded-lg overflow-hidden border-2 ${i === current ? 'border-blue-500' : 'border-transparent'} focus:outline-none`}>
              {slide.type === 'video' ? (
                <div className="relative w-20 h-12 bg-gray-200 flex items-center justify-center">
                  <Play className="w-6 h-6 text-blue-500 opacity-80" />
                </div>
              ) : (
                <img src={slide.url} alt="miniature" className="w-20 h-12 object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileHeader = ({ user, rating, reviewCount }: any) => (
  <div className="w-full bg-gradient-to-br from-blue-100 to-indigo-100 pb-8 pt-0 md:pt-4">
    {/* Cover + Avatar overlay + Infos principales */}
    <div className="w-full h-40 md:h-56 bg-blue-200 relative flex items-end justify-center">
      {/* Avatar overlay */}
      <div className="absolute left-1/2 -bottom-20 md:-bottom-24 -translate-x-1/2 z-10">
        <img src={user.profilepicture || '/placeholder.svg'} alt={user.name} className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg object-cover" />
      </div>
    </div>
    <div className="mt-28 md:mt-36 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
      <div className="flex items-center gap-2 mt-2">
        {user.location && <span className="flex items-center gap-1 text-gray-500 text-sm"><span className="text-lg">📍</span>{user.location}</span>}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="flex items-center gap-1 text-yellow-500 font-bold text-lg">⭐ {typeof rating === 'number' ? rating.toFixed(1) : '—'}/5</span>
        <span className="text-gray-400 text-sm">({reviewCount ?? 0} avis)</span>
      </div>
      {user.bio && <p className="mt-3 text-gray-700 text-center max-w-xl text-base">{user.bio}</p>}
    </div>
  </div>
);

const ProfileTabs = ({ activeTab, setActiveTab }: any) => (
  <div className="flex justify-center mt-8 mb-6 gap-2">
    <button onClick={() => setActiveTab('presentation')} className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'presentation' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'}`}>Présentation</button>
    <button onClick={() => setActiveTab('avis')} className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'avis' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'}`}>Avis</button>
  </div>
);

const ReviewCard = ({ review }: any) => (
  <div className="bg-white rounded-xl shadow p-4 flex gap-4 items-start mb-4">
    <img src={review.reviewerAvatar || '/placeholder.svg'} alt={review.reviewerName} className="w-10 h-10 rounded-full object-cover" />
    <div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{review.reviewerName}</span>
        <span className="text-yellow-500 font-bold">⭐ {review.rating}</span>
        <span className="text-gray-400 text-xs">{review.date}</span>
      </div>
      <p className="text-gray-700 mt-1">{review.comment}</p>
    </div>
  </div>
);

const StatsBar = ({ stats }: any) => (
  <div className="w-full max-w-md mx-auto mb-6">
    {/* Histogramme étoiles (à remplir plus tard) */}
    <div className="h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Histogramme étoiles</div>
  </div>
);

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'presentation' | 'avis'>('presentation');
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
      } catch (err) {
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

  if (loading) return <div className="flex justify-center items-center h-screen">Chargement du profil...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Erreur: {error}</div>;
  if (!user) return <div className="text-center py-10">Utilisateur non trouvé.</div>;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">
        <ProfileHeader user={user} rating={rating} reviewCount={reviewCount} />
        <div className="w-full max-w-2xl mx-auto">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="px-6 pb-8">
            {activeTab === 'presentation' && (
              <div className="space-y-6 animate-fade-in">
                {/* Style musical en français */}
                {user.musicStyle && (
                  <div className="text-gray-700 text-base font-medium">
                    <span className="font-semibold">Style musical :</span> {CATEGORY_TRANSLATIONS[user.musicStyle] || user.musicStyle}
                  </div>
                )}
                {/* Description courte */}
                {user.bio && <p className="text-gray-700 text-base">{user.bio}</p>}
                {/* Galerie Fiverr */}
                <ProfileGalleryCarousel video={user.galleryVideo} images={user.galleryimages} />
                {/* Portfolio */}
                {user.portfolio_url && (
                  <div>
                    <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Voir le portfolio</a>
                  </div>
                )}
                {/* Réseaux sociaux */}
                {user.social_links && user.social_links.length > 0 && (
                  <div className="flex gap-4 items-center">
                    {user.social_links.filter((url: string) => url.includes('linkedin') || url.includes('youtube')).map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-blue-700 hover:bg-blue-50 font-medium text-sm">
                        {url.includes('linkedin') ? 'LinkedIn' : url.includes('youtube') ? 'YouTube' : 'Réseau'}
                      </a>
                    ))}
                  </div>
                )}
                {/* Bouton contacter */}
                <Button 
                  onClick={handleContact}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 flex items-center justify-center gap-2 rounded-full shadow-md"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contacter {user.name}
                </Button>
              </div>
            )}
            {activeTab === 'avis' && (
              <div className="animate-fade-in">
                <div className="flex flex-col items-center mb-6">
                  <span className="text-3xl font-bold text-yellow-500">{typeof rating === 'number' ? rating.toFixed(1) : '—'}/5</span>
                  <span className="text-gray-400 text-sm">{reviewCount} avis</span>
                </div>
                {reviews.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">Pas encore d'avis pour ce profil.</div>
                ) : (
                  reviews.map((review: any) => (
                    <ReviewCard
                      key={review.id}
                      review={{
                        reviewerAvatar: review.fromUserid?.profilepicture,
                        reviewerName: review.fromUserid?.name,
                        rating: review.rating,
                        comment: review.comment,
                        date: new Date(review.createdat).toLocaleDateString('fr-FR'),
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile; 