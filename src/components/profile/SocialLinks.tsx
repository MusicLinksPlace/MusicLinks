import React from 'react';
import { Link } from 'lucide-react';

const socialIconMap = {
  instagram: '/social-media/instagram.png',
  youtube: '/social-media/youtube.png',
  soundcloud: '/social-media/soundcloud.png',
  linkedin: '/social-media/linkedin.png',
  tiktok: '/social-media/tiktok.png',
  snapchat: '/social-media/snapchat.png',
  pinterest: '/social-media/pinterest.png',
  x: '/social-media/x.png',
  twitter: '/social-media/x.png',
  facebook: '/social-media/facebook.png',
};

const SocialLinks = ({ user }) => {
  const { social_links } = user;

  if (!social_links || social_links.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Réseaux Sociaux</h3>
      <div className="flex flex-wrap gap-4 items-center">
        {social_links.map((url, index) => {
          const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
          const iconSrc = socialIconMap[domain];

          if (!iconSrc) {
            return (
              <a href={url} key={index} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                <Link className="h-6 w-6" />
              </a>
            );
          }
          
          return (
            <a href={url} key={index} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
              <img src={iconSrc} alt={domain} className="h-8 w-8 object-contain drop-shadow-sm" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinks; 