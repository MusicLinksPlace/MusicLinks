import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Using `document.documentElement.scrollTo` is often more reliable,
    // especially in complex layouts with sticky or fixed elements.
    // It ensures we scroll the main document container to the very top.
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Use 'auto' or 'instant' for immediate scrolling
    });
  }, [pathname]);

  return null; // This component does not render anything
};

export default ScrollToTop; 