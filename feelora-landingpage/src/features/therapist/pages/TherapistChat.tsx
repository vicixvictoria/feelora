import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Info, ChevronRight, ArrowLeft } from 'lucide-react';
import feeloraLogo from '@/assets/logo.png';
import avatar from '@/assets/avatar-Placeholder.png';

const chatList = [
  {
    id: 1,
    name: 'Dr. Eva Eddison',
    lastMessage: 'Here is the report on our..',
    avatar: avatar,
    isTherapist: true,
  },
  {
    id: 2,
    name: 'Feelora',
    lastMessage: 'Danke, dass du bei uns mit...',
    avatar: feeloraLogo,
    isBot: true,
  },
];

const messages = [
  {
    id: 1,
    sender: 'therapist',
    text: 'Hier ist der Bericht unserer letzten Therapiesitzung. Wir sehen uns nächsten Dienstag um 15 Uhr!',
    avatar: avatar,
  },
  {
    id: 2,
    sender: 'user',
    text: 'Danke! Bis nächste Woche!',
    avatar: avatar,
  },
];

const TherapistChat = () => {
  const { t } = useTranslation();
  const [selectedChat, setSelectedChat] = useState(chatList[0]);
  const [newMessage, setNewMessage] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  const handleSelectChat = (chat: (typeof chatList)[0]) => {
    setSelectedChat(chat);
    setMobileShowChat(true);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] animate-fade-in">
      {/* Chat List */}
      <div className={`w-full md:w-72 bg-card rounded-l-xl border border-border md:border-r-0 p-4 ${mobileShowChat ? 'hidden md:block' : ''}`}>
        <h2 className="text-2xl font-semibold text-primary mb-6">
          {t('app.therapist.chat.title')}
        </h2>
        <div className="space-y-2">
          {chatList.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedChat.id === chat.id ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{chat.name}</p>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 bg-card rounded-r-xl border border-border flex flex-col ${!mobileShowChat ? 'hidden md:flex' : ''}`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileShowChat(false)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <img
              src={avatar}
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
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <img src={message.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div
                  className={`chat-bubble ${
                    message.sender === 'user' ? 'chat-bubble-sent' : 'chat-bubble-received'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('app.therapist.chat.placeholder')}
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistChat;
