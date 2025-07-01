import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = localStorage.getItem('musiclinks_user');
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(user);
        
        // Vérifier si l'utilisateur est admin
        if (userData.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const requireAdmin = () => {
    if (loading) return; // En cours de chargement
    
    if (!isAdmin) {
      navigate('/');
      return false;
    }
    return true;
  };

  return {
    isAdmin,
    loading,
    requireAdmin
  };
}; 