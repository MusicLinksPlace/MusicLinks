import React from 'react';
import { Badge } from '@/components/ui/badge';

const UserTags = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Ensure tags is an array
  const tagsArray = Array.isArray(tags) ? tags : String(tags).split(',').map(tag => tag.trim());

  return (
    <div className="bg-white px-6 pb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Spécialités</h3>
      <div className="flex flex-wrap gap-2">
        {tagsArray.map((tag, index) => (
          <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 hover:bg-gray-200">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default UserTags; 