import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Loader2, Send, Bell, UserCheck, UserMinus, ChevronRight, Check } from 'lucide-react';
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { useQuery } from '@apollo/client';
import { GET_OWN_THERAPIST_PROFILE_QUERY } from '../api/therapist-service';
import { useS3Download } from '@/hooks/use-s3-download';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { notificationService, NotificationItem } from '../../notifications/api/notification-service';

interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    conversationId?: string;
    count?: number;
    senderName?: string;
    matchedId?: string;
    unmatchedId?: string;
    sk?: string;
  };
}

// --- Smart S3 Avatar Component ---
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
    } else {
      download('profile.jpg', 'public').catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

const TherapistProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- Profile Query ---
  const { data, loading: isLoading, error } = useQuery(GET_OWN_THERAPIST_PROFILE_QUERY);
  const profile = data?.getOwnTherapistProfile;

  // --- Notification & Websocket State ---
  const { messages: websocketMessages } = useWebsocket();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [generalNotifs, setGeneralNotifs] = useState<NotificationItem[]>([]);
  const [isClearingChats, setIsClearingChats] = useState(false);
  const processedMessageCountRef = useRef(0);

  // Fetch True Notification State on Load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { notifications } = await notificationService.getNotifications();
        
        let chatCount = 0;
        const generals: NotificationItem[] = [];

        notifications.forEach((n) => {
          if (n.type === 'new_message') {
            chatCount += n.count || 1;
          } else if (n.type === 'new_match' || n.type === 'new_unmatch') {
            generals.push(n);
          }
        });

        setUnreadChatCount(chatCount);
        setGeneralNotifs(generals);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  // Listen for Real-Time Websocket Notifications
  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;

    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    let newIncomingChatCount = 0;
    const newGenerals: NotificationItem[] = [];

    for (const msg of newMessages) {
      const parsed = msg as IncomingNotification;
      if (parsed.type === 'notification' && parsed.data) {
        if (parsed.data.type === 'new_message') {
          newIncomingChatCount += 1;
        } else if (parsed.data.type === 'new_match' || parsed.data.type === 'new_unmatch') {
          newGenerals.push(parsed.data as NotificationItem);
        }
      }
    }

    if (newIncomingChatCount > 0) {
      setUnreadChatCount((prev) => prev + newIncomingChatCount);
    }
    if (newGenerals.length > 0) {
      setGeneralNotifs((prev) => [...newGenerals, ...prev]);
    }
  }, [websocketMessages]);

  // Mark General Notification as Read
  const handleDismissGeneral = async (notif: NotificationItem) => {
    try {
      const notifId = notif.matchedId || notif.unmatchedId || (notif.sk ? notif.sk.split('#')[1] : '');
      
      if (!notif.type || !notifId) return;

      await notificationService.readNotification({
        notificationType: notif.type,
        notificationId: notifId,
      });

      setGeneralNotifs((prev) => prev.filter((n) => n.sk !== notif.sk));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  
  const handleClearChats = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (unreadChatCount === 0 || isClearingChats) return;

    setIsClearingChats(true);
    try {
      const { notifications } = await notificationService.getNotifications();
      const chatNotifs = notifications.filter((n) => n.type === 'new_message');

      await Promise.all(
        chatNotifs.map((n) =>
          notificationService.readNotification({
            notificationType: 'new_message',
            notificationId: n.conversationId || (n.sk ? n.sk.split('#')[1] : ''),
          })
        )
      );

      // Setzt den Zähler sofort auf 0
      setUnreadChatCount(0);
    } catch (err) {
      console.error('Failed to clear chat notifications:', err);
    } finally {
      setIsClearingChats(false);
    }
  };

  // --- Render Handling ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error ? t('app.therapist.profile.loadError') : t('app.therapist.profile.noProfile')}
      </div>
    );
  }

  const age = profile.BirthDate
    ? Math.floor((Date.now() - profile.BirthDate * 1000) / 31557600000)
    : 'k.A.';

  const unreadChatLine = t('app.therapist.notifications.unreadCount', {
    count: unreadChatCount,
    defaultValue: unreadChatCount === 1 ? '1 ungelesene Nachricht' : `${unreadChatCount} ungelesene Nachrichten`,
  });

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.profile.title')}
      </h1>

      {/* --- PROFILE CARD --- */}
      <div className="feelora-card w-full mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
          <S3Avatar
            fallbackSrc={avatarPlaceholder}
            className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
            alt={`${profile.Name} ${profile.Surname}`}
          />
          <div className="flex-1 pl-1 sm:pl-0">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              {profile.Title ? `${profile.Title} ` : ''}
              {profile.Name} {profile.Surname}
            </h2>
            <div className="space-y-0.5 text-foreground">
              <p>
                <strong>{t('app.therapist.profile.age')}</strong> {age}
              </p>
              <p>
                <strong>{t('app.therapist.profile.city')}</strong> {profile.City}
              </p>
              {profile.Address && (
                <p>
                  <strong>{t('app.therapist.profile.address')}</strong> {profile.Address}
                </p>
              )}
              <p>
                <strong>{t('app.therapist.profile.role')}</strong>{' '}
                {profile.JobTitle || t('app.therapist.profile.therapist')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-foreground">
          <div>
            <p>
              <span className="font-bold">{t('app.therapist.profile.specializedIn')}</span>{' '}
              {profile.Specialties?.join(', ') || t('app.therapist.profile.noInfo')}
            </p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.languages')}</span>{' '}
              {profile.Languages?.join(', ') || t('app.therapist.profile.noInfo')}
            </p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.priceRange')}</span>{' '}
              {profile.PriceRange || t('app.therapist.profile.noPriceRange')}
            </p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.hasInsurance')}</span>{' '}
              {profile.HasInsurance
                ? t('app.therapist.profile.insuranceYes')
                : t('app.therapist.profile.insuranceNo')}
            </p>
            <div className="flex items-end gap-4 mt-2">
              <p className="mb-0">
                <span className="font-bold">{t('app.therapist.profile.availability')}</span>{' '}
                {profile.Availability?.join(', ') || t('app.therapist.profile.noInfo')}
              </p>
              <div className="flex-1"></div>
              <button
                onClick={() => navigate('edit')}
                className="feelora-btn-primary flex items-center justify-center"
              >
                {t('app.therapist.profile.edit')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- NOTIFICATIONS SECTION --- */}
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        {t('app.therapist.notifications.title', 'Neuigkeiten & Benachrichtigungen')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Messages Notification Card */}
        <div
          onClick={() => navigate('/therapist/chat')} 
          className="feelora-card relative flex items-center gap-4 transition-shadow text-left cursor-pointer hover:shadow-md hover:border-primary/30"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {t('app.therapist.notifications.messages', 'Chat Nachrichten')}
            </h3>
            <p className={`text-sm ${unreadChatCount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {unreadChatLine}
            </p>
          </div>

          {unreadChatCount > 0 ? (
            <button
              onClick={handleClearChats}
              disabled={isClearingChats}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
              title={t('common.markAsRead', 'Als gelesen markieren')}
            >
              {isClearingChats ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </button>
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* General Notifications List */}
        <div className="flex flex-col gap-3">
          {generalNotifs.length === 0 ? (
            <div className="feelora-card flex items-center justify-center h-full min-h-[5rem] text-muted-foreground text-sm">
              {t('app.therapist.notifications.noNew', 'Keine neuen Benachrichtigungen')}
            </div>
          ) : (
            generalNotifs.map((notif, index) => {
              const isMatch = notif.type === 'new_match';
              return (
                <div
                  key={notif.sk || index}
                  className="feelora-card p-3 sm:p-4 flex items-center gap-4 transition-all hover:border-primary/30"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isMatch ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isMatch ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {isMatch
                        ? t('app.therapist.notifications.newMatch', { name: notif.senderName || 'Ein Patient', defaultValue: `${notif.senderName || 'Ein Patient'} hat dich als Therapeuten akzeptiert!` })
                        : t('app.therapist.notifications.unmatch', { name: notif.senderName || 'Ein Patient', defaultValue: `Die Verbindung mit ${notif.senderName || 'einem Patienten'} wurde getrennt.` })
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismissGeneral(notif)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title={t('common.markAsRead', 'Als gelesen markieren')}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;