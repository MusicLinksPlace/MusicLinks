import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { Loader2, Send, ArrowLeft, Search, Paperclip, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star as StarIcon } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getImageUrlWithCacheBust } from '@/lib/utils';
import { sendMessageNotification } from '@/lib/emailService';

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
  type?: string;
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
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hasReview, setHasReview] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [reviewCheckLoading, setReviewCheckLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [prevMessagesCount, setPrevMessagesCount] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const storedUser = localStorage.getItem('musiclinks_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
  }, [navigate]);

  // Vérifier si un userId et projectId sont passés en paramètre
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [searchParams]);

  // Charger les messages quand l'utilisateur sélectionné change
  useEffect(() => {
    if (selectedUserId && currentUser) {
      loadMessages();
      fetchOtherUser();
    }
  }, [selectedUserId, currentUser]);

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
            name: sender?.name || 'Utilisateur inconnu',
            profilepicture: sender?.profilepicture || ''
          },
          attachmentType: msg.attachmentType,
          attachmentUrl: msg.attachmentUrl
        };
      }) || [];
      setMessages(transformedMessages);
      setPrevMessagesCount(transformedMessages.length);
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
    // Abonnement realtime : ajoute le message en live sans recharger toute la conversation
    const channel = supabase
      .channel('messages-realtime-global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
      }, async (payload) => {
        const newMessage = payload.new;
        // N'ajoute que si le message concerne la conversation courante
        if (
          (newMessage.senderId === currentUser.id && newMessage.receiverId === selectedUserId) ||
          (newMessage.senderId === selectedUserId && newMessage.receiverId === currentUser.id)
        ) {
          // Cherche le sender dans les messages existants
          let sender = null;
          if (newMessage.senderId === currentUser.id) {
            sender = { name: currentUser.name, profilepicture: currentUser.profilepicture };
          } else {
            // Cherche dans les messages existants
            sender = messages.find(m => m.senderId === newMessage.senderId)?.sender;
            // Si pas trouvé, fetch minimal
            if (!sender) {
              const { data, error } = await supabase
                .from('User')
                .select('name, profilepicture')
                .eq('id', newMessage.senderId)
                .single();
              sender = data ? { name: data.name, profilepicture: data.profilepicture } : { name: '', profilepicture: '' };
            }
          }
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            const formattedMessage = {
              id: newMessage.id,
              content: newMessage.content,
              senderId: newMessage.senderId,
              receiverId: newMessage.receiverId,
              createdAt: newMessage.createdAt,
              sender,
              attachmentUrl: newMessage.attachmentUrl,
              attachmentType: newMessage.attachmentType,
              projectId: newMessage.projectId,
              type: newMessage.type
            };
            return [...prev, formattedMessage];
          });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId, currentUser, messages]);

  // Charger le profil de l'autre utilisateur à chaque changement de selectedUserId
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!selectedUserId) return setOtherUser(null);
      const { data, error } = await supabase
        .from('User')
        .select('id, name, profilepicture, role')
        .eq('id', selectedUserId)
        .single();
      if (!error && data) setOtherUser(data);
      else setOtherUser(null);
    };
    fetchOtherUser();
  }, [selectedUserId]);

  useEffect(() => {
    console.log('Current user:', currentUser);
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({ 
          title: "Fichier trop volumineux", 
          description: "La taille maximale est de 50MB", 
          variant: "destructive" 
        });
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        'image/', 'video/', 'audio/', 
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        toast({ 
          title: "Type de fichier non supporté", 
          description: "Formats acceptés : images, vidéos, audio, PDF, Word", 
          variant: "destructive" 
        });
        return;
      }

      setSelectedFile(file);
      
      // Prévisualisation pour images, vidéos et audio
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Envoi de message : optimistic update
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUserId || !currentUser || isSending) return;
    
    setIsSending(true);
    try {
      let attachmentUrl = null;
      let attachmentType = null;
      
      if (selectedFile) {
        // Upload du fichier
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `attachments/${fileName}`;
        
        // Choisir le bucket selon le type de fichier
        let bucketName = 'attachments';
        if (selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/')) {
          bucketName = 'media-files';
        }
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, selectedFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Récupérer l'URL publique
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        attachmentUrl = data.publicUrl;
        
        // Déterminer le type d'attachement
        if (selectedFile.type.startsWith('image/')) {
          attachmentType = 'image';
        } else if (selectedFile.type.startsWith('video/')) {
          attachmentType = 'video';
        } else if (selectedFile.type.startsWith('audio/')) {
          attachmentType = 'audio';
        } else {
          attachmentType = 'file';
        }
      }
      
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedUserId,
        content: newMessage.trim() || `[${attachmentType === 'image' ? 'Image' : attachmentType === 'video' ? 'Vidéo' : attachmentType === 'audio' ? 'Audio' : 'Fichier'} envoyé(e)]`,
        attachmentUrl,
        attachmentType
      };

      const { error } = await supabase
        .from('Message')
        .insert([messageData]);
      
      if (error) throw error;
      
      setNewMessage('');
      removeFile();
      loadMessages();

      // Envoyer la notification par email
      try {
        // Récupérer les informations du destinataire
        const { data: receiverData } = await supabase
          .from('User')
          .select('name, email')
          .eq('id', selectedUserId)
          .single();

        if (receiverData && receiverData.email) {
          const messagePreview = newMessage.trim() || `[${attachmentType === 'image' ? 'Image' : attachmentType === 'video' ? 'Vidéo' : attachmentType === 'audio' ? 'Audio' : 'Fichier'} envoyé(e)]`;
          const conversationUrl = `${window.location.origin}/chat?userId=${currentUser.id}`;
          
          await sendMessageNotification({
            receiverEmail: receiverData.email,
            receiverName: receiverData.name || 'Utilisateur',
            senderName: currentUser.name || 'Utilisateur',
            messagePreview: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
            conversationUrl
          });
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de la notification par email:', emailError);
        // Ne pas bloquer l'envoi du message si l'email échoue
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({ title: "Erreur", description: "Impossible d'envoyer le message: " + error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
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

  // Vérifie si une review existe déjà pour ce duo
  useEffect(() => {
    const checkReview = async () => {
      if (!currentUser?.id || !selectedUserId) return;
      setReviewCheckLoading(true);
      const { data, error } = await supabase
        .from('Review')
        .select('id')
        .eq('fromUserid', currentUser.id)
        .eq('toUserid', selectedUserId)
        .maybeSingle();
      setHasReview(!!data);
      setReviewCheckLoading(false);
    };
    checkReview();
  }, [currentUser, selectedUserId, showReviewDialog]);

  // Vérifie si chaque utilisateur a envoyé au moins un message
  useEffect(() => {
    const checkMessages = async () => {
      if (!currentUser?.id || !selectedUserId) return setCanLeaveReview(false);
      const { data, error } = await supabase
        .from('Message')
        .select('senderId')
        .or(`and(senderId.eq.${currentUser.id},receiverId.eq.${selectedUserId}),and(senderId.eq.${selectedUserId},receiverId.eq.${currentUser.id})`);
      if (error) return setCanLeaveReview(false);
      const sentByMe = data.some((m: any) => m.senderId === currentUser.id);
      const sentByOther = data.some((m: any) => m.senderId === selectedUserId);
      setCanLeaveReview(sentByMe && sentByOther);
    };
    checkMessages();
  }, [currentUser, selectedUserId, messages]);

  // On conversation change, scroll en bas une seule fois
  useEffect(() => {
    if (selectedUserId) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 0);
    }
    // eslint-disable-next-line
  }, [selectedUserId, messages.length]);

  const handleMessagesScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      setAutoScroll(isAtBottom);
    }
  };

  // Charger les conversations au démarrage
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  // Charger les messages quand l'utilisateur sélectionné change
  useEffect(() => {
    if (selectedUserId && currentUser) {
      loadMessages();
      fetchOtherUser();
    }
  }, [selectedUserId, currentUser]);

  // Auto-scroll pour les nouveaux messages
  useEffect(() => {
    if (autoScroll && messages.length > prevMessagesCount) {
      scrollToBottom();
    }
    setPrevMessagesCount(messages.length);
  }, [messages, autoScroll, prevMessagesCount]);

  // Récupérer les données de l'autre utilisateur
  const fetchOtherUser = async () => {
    if (!selectedUserId) return;
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, name, profilepicture, role')
        .eq('id', selectedUserId)
        .single();

      if (error) throw error;
      setOtherUser(data);
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto p-4 flex">
        <div className="flex-1 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-120px)] flex">
            {/* Liste des conversations */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedUserId && isMobile ? 'hidden' : 'block'}`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations
                      .filter(conv => 
                        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => {
                            setSelectedUserId(conversation.otherUser.id);
                          }}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                            selectedUserId === conversation.otherUser.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={getImageUrlWithCacheBust(conversation.otherUser.profilepicture, '/lovable-uploads/logo2.png')}
                                alt={conversation.otherUser.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.otherUser.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage.senderId === currentUser?.id ? 'Vous: ' : ''}
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone de chat */}
            <div className={`flex-1 flex flex-col ${selectedUserId ? 'block' : 'hidden md:block'}`}>
              {selectedUserId ? (
                <>
                  {/* Header de conversation */}
                  <div className="border-b border-gray-200">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isMobile && (
                          <Button
                            onClick={() => setSelectedUserId(null)}
                            variant="ghost"
                            size="icon"
                            className="mr-2"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        )}
                        <img
                          src={getImageUrlWithCacheBust(otherUser?.profilepicture, '/lovable-uploads/logo2.png')}
                          alt={otherUser?.name || 'Utilisateur'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{otherUser?.name}</h3>
                          <p className="text-sm text-gray-500">
                            {otherUser?.role ? `${otherUser.role.charAt(0).toUpperCase()}${otherUser.role.slice(1)}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    onScroll={handleMessagesScroll}
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === currentUser?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {message.attachmentType === 'image' && message.attachmentUrl && (
                            <div className="mb-2">
                              <img
                                src={message.attachmentUrl}
                                alt="Image"
                                className="max-w-full h-auto rounded"
                                style={{ maxHeight: '200px' }}
                              />
                            </div>
                          )}
                          {message.attachmentType === 'video' && message.attachmentUrl && (
                            <div className="mb-2">
                              <video
                                controls
                                className="max-w-full h-auto rounded"
                                style={{ maxHeight: '300px' }}
                              >
                                <source src={message.attachmentUrl} type="video/mp4" />
                                Votre navigateur ne supporte pas la lecture de vidéos.
                              </video>
                            </div>
                          )}
                          {message.attachmentType === 'audio' && message.attachmentUrl && (
                            <div className="mb-2">
                              <audio controls className="w-full">
                                <source src={message.attachmentUrl} type="audio/mpeg" />
                                Votre navigateur ne supporte pas la lecture audio.
                              </audio>
                            </div>
                          )}
                          {message.attachmentType === 'file' && message.attachmentUrl && (
                            <div className="mb-2">
                              <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-blue-600 hover:underline"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span>Fichier joint</span>
                              </a>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input pour nouveau message */}
                  <div className="border-t border-gray-200 p-4">
                    {selectedFile && (
                      <div className="mb-2 p-2 bg-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{selectedFile.name}</span>
                          </div>
                          <Button onClick={removeFile} variant="ghost" size="sm">
                            ✕
                          </Button>
                        </div>
                        {filePreview && (
                          <div className="mt-2">
                            {selectedFile.type.startsWith('image/') && (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-w-full h-auto rounded"
                                style={{ maxHeight: '150px' }}
                              />
                            )}
                            {selectedFile.type.startsWith('video/') && (
                              <video
                                controls
                                className="max-w-full h-auto rounded"
                                style={{ maxHeight: '150px' }}
                              >
                                <source src={filePreview} type={selectedFile.type} />
                              </video>
                            )}
                            {selectedFile.type.startsWith('audio/') && (
                              <audio controls className="w-full">
                                <source src={filePreview} type={selectedFile.type} />
                              </audio>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="icon"
                        disabled={fileUploading}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button onClick={sendMessage} disabled={isSending || (!newMessage.trim() && !selectedFile)}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-500">
                      Choisissez une conversation dans la liste pour commencer à discuter
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 