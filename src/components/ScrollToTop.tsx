import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    
    // Clear any hash from URL
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    // Log navigation for debugging
    console.log('🔄 Navigation to:', pathname);
  }, [pathname]);

  return null;
};

export default ScrollToTop; 