import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    <div className="divide-y rounded-lg bg-white shadow">
      {conversations.map(conv => (
        <div
          key={conv.user.id}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => navigate(`/chat?userId=${conv.user.id}`)}
        >
          <img src={conv.user.profilepicture || '/placeholder.svg'} alt={conv.user.name} className="w-12 h-12 rounded-full object-cover" />
          <div className="flex-1">
            <div className="font-medium">{conv.user.name}</div>
            <div className="text-gray-500 text-sm truncate max-w-xs">{conv.lastMessage.content}</div>
          </div>
          <div className="text-xs text-gray-400 min-w-[80px] text-right">
            {new Date(conv.lastMessage.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  );
} 