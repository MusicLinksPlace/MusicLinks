import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSafeNavigation = () => {
  const navigate = useNavigate();
  const isNavigating = useRef(false);

  const safeNavigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (isNavigating.current) {
      console.log('🔄 Navigation already in progress, skipping:', to);
      return;
    }

    isNavigating.current = true;
    console.log('🧭 Safe navigation to:', to);

    // Reset the flag after a short delay
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);

    navigate(to, options);
  }, [navigate]);

  return safeNavigate;
}; 