import React, { useState } from 'react';
import AccountTabs from '@/components/profile/AccountTabs';
import ConversationList from '@/components/profile/ConversationList';

export default function PartnerAccountSettings() {
  const [activeTab, setActiveTab] = useState<'profil' | 'activite' | 'messages'>('profil');
  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <AccountTabs activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as 'profil' | 'activite' | 'messages')}>
          {activeTab === 'profil' && (
            <div className="bg-white rounded-2xl shadow-xl flex flex-col p-6 gap-8">
              <h1 className="text-2xl font-bold text-gray-800">Mon Compte Partenaire Stratégique</h1>
              {/* Ajoute ici les champs spécifiques partenaire */}
            </div>
          )}
          {activeTab === 'activite' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-gray-400">Historique d'activité à venir…</div>
          )}
          {activeTab === 'messages' && (
            <ConversationList />
          )}
        </AccountTabs>
      </div>
    </div>
  );
} 