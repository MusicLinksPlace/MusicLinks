import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { Loader2, Send, ArrowLeft, Search, Paperclip, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    profilepicture: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    name: string;
    profilepicture: string;
  };
  attachmentType?: string;
  attachmentUrl?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll automatique quand les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const storedUser = localStorage.getItem('musiclinks_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
  }, [navigate]);

  // Vérifier si un userId est passé en paramètre (pour le bouton "Contacter")
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [searchParams]);

  // Charger les conversations
  const loadConversations = async () => {
    try {
      // Récupérer toutes les conversations où l'utilisateur est impliqué
      const { data: conversationsData, error } = await supabase
        .from('Message')
        .select(`
          id,
          senderId,
          receiverId,
          content,
          createdAt
        `)
        .or(`senderId.eq.${currentUser.id},receiverId.eq.${currentUser.id}`)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      // Grouper par conversation et créer la liste
      const conversationMap = new Map<string, Conversation>();
      // Récupérer les informations des utilisateurs séparément
      const userIds = new Set<string>();
      conversationsData?.forEach((msg: any) => {
        const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        userIds.add(otherUserId);
      });
      // Récupérer les profils des utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('User')
        .select('id, name, profilepicture')
        .in('id', Array.from(userIds));
      if (usersError) throw usersError;
      const usersMap = new Map();
      usersData?.forEach((user: any) => {
        usersMap.set(user.id, user);
      });
      conversationsData?.forEach((msg: any) => {
        const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        const otherUser = usersMap.get(otherUserId);
        if (!conversationMap.has(otherUserId) && otherUser) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            otherUser: {
              id: otherUserId,
              name: otherUser.name,
              profilepicture: otherUser.profilepicture
            },
            lastMessage: {
              content: msg.content,
              createdAt: msg.createdAt,
              senderId: msg.senderId
            },
            unreadCount: 0 // TODO: implémenter le compteur de messages non lus
          });
        }
      });
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({ title: "Erreur", description: "Impossible de charger les conversations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async () => {
    if (!selectedUserId || !currentUser) return;
    try {
      const { data: messagesData, error } = await supabase
        .from('Message')
        .select(`
          id,
          content,
          senderId,
          receiverId,
          createdAt,
          attachmentUrl,
          attachmentType
        `)
        .or(`and(senderId.eq.${currentUser.id},receiverId.eq.${selectedUserId}),and(senderId.eq.${selectedUserId},receiverId.eq.${currentUser.id})`)
        .order('createdAt', { ascending: true });
      if (error) throw error;
      // Récupérer les informations des expéditeurs
      const senderIds = [...new Set(messagesData?.map((msg: any) => msg.senderId) || [])];
      const { data: sendersData, error: sendersError } = await supabase
        .from('User')
        .select('id, name, profilepicture')
        .in('id', senderIds);
      if (sendersError) throw sendersError;
      const sendersMap = new Map();
      sendersData?.forEach((sender: any) => {
        sendersMap.set(sender.id, sender);
      });
      // Transformer les données pour correspondre au type Message
      const transformedMessages = messagesData?.map((msg: any) => {
        const sender = sendersMap.get(msg.senderId);
        return {
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          createdAt: msg.createdAt,
          sender: {
            name: sender?.name || '',
            profilepicture: sender?.profilepicture || ''
          },
          attachmentUrl: msg.attachmentUrl,
          attachmentType: msg.attachmentType,
        };
      }) || [];
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({ title: "Erreur", description: "Impossible de charger les messages.", variant: "destructive" });
    }
  };

  // Charger les conversations
  useEffect(() => {
    if (!currentUser) return;
    loadConversations();
  }, [currentUser, toast]);

  // Charger les messages d'une conversation
  useEffect(() => {
    if (!selectedUserId || !currentUser) return;
    loadMessages();
    // Écouter tous les nouveaux messages en temps réel
    const channel = supabase
      .channel('messages-realtime-global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
      }, (payload) => {
        console.log('REALTIME PAYLOAD', payload);
        const newMessage = payload.new;
        // N'ajoute que si le message concerne la conversation courante
        if (
          (newMessage.senderId === currentUser.id && newMessage.receiverId === selectedUserId) ||
          (newMessage.senderId === selectedUserId && newMessage.receiverId === currentUser.id)
        ) {
          console.log('REALTIME MATCH', newMessage);
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            const formattedMessage: Message = {
              id: newMessage.id,
              content: newMessage.content,
              senderId: newMessage.senderId,
              receiverId: newMessage.receiverId,
              createdAt: newMessage.createdAt,
              sender: prev.find(m => m.senderId === newMessage.senderId)?.sender || { name: '', profilepicture: '' },
              attachmentUrl: newMessage.attachmentUrl,
              attachmentType: newMessage.attachmentType,
            };
            return [...prev, formattedMessage];
          });
        } else {
          console.log('REALTIME IGNORED', newMessage);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId, currentUser, toast]);

  // Charger le profil de l'autre utilisateur à chaque changement de selectedUserId
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!selectedUserId) return setOtherUser(null);
      const { data, error } = await supabase
        .from('User')
        .select('id, name, profilepicture')
        .eq('id', selectedUserId)
        .single();
      if (!error && data) setOtherUser(data);
      else setOtherUser(null);
    };
    fetchOtherUser();
  }, [selectedUserId]);

  // --- REALTIME GLOBAL ---
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel('messages-global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
      }, (payload) => {
        // Rafraîchir conversations
        loadConversations();
        // Si la conversation ouverte est concernée, rafraîchir les messages
        const msg = payload.new;
        if (
          (msg.senderId === currentUser.id && msg.receiverId === selectedUserId) ||
          (msg.senderId === selectedUserId && msg.receiverId === currentUser.id)
        ) {
          loadMessages();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser, selectedUserId]);

  useEffect(() => {
    console.log('Current user:', currentUser);
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Envoi de message : optimistic update
  const sendMessage = async () => {
    let attachmentUrl = null;
    let attachmentType = null;

    if (selectedFile) {
      // Upload du fichier
      const ext = selectedFile.name.split('.').pop();
      const type = selectedFile.type.startsWith('image')
        ? 'image'
        : selectedFile.type.startsWith('audio')
        ? 'audio'
        : selectedFile.type.startsWith('video')
        ? 'video'
        : 'file';
      const filePath = `chat-uploads/${currentUser.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-uploads')
        .upload(filePath, selectedFile, { upsert: true });
      if (uploadError) {
        toast({ title: 'Erreur', description: 'Upload échoué.', variant: 'destructive' });
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('chat-uploads').getPublicUrl(filePath);
      attachmentUrl = publicUrl;
      attachmentType = type;
    }

    // Optimistic update : ajoute le message localement tout de suite
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      content: newMessage,
      senderId: currentUser.id,
      receiverId: selectedUserId,
      createdAt: new Date().toISOString(),
      sender: {
        name: currentUser.name || '',
        profilepicture: currentUser.profilepicture || ''
      },
      attachmentUrl: attachmentUrl || undefined,
      attachmentType: attachmentType || undefined,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    // Insertion du message
    await supabase.from('Message').insert({
      senderId: currentUser.id,
      receiverId: selectedUserId,
      content: newMessage,
      attachmentUrl,
      attachmentType,
    });

    setNewMessage('');
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ajoute un useEffect pour scroll auto vers le bas à chaque changement de messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Header />
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mt-20" />
        <p className="mt-4">Chargement des conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* MOBILE :
        - Si mobile & PAS de conversation sélectionnée => header principal + liste des conversations
        - Si mobile & conversation sélectionnée => header du chat uniquement
        DESKTOP :
        - Toujours header principal
      */}
      {(!isMobile || !selectedUserId) && <Header />}
      <div className="flex flex-1 h-full">
        {/* Colonne gauche (sidebar/messages) */}
        {/* Sur mobile, si une conversation est sélectionnée, cache la colonne gauche */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col overflow-hidden ${selectedUserId && isMobile ? 'hidden' : 'block'}`}>
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Aucune conversation</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedUserId(conversation.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={conversation.otherUser.profilepicture || '/placeholder.svg'}
                      alt={conversation.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.senderId === currentUser?.id ? 'Vous: ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Colonne droite (chat) */}
        {selectedUserId && (
          <div className="flex flex-col w-full md:w-2/3 bg-white">
            {/* Header du chat - fixé en haut */}
            <div className="h-[60px] shrink-0 border-b px-4 flex items-center z-30 shadow-sm">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUserId(null)}
                  className="mr-4"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <img
                src={otherUser?.profilepicture || '/placeholder.svg'}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <h2 className="font-semibold text-gray-900 text-lg md:text-2xl truncate">
                {otherUser?.name || 'Utilisateur'}
              </h2>
            </div>
            {/* Zone messages - scrollable sur mobile, coupée sur desktop */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto max-h-[calc(100vh-48px-60px-60px)] md:max-h-[calc(100vh-80px-60px-60px)] px-4 py-2 space-y-2"
            >
              {messages.map((message) => (
                (() => {
                  console.log('MESSAGE DEBUG', message);
                  return (
                    <div key={message.id} className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                        {/* Aperçu du fichier si présent */}
                        {message.attachmentUrl && message.attachmentType === 'image' && (
                          <img src={message.attachmentUrl} alt="img" className="max-w-[220px] rounded mb-2" />
                        )}
                        {message.attachmentUrl && message.attachmentType === 'audio' && (
                          <audio controls src={message.attachmentUrl} className="mb-2 w-full" />
                        )}
                        {message.attachmentUrl && message.attachmentType === 'video' && (
                          <video controls src={message.attachmentUrl} className="mb-2 max-w-[220px] rounded" />
                        )}
                        {message.attachmentUrl && !['image','audio','video'].includes(message.attachmentType) && (
                          <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block text-xs underline mb-2">Fichier à télécharger</a>
                        )}
                        {/* Texte du message */}
                        {message.content && <p className="text-sm">{message.content}</p>}
                        <p className={`text-xs mt-1 ${message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Champ d'envoi - toujours visible en bas */}
            <div className="h-[60px] shrink-0 border-t px-4 flex items-center bg-white gap-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,audio/*,video/*"
                onChange={handleFileChange}
              />
              <Button asChild variant="ghost" size="icon" className="p-2" disabled={fileUploading}>
                <label htmlFor="file-upload">
                  <Paperclip className="h-6 w-6" />
                </label>
              </Button>

              {/* Aperçu du fichier sélectionné */}
              {selectedFile && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                  {filePreview ? (
                    <img src={filePreview} alt="preview" className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <span className="text-xs max-w-[80px] truncate">{selectedFile.name}</span>
                  )}
                  <button onClick={removeFile} className="ml-1 text-gray-500 hover:text-red-500">
                    ✕
                  </button>
                </div>
              )}

              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1"
                disabled={fileUploading}
              />
              <Button
                onClick={sendMessage}
                disabled={isSending || (!newMessage.trim() && !selectedFile) || fileUploading}
                size="sm"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 