import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Petit délai pour permettre au DOM de se stabiliser
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
};

// Composant pour les animations d'entrée séquentielles
export const StaggeredAnimation: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-600 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-6 scale-95",
        className
      )}
    >
      {children}
    </div>
  );
};

// Composant pour les animations de hover
export const HoverAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
  scale?: boolean;
  lift?: boolean;
}> = ({ children, className, scale = true, lift = true }) => {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        scale && "hover:scale-105",
        lift && "hover:-translate-y-1",
        "hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageTransition; 