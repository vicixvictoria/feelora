import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Info, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
//import feeloraLogo from '@/assets/logo.png';
import avatar from '@/assets/avatar-Placeholder.png';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, ChatMessage } from '@/features/chat/api/chatService'; 
import { patientService } from '../api/patient-service';

// --- New Interface for the Sidebar ---
interface SidebarChat {
  contactId: string;
  name: string;
  avatar: string;
  conversationId: string | null; // Null if the backend hasn't created it yet
  lastMessage: string;
}

const ChatPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

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

  // 1. Fetch Matches AND Conversations on Load
  useEffect(() => {
    const fetchContactsAndChats = async () => {
      try {
        setIsLoadingChats(true);

        // A. Get the Patient's Matches
        const profile = await patientService.getProfile();
        const therapists = await patientService.getMatchedTherapists(profile.Matches || []);

        // B. Get the active Conversations
        const conversations = await chatService.getChatConversations();

        // C. Combine them into our Sidebar List!
        const sidebarItems: SidebarChat[] = therapists.map((therapist) => {
          // Check if a conversation already exists for this therapist
          const existingChat = conversations.find((c) => c.participantIds.includes(therapist.Id));

          return {
            contactId: therapist.Id,
            name: `${therapist.Name} ${therapist.Surname}`,
            avatar: avatar, // Will replace with therapist profile pic when S3 images work
            conversationId: existingChat ? existingChat.conversationId : null,
            lastMessage:
              existingChat?.lastMessage || t('patient.chat.startChat', 'Beginne den Chat...'),
          };
        });

        setChatList(sidebarItems);

        // Auto-select the first chat on desktop
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

  // 2. Fetch Messages when a contact is clicked
  const handleSelectChat = async (chat: SidebarChat) => {
    setSelectedChat(chat);
    setMobileShowChat(true);
    setMessages([]); // Clear previous messages while loading

    // If they have no conversationId yet, there are no messages to fetch
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

  // 3. Send Message
  const handleSendMessage = async () => {
    // Console log for debugging
    console.log('Send button triggered. Checking state...');
    console.log('1. Message text:', newMessage);
    console.log('2. Selected Chat:', selectedChat);
    console.log('3. User object:', user);
    console.log('4. isSending status:', isSending);

    if (!newMessage.trim()) return; // Don't send empty spaces
    if (isSending) return; // Don't double-send

    if (!user) {
      alert('Fehler: Benutzerdaten konnten nicht geladen werden (User ist null).');
      return;
    }

    if (!selectedChat) {
      alert('Fehler: Kein Chat ausgewählt.');
      return;
    }

    if (!selectedChat.conversationId) {
      alert(
        'Fehler: Konversation wurde noch nicht generiert. Bitte lade die Seite neu oder kontaktiere den Support.',
      );
      return;
    }

    const messageText = newMessage.trim();
    setIsSending(true);

    try {
      console.log('Attempting to send message to AWS...');
      const realMessage = await chatService.sendChatMessage(
        selectedChat.conversationId,
        messageText,
      );
      console.log('Message sent successfully!', realMessage);

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
            {chatList.map((chat) => (
              <button
                key={chat.contactId}
                onClick={() => handleSelectChat(chat)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedChat?.contactId === chat.contactId ? 'bg-muted' : 'hover:bg-muted/50'}`}
              >
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-medium text-foreground truncate">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
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
                <img
                  src={selectedChat.avatar}
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
            <div className="flex-1 p-6 overflow-y-auto">
              {isLoadingMessages ? (
                <div className="flex justify-center h-full items-center">
                  <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center h-full items-center text-muted-foreground">
                  Noch keine Nachrichten. Sende ein "Hallo!"
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => {
                    const isMe = message.from === user?.id;

                    // Determine the correct avatar:
                    // If isMe: Use user.picture (if it exists in auth object), otherwise use the avatar placeholder
                    // If not isMe: Use the selectedChat.avatar (which already falls back to the placeholder in the sidebar logic)
                    const profileImage = isMe
                      ? (user as any)?.picture || avatar
                      : selectedChat.avatar;

                    return (
                      <div
                        key={message.messageId}
                        className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <img
                          src={profileImage}
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
              {/* Wrap in a form so the mobile keyboard "Send" button triggers the submit! */}
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
                    // Send message on Enter, but allow a new line if they hold Shift
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
            Wähle einen Chat aus, um eine Nachricht zu senden.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
