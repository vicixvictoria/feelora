import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Info, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { useAuth } from '@/contexts/AuthContext';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { chatService, ChatMessage } from '@/features/chat/api/chatService';
import { patientService } from '../api/patient-service';
import { useS3Download } from '@/hooks/use-s3-download';

// --- Interface for the Sidebar ---
interface SidebarChat {
  contactId: string;
  name: string;
  conversationId: string | null;
  lastMessage: string;
}

interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    conversationId?: string;
    count?: number;
  };
}

interface WebsocketMessage {
  type?: string;
  data?: IncomingNotification['data'];
}

// --- Smart S3 Avatar Component (Used only for the Chat Sidebar) ---
const S3Avatar = ({
  userId,
  fallbackSrc,
  className,
  alt = '',
}: {
  userId?: string;
  fallbackSrc: string;
  className: string;
  alt?: string;
}) => {
  const { download, imageUrl } = useS3Download();

  useEffect(() => {
    if (userId) {
      download('profile.jpg', 'public', userId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

const ChatPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { messages: websocketMessages } = useWebsocket();

  // State
  const [chatList, setChatList] = useState<SidebarChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SidebarChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // UI State
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});
  
  const processedMessageCountRef = useRef(0);

  // Create a reference to the bottom of the chat
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // ==========================================
  // AVATAR FETCHING
  // ==========================================

  // Fetch patient avatar exactly once when the component mounts
  const { download: downloadMyAvatar, imageUrl: myAvatarUrl } = useS3Download();
  useEffect(() => {
    downloadMyAvatar('profile.jpg', 'public').catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch therapist avatar exactly once whenever the selected chat changes
  const { download: downloadTheirAvatar, imageUrl: theirAvatarUrl } = useS3Download();
  useEffect(() => {
    if (selectedChat?.contactId) {
      downloadTheirAvatar('profile.jpg', 'public', selectedChat.contactId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.contactId]);


  // ==========================================
  // WEBSOCKET NOTIFICATION LOGIC
  // ==========================================
  const extractIncomingNotification = (
    rawMessage: WebsocketMessage,
  ): IncomingNotification | null => {
    if (rawMessage.type !== 'notification') return null;
    if (rawMessage.data?.type !== 'new_message') return null;
    if (!rawMessage.data.conversationId) return null;
    return rawMessage as IncomingNotification;
  };

  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;

    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    let activeChatNeedsUpdate = false;
    
    // Check if any of the new messages belong to the currently open chat
    for (const rawMessage of newMessages) {
      const incoming = extractIncomingNotification(rawMessage);
      
      if (incoming?.data?.conversationId && incoming.data.conversationId === selectedChat?.conversationId) {
        activeChatNeedsUpdate = true;
        break; 
      }
    }

    // Update the unread badges for all other background chats
    setUnreadByConversation((previous) => {
      const next = { ...previous };
      for (const rawMessage of newMessages) {
        const incoming = extractIncomingNotification(rawMessage);
        if (!incoming?.data?.conversationId) continue;
        
        const conversationId = incoming.data.conversationId;

        // Skip adding an unread badge if the user is currently looking at this chat
        if (selectedChat?.conversationId === conversationId) {
          continue; 
        }

        const fallbackCount = (next[conversationId] ?? 0) + 1;
        const count = typeof incoming.data.count === 'number' ? incoming.data.count : fallbackCount;
        next[conversationId] = Math.max(0, count);
      }
      return next;
    });

    // Silently fetch the latest chat history if the active chat got a message
    if (activeChatNeedsUpdate && selectedChat?.conversationId) {
      chatService.getChatMessages(selectedChat?.conversationId)
        .then((latestMessages) => {
          setMessages(latestMessages);
        })
        .catch((err) => console.error('Failed to auto-update active chat messages:', err));
    }
  }, [websocketMessages, selectedChat]);
  

  // Fetch Matches and Conversations on Load
  useEffect(() => {
    const fetchContactsAndChats = async () => {
      try {
        setIsLoadingChats(true);
        const profile = await patientService.getProfile();
        const therapists = await patientService.getMatchedTherapists(profile.Matches || []);
        const conversations = await chatService.getChatConversations();

        const sidebarItems: SidebarChat[] = therapists.map((therapist) => {
          const existingChat = conversations.find((c) => c.participantIds.includes(therapist.Id));
          return {
            contactId: therapist.Id,
            name: `${therapist.Name} ${therapist.Surname}`,
            conversationId: existingChat ? existingChat.conversationId : null,
            lastMessage:
              existingChat?.lastMessage || t('patient.chat.startChat', 'Beginne den Chat...'),
          };
        });

        setChatList(sidebarItems);

        if (sidebarItems.length > 0 && window.innerWidth >= 768) {
          handleSelectChat(sidebarItems[0]);
        }
      } catch (error) {
        console.error('Error loading chat contacts:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchContactsAndChats();
  }, [t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Messages when a contact is clicked
  const handleSelectChat = async (chat: SidebarChat) => {
    setSelectedChat(chat);
    setMobileShowChat(true);
    setMessages([]);

    if (chat.conversationId) {
      const conversationId = chat.conversationId;
      setUnreadByConversation((previous) => {
        if (!(conversationId in previous)) return previous;
        const next = { ...previous };
        delete next[conversationId];
        return next;
      });
    }

    if (!chat.conversationId) return;

    setIsLoadingMessages(true);
    try {
      const chatHistory = await chatService.getChatMessages(chat.conversationId);
      setMessages(chatHistory);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    if (!user || !selectedChat || !selectedChat.conversationId) return;

    const messageText = newMessage.trim();
    setIsSending(true);

    try {
      const realMessage = await chatService.sendChatMessage(
        selectedChat.conversationId,
        messageText,
      );
      setMessages((prev) => [...prev, realMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Nachricht konnte nicht gesendet werden.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] animate-fade-in">
      {/* --- CHAT LIST SIDEBAR --- */}
      <div
        className={`w-full md:w-72 bg-card rounded-l-xl border border-border md:border-r-0 p-4 ${mobileShowChat ? 'hidden md:block' : 'block'}`}
      >
        <h2 className="text-2xl font-semibold text-primary mb-6">{t('patient.chat.chats')}</h2>

        {isLoadingChats ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : chatList.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Du hast noch keinen Therapeuten akzeptiert.
          </div>
        ) : (
          <div className="space-y-2">
            {chatList.map((chat) => {
              const unreadCount = chat.conversationId
                ? (unreadByConversation[chat.conversationId] ?? 0)
                : 0;

              return (
                <button
                  key={chat.contactId}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedChat?.contactId === chat.contactId ? 'bg-muted' : unreadCount > 0 ? 'bg-primary/10 hover:bg-primary/15 ring-1 ring-primary/30' : 'hover:bg-muted/50'}`}
                >
                  <S3Avatar
                    userId={chat.contactId}
                    fallbackSrc={avatarPlaceholder}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    alt={chat.name}
                  />
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="font-medium text-foreground truncate">{chat.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="mr-1 inline-flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* --- CHAT WINDOW --- */}
      <div
        className={`flex-1 bg-card rounded-r-xl border border-border flex flex-col ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}
      >
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                {/* Use the pre-fetched therapist URL */}
                <img
                  src={theirAvatarUrl || avatarPlaceholder}
                  alt={selectedChat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <h3 className="text-xl font-semibold text-foreground">{selectedChat.name}</h3>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
                <Info className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto">
              {isLoadingMessages ? (
                <div className="flex justify-center h-full items-center">
                  <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center h-full items-center text-muted-foreground">
                  {t('app.patient.chat.noMessages')}
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => {
                    const isMe = message.from === user?.id;

                    // Assign the correct pre-fetched image instantly!
                    const currentAvatar = isMe
                      ? myAvatarUrl || avatarPlaceholder
                      : theirAvatarUrl || avatarPlaceholder;

                    return (
                      <div
                        key={message.messageId}
                        className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <img
                          src={currentAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div
                          className={`chat-bubble max-w-[70%] break-words whitespace-pre-wrap ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
                        >
                          {message.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3 w-full"
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t('patient.chat.placeholder')}
                  disabled={isSending}
                  rows={1}
                  className="flex-1 w-full min-w-0 px-4 py-3 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 resize-none overflow-y-auto max-h-32"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {t('app.patient.chat.chooseChat')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;