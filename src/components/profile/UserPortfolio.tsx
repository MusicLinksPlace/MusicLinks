import React from 'react';
import { Link } from 'lucide-react';

const UserPortfolio = ({ url }) => {
  if (!url) {
    return null;
  }

  return (
    <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h3>
         <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            <Link className="w-4 h-4" />
            <span>Voir le portfolio</span>
        </a>
    </div>
  );
};

export default UserPortfolio; 