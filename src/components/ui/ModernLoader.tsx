import React from 'react';
import { cn } from '@/lib/utils';

interface ModernLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  size = 'md', 
  className,
  text = "Chargement..."
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Animated circles */}
      <div className="relative">
        <div className={cn(
          "rounded-full border-2 border-gray-200",
          sizeClasses[size]
        )}>
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin",
            sizeClasses[size]
          )} />
        </div>
        
        {/* Pulse effect */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-blue-600/20 animate-ping",
          sizeClasses[size]
        )} />
      </div>
      
      {/* Text */}
      {text && (
        <p className="mt-4 text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton loader for content
export const ModernSkeleton = ({ 
  className,
  lines = 1,
  height = 'h-4'
}: {
  className?: string;
  lines?: number;
  height?: string;
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md animate-pulse",
            height
          )}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      ))}
    </div>
  );
};

// Page transition loader
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Main logo animation */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        
        <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
      </div>
    </div>
  );
};

export default ModernLoader; 