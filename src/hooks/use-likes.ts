import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
}

interface UserWithLikeCount {
  id: string;
  name: string;
  profilepicture?: string;
  location?: string;
  role?: string;
  subcategory?: string;
  subCategory?: string;
  musicStyle?: string;
  rating?: number;
  reviewCount?: number;
  likeCount?: number;
}

export const useLikes = (targetUserId?: string) => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Récupérer l'utilisateur connecté
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('musiclinks_user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // Charger les likes et le compteur
  const loadLikes = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        setLikes([]);
        setIsLiked(false);
        setLikeCount(0);
        return;
      }

      // Récupérer tous les likes de l'utilisateur connecté
      const { data: userLikes, error: likesError } = await supabase
        .from('UserLikes')
        .select('*')
        .eq('fromUserId', currentUser.id);

      if (likesError) throw likesError;

      setLikes(userLikes || []);

      // Vérifier si le profil actuel est liké
      if (targetUserId) {
        const isProfileLiked = userLikes?.some(like => like.toUserId === targetUserId);
        setIsLiked(!!isProfileLiked);

        // Récupérer le nombre de likes reçus par le profil cible
        const { data: targetUser, error: userError } = await supabase
          .from('User')
          .select('likeCount')
          .eq('id', targetUserId)
          .single();

        if (!userError && targetUser) {
          setLikeCount(targetUser.likeCount || 0);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur lors du chargement des likes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un like
  const addLike = async (toUserId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return null;
      }

      const { data, error } = await supabase
        .from('UserLikes')
        .insert({
          fromUserId: currentUser.id,
          toUserId: toUserId,
        })
        .select()
        .single();

      if (error) throw error;

      setLikes(prev => [...prev, data]);
      if (targetUserId === toUserId) {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur lors de l\'ajout du like:', err);
      throw err;
    }
  };

  // Supprimer un like
  const removeLike = async (toUserId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return null;
      }

      const { error } = await supabase
        .from('UserLikes')
        .delete()
        .eq('fromUserId', currentUser.id)
        .eq('toUserId', toUserId);

      if (error) throw error;

      setLikes(prev => prev.filter(like => !(like.fromUserId === currentUser.id && like.toUserId === toUserId)));
      if (targetUserId === toUserId) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur lors de la suppression du like:', err);
      throw err;
    }
  };

  // Toggle like
  const toggleLike = async (toUserId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setShowLoginPopup(true);
        return;
      }

      const existingLike = likes.find(like => 
        like.fromUserId === currentUser.id && like.toUserId === toUserId
      );

      if (existingLike) {
        const result = await removeLike(toUserId);
        if (result === null) {
          setShowLoginPopup(true);
          return;
        }
      } else {
        const result = await addLike(toUserId);
        if (result === null) {
          setShowLoginPopup(true);
          return;
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du toggle like:', err);
      // Ne pas lancer l'erreur, juste afficher la popup
      setShowLoginPopup(true);
    }
  };

  // Récupérer les profils likés avec pagination
  const getLikedProfiles = async (page = 1, pageSize = 20) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return [];

      // Requête directe sans RPC - seulement les colonnes qui existent
      const { data: likedProfiles, error } = await supabase
        .from('UserLikes')
        .select(`
          toUserId,
          createdAt,
          toUser:User!UserLikes_toUserId_fkey (
            id,
            name,
            profilepicture,
            location,
            role,
            subCategory,
            musicStyle,
            likeCount
          )
        `)
        .eq('fromUserId', currentUser.id)
        .order('createdAt', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return likedProfiles?.map(item => ({
        ...item.toUser,
        likedAt: item.createdAt
      })) || [];
    } catch (err: any) {
      console.error('Erreur lors de la récupération des profils likés:', err);
      return [];
    }
  };

  // Récupérer les utilisateurs qui ont liké un profil
  const getUsersWhoLiked = async (targetUserId: string, page = 1, pageSize = 20) => {
    try {
      const { data, error } = await supabase
        .from('UserLikes')
        .select(`
          fromUserId,
          createdAt,
          fromUser:User!UserLikes_fromUserId_fkey (
            id,
            name,
            profilepicture,
            location,
            role,
            subCategory,
            musicStyle
          )
        `)
        .eq('toUserId', targetUserId)
        .order('createdAt', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      
      return data?.map(item => ({
        ...item.fromUser,
        likedAt: item.createdAt
      })) || [];
    } catch (err: any) {
      console.error('Erreur lors de la récupération des utilisateurs qui ont liké:', err);
      return [];
    }
  };

  useEffect(() => {
    loadLikes();
  }, [targetUserId]);

  return {
    likes,
    isLiked,
    likeCount,
    loading,
    error,
    showLoginPopup,
    setShowLoginPopup,
    addLike,
    removeLike,
    toggleLike,
    getLikedProfiles,
    getUsersWhoLiked,
    refreshLikes: loadLikes
  };
}; 