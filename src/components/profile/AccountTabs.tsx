import React from 'react';

interface AccountTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const TABS = [
  { label: 'Profil', value: 'profil' },
  { label: 'Activité', value: 'activite' },
  { label: 'Messages', value: 'messages' },
  { label: 'Likes', value: 'likes' },
];

export default function AccountTabs({ activeTab, setActiveTab, children }: AccountTabsProps) {
  return (
    <>
      <div className="flex justify-center mt-2 mb-4 md:mt-4 md:mb-8">
        <div className="bg-white rounded-full shadow p-1 md:p-2 flex">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={`px-5 py-2 md:px-8 md:py-3 text-base md:text-lg font-semibold rounded-full transition-colors ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div>{children}</div>
    </>
  );
} 