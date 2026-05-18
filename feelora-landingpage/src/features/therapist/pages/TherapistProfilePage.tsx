import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Loader2, Send, Bell, UserCheck, UserMinus, ChevronRight, Check, Ghost, Link, Copy } from 'lucide-react'; // <-- Added Link & Copy
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { useQuery } from '@apollo/client';
import { GET_OWN_THERAPIST_PROFILE_QUERY, therapistService } from '../api/therapist-service';
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

const S3Avatar = ({ userId, fallbackSrc, className, alt = '' }: { userId?: string; fallbackSrc: string; className: string; alt?: string; }) => {
  const { download, imageUrl } = useS3Download();

  useEffect(() => {
    if (userId) download('profile', 'public', userId).catch(() => {});
    else download('profile', 'public').catch(() => {});
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

const TherapistProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, loading: isLoading, error } = useQuery(GET_OWN_THERAPIST_PROFILE_QUERY);
  const profile = data?.getOwnTherapistProfile;

  // --- Ghost Mode State ---
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isTogglingGhost, setIsTogglingGhost] = useState(false);

  // --- Invitation State ---
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch True Ghost Mode State on Load
  useEffect(() => {
    const fetchGhostModeStatus = async () => {
      try {
        const questionnaireData = await therapistService.getQuestionnaire();
        if (questionnaireData && typeof questionnaireData.Discoverable === 'boolean') {
          setIsGhostMode(!questionnaireData.Discoverable);
        }
      } catch (err) {}
    };
    fetchGhostModeStatus();
  }, []);

  // --- Notification & Websocket State ---
  const { messages: websocketMessages } = useWebsocket();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [generalNotifs, setGeneralNotifs] = useState<NotificationItem[]>([]);
  const [isClearingChats, setIsClearingChats] = useState(false);
  const processedMessageCountRef = useRef(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { notifications } = await notificationService.getNotifications();
        let chatCount = 0;
        const generals: NotificationItem[] = [];

        notifications.forEach((n) => {
          if (n.type === 'new_message') chatCount += n.count || 1;
          else if (n.type === 'new_match' || n.type === 'new_unmatch') generals.push(n);
        });

        setUnreadChatCount(chatCount);
        setGeneralNotifs(generals);
      } catch (err) {}
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;

    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    let newIncomingChatCount = 0;
    const newGenerals: NotificationItem[] = [];

    for (const msg of newMessages) {
      const parsed = msg as IncomingNotification;
      if (parsed.type === 'notification' && parsed.data) {
        if (parsed.data.type === 'new_message') newIncomingChatCount += 1;
        else if (parsed.data.type === 'new_match' || parsed.data.type === 'new_unmatch') newGenerals.push(parsed.data as NotificationItem);
      }
    }

    if (newIncomingChatCount > 0) setUnreadChatCount((prev) => prev + newIncomingChatCount);
    if (newGenerals.length > 0) setGeneralNotifs((prev) => [...newGenerals, ...prev]);
  }, [websocketMessages]);

  const handleDismissGeneral = async (notif: NotificationItem) => {
    try {
      const notifId = notif.matchedId || notif.unmatchedId || (notif.sk ? notif.sk.split('#')[1] : '');
      if (!notif.type || !notifId) return;

      await notificationService.readNotification({ notificationType: notif.type, notificationId: notifId });
      setGeneralNotifs((prev) => prev.filter((n) => n.sk !== notif.sk));
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (err) {}
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
          notificationService.readNotification({ notificationType: 'new_message', notificationId: n.conversationId || (n.sk ? n.sk.split('#')[1] : '') })
        )
      );

      setUnreadChatCount(0);
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (err) {} finally {
      setIsClearingChats(false);
    }
  };

  const handleToggleGhostMode = async () => {
    setIsTogglingGhost(true);
    const newGhostState = !isGhostMode;
    const success = await therapistService.toggleGhostMode(newGhostState);
    if (success) setIsGhostMode(newGhostState);
    else alert(t('app.therapist.profile.ghostError', 'Fehler beim Ändern der Sichtbarkeit. Bitte versuche es später noch einmal.'));
    setIsTogglingGhost(false);
  };

  // --- Handle Create Invitation Logic ---
  const handleCreateInvite = async () => {
    setIsCreatingInvite(true);
    try {
      const result = await therapistService.createInvitation();
      
      // If the backend returns a full URL (starting with http), use it directly. 
      // If it only returns an ID, construct the backend URL string that sets the cookie.
      // (Adjust this origin to match your backend URL if it's on a different subdomain!)
      const backendDomain = import.meta.env.VITE_AUTH_API_URL || window.location.origin;
      const fullLink = result.startsWith('http') ? result : `${backendDomain}/invite/${result}`;
      
      setInviteLink(fullLink);
    } catch (error) {
      alert(t('app.therapist.profile.inviteError', 'Fehler beim Erstellen des Links.'));
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset checkmark after 2s
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple" /></div>;
  if (error || !profile) return <div className="text-center text-red-500 mt-10">{error ? t('app.therapist.profile.loadError') : t('app.therapist.profile.noProfile')}</div>;

  const age = profile.BirthDate ? Math.floor((Date.now() - profile.BirthDate * 1000) / 31557600000) : 'k.A.';
  const unreadChatLine = t('app.therapist.notifications.unreadCount', { count: unreadChatCount });

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.profile.title')}
      </h1>

      {/* --- PROFILE CARD --- */}
      <div className="feelora-card w-full mb-8">
        
        {/* TOP SECTION */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <S3Avatar
              userId={profile.Id}
              fallbackSrc={avatarPlaceholder}
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
              alt={`${profile.Name} ${profile.Surname}`}
            />
            <div className="flex-1 pl-1 sm:pl-0 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-primary mb-1">
                {profile.Title ? `${profile.Title} ` : ''}{profile.Name} {profile.Surname}
              </h2>
              <div className="space-y-0.5 text-foreground">
                <p><strong>{t('app.therapist.profile.age')}</strong> {age}</p>
                <p><strong>{t('app.therapist.profile.city')}</strong> {profile.City}</p>
                {profile.Address && <p><strong>{t('app.therapist.profile.address')}</strong> {profile.Address}</p>}
                <p><strong>{t('app.therapist.profile.role')}</strong> {profile.JobTitle || t('app.therapist.profile.therapist')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 sm:w-48">
            <button onClick={() => navigate('edit')} className="feelora-btn-primary flex items-center justify-center rounded-xl border w-full">
              {t('app.therapist.profile.edit')} <ExternalLink className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={handleToggleGhostMode}
              disabled={isTogglingGhost}
              className={`flex items-center justify-center px-4 py-2 w-full text-sm font-medium rounded-xl border transition-all duration-200 ${
                isGhostMode ? 'bg-muted text-foreground border-border hover:bg-muted/80' : 'bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {isTogglingGhost ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Ghost className={`w-4 h-4 mr-2 ${isGhostMode ? 'text-primary' : ''}`} />
                  {isGhostMode ? t('app.therapist.profile.ghostOn', 'Ghost Mode: An') : t('app.therapist.profile.ghostOff', 'Ghost Mode: Aus')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="space-y-4 text-foreground">
          <div>
            <p><span className="font-bold">{t('app.therapist.profile.specializedIn')}</span> {profile.Specialties?.join(', ') || t('app.therapist.profile.noInfo')}</p>
            <p><span className="font-bold">{t('app.therapist.profile.languages')}</span> {profile.Languages?.join(', ') || t('app.therapist.profile.noInfo')}</p>
            <p><span className="font-bold">{t('app.therapist.profile.priceRange')}</span> {profile.PriceRange || t('app.therapist.profile.noPriceRange')}</p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.hasInsurance')}</span>{' '}
              {profile.HasInsurance ? t('app.therapist.profile.insuranceYes') : t('app.therapist.profile.insuranceNo')}
            </p>
            <div className="mt-2">
              <p className="mb-0">
                <span className="font-bold">{t('app.therapist.profile.availability')}</span>{' '}
                {profile.Availability && profile.Availability.length > 0
                ? profile.Availability.map((day: string) => {
                    const dayMap: Record<string, string> = { mo: 'Mon', di: 'Tue', mi: 'Wed', do: 'Thu', fr: 'Fri', sa: 'Sat', so: 'Sun' };
                    return dayMap[day] || day.toUpperCase();
                  }).join(', ')
                : t('app.therapist.profile.noInfo')}
              </p>
            </div>
          </div>
        </div>

        {/* --- NEW INVITATION LINK UI --- */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-xl">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
              <Link className="w-5 h-5 text-primary" />
              {t('app.therapist.profile.inviteTitle', 'Patient:innen einladen')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('app.therapist.profile.inviteDesc', 'Für bestehenden Patient:innen hier einen Einladungslink erstellen. Bitte sende diesen Link direkt an deine Patient:innen, diese sollen sich genau damit registrieren und anmelden.')}
            </p>
          </div>
          
          <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
            {!inviteLink ? (
              <button
                onClick={handleCreateInvite}
                disabled={isCreatingInvite}
                className="feelora-btn-primary flex items-center justify-center whitespace-nowrap"
              >
                {isCreatingInvite ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                {t('app.therapist.profile.createInviteBtn', 'Einladungslink erstellen')}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 p-2 rounded-lg">
                <span className="text-sm font-medium text-secondary truncate max-w-[200px] sm:max-w-xs select-all">
                  {inviteLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-white rounded-md shadow-sm text-secondary hover:bg-secondary hover:text-white transition-colors"
                  title="Link kopieren"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
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
        <div onClick={() => navigate('../')} className="feelora-card relative flex items-center gap-4 transition-shadow text-left cursor-pointer hover:shadow-md hover:border-primary/30">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{t('app.therapist.notifications.messages', 'Chat Nachrichten')}</h3>
            <p className={`text-sm ${unreadChatCount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{unreadChatLine}</p>
          </div>
          {unreadChatCount > 0 ? (
            <button onClick={handleClearChats} disabled={isClearingChats} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
              {isClearingChats ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5 text-green-500" />}
            </button>
          ) : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
        </div>

        {/* General Notifications List with Correct Translation Hooks! */}
        <div className="flex flex-col gap-3">
          {generalNotifs.length === 0 ? (
            <div className="feelora-card flex items-center justify-center h-full min-h-[5rem] text-muted-foreground text-sm">
              {t('app.therapist.notifications.noNew', 'Keine neuen Benachrichtigungen')}
            </div>
          ) : (
            generalNotifs.map((notif, index) => {
              const isMatch = notif.type === 'new_match';
              const sender = notif.senderName; // Look for a name attached to the payload

              // Use _named translation if senderName exists, otherwise fallback to _generic
              let notificationText = '';
              if (isMatch) {
                notificationText = sender
                  ? t('app.therapist.notifications.newMatch_named', { name: sender, defaultValue: '{{name}} wurde dir zugewiesen!' })
                  : t('app.therapist.notifications.newMatch_generic', 'Ein Patient wurde dir zugewiesen!');
              } else {
                notificationText = sender
                  ? t('app.therapist.notifications.unmatch_named', { name: sender, defaultValue: '{{name}} hat dich entmatcht.' })
                  : t('app.therapist.notifications.unmatch_generic', 'Ein Patient hat dich entmatcht.');
              }

              return (
                <div key={notif.sk || index} className="feelora-card p-3 sm:p-4 flex items-center gap-4 transition-all hover:border-primary/30">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isMatch ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isMatch ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {notificationText}
                    </p>
                  </div>
                  <button onClick={() => handleDismissGeneral(notif)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
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