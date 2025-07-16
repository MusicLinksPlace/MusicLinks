import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { getImageUrlWithCacheBust } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  profilepicture?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  user: User;
  lastMessage: Message;
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const userStr = localStorage.getItem('musiclinks_user');
      if (!userStr) return;
      const currentUser = JSON.parse(userStr);
      // Récupérer tous les messages où je suis sender ou receiver
      const { data: messages, error } = await supabase
        .from('Message')
        .select('id, senderId, receiverId, content, createdAt')
        .or(`senderId.eq.${currentUser.id},receiverId.eq.${currentUser.id}`)
        .order('createdAt', { ascending: false });
      if (error) {
        setLoading(false);
        return;
      }
      // Grouper par l'autre utilisateur
      const convMap = new Map<string, Conversation>();
      for (const msg of messages) {
        const otherId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, { user: { id: otherId, name: '', profilepicture: '' }, lastMessage: msg });
        }
      }
      // Récupérer les infos des autres users
      const otherIds = Array.from(convMap.keys());
      if (otherIds.length > 0) {
        const { data: users } = await supabase
          .from('User')
          .select('id, name, profilepicture')
          .in('id', otherIds);
        users?.forEach((u: User) => {
          if (convMap.has(u.id)) convMap.get(u.id)!.user = u;
        });
      }
      setConversations(Array.from(convMap.values()));
      setLoading(false);
    };
    fetchConversations();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Chargement des conversations…</div>;
  if (conversations.length === 0) return <div className="text-center py-8 text-gray-500">Aucune conversation pour le moment.</div>;

  return (
    <div className="space-y-3">
      {conversations.map(conv => (
        <div
          key={conv.user.id}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 transition-colors"
          onClick={() => navigate(`/chat?userId=${conv.user.id}`)}
        >
          <div className="relative">
            <img src={getImageUrlWithCacheBust(conv.user.profilepicture)} alt={conv.user.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-gray-900 truncate">{conv.user.name}</div>
              <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {new Date(conv.lastMessage.createdAt).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="text-gray-600 text-sm truncate">
              {conv.lastMessage.content.length > 50 
                ? `${conv.lastMessage.content.substring(0, 50)}...` 
                : conv.lastMessage.content
              }
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 