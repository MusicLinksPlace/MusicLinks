import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrlWithCacheBust(imageUrl: string | null | undefined, fallbackUrl: string = '/placeholder.svg'): string {
  if (!imageUrl) return fallbackUrl;
  
  // Si c'est une image locale (placeholder), pas besoin de cache-busting
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Ajouter un paramètre de cache-busting basé sur le timestamp
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}v=${Date.now()}`;
}
