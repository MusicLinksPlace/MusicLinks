import React from 'react';

const UserAboutSection = ({ bio }) => {
  return (
    <div className="bg-white px-6 pb-6">
      <p className="text-gray-700 whitespace-pre-wrap">
        {bio || "Aucune biographie disponible."}
      </p>
    </div>
  );
};

export default UserAboutSection; 