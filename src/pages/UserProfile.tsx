import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import UserProfileHeader from '@/components/profile/UserProfileHeader';
import UserAboutSection from '@/components/profile/UserAboutSection';
import FAQSection from '@/components/profile/FAQSection';
import UserTags from '@/components/profile/UserTags';
import SocialLinks from '@/components/profile/SocialLinks';
import UserPortfolio from '@/components/profile/UserPortfolio';
import { Button } from '@/components/ui/button';

// Define a more detailed User type for the profile page
interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  subCategory?: string | null;
  location?: string | null;
  bio?: string | null;
  profilepicture?: string | null;
  galleryimages?: string[] | null;
  portfolio_url?: string | null;
  social_links?: string[] | null;
  created_at: string;
  skills?: string[] | null;
  musicStyle?: string | null;
}

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          .select('*, musicStyle')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data) setUser(data);
        else setError('User not found.');

      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="flex justify-center items-center h-screen">Chargement du profil...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Erreur: {error}</div>;
  if (!user) return <div className="text-center py-10">Utilisateur non trouvé.</div>;

  const faqItems = [
    { question: "Au bout de combien de temps aurai-je une réponse ?", answer: "Je m'efforce de répondre à toutes les demandes en moins de 24 heures." },
    { question: "Quels types de projets acceptez-vous ?", answer: "Je suis ouvert à tous types de projets musicaux, du mixage de singles au mastering d'albums complets. N'hésitez pas à me contacter pour discuter de vos besoins." },
    { question: "Comment se déroule une collaboration ?", answer: "Après un premier contact pour définir votre projet, vous m'envoyez vos fichiers. Je vous livre ensuite une première version pour écoute, et nous ajustons ensemble jusqu'à obtenir le résultat parfait." }
  ];

  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col">
          <UserProfileHeader user={user} />
          <UserAboutSection bio={user.bio} />
          
          <div className="px-6 pb-6 flex flex-col gap-6">
            <UserTags tags={user.skills} />
            <UserPortfolio url={user.portfolio_url} />
            <SocialLinks user={user} />

            <div className="mt-2 flex flex-col gap-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">Contacter</Button>
            </div>
          </div>
          <FAQSection items={faqItems} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 