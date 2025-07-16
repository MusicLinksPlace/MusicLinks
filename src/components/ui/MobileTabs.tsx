import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';

interface MobileTabsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export default function MobileTabs({ activeTab, setActiveTab, tabs }: MobileTabsProps) {
  return (
    <div className="md:hidden">
      {/* Toggle principal */}
      <div className="flex justify-center mt-2 mb-4">
        <div className="bg-white rounded-full shadow p-1 w-full max-w-sm">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-semibold rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 