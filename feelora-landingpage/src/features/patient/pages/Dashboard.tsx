import { useState, useEffect, useRef } from 'react';
import { Calendar, Send, Smile, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { patientService } from '../api/patient-service';
import { notificationService } from '../../notifications/api/notification-service'; // <-- Imported Notification Service
import { emojiDictionary } from '@/components/ui/moodtracker/mood-tracker';

interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    conversationId?: string;
    count?: number;
  };
}

// helper to format ISO dates (e.g., 2026-03-30T... to "30.03.26, 14:22")
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { messages: websocketMessages } = useWebsocket();

  // --- Notification State ---
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const processedMessageCountRef = useRef(0);

  // State for dynamically loaded mood trackers
  const [moodDiary, setMoodDiary] = useState<any[]>([]);
  const [isLoadingMoods, setIsLoadingMoods] = useState(true);

  // State for the mood tracker consent toggle
  const [isShared, setIsShared] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // --- Fetch True Data on Load (Profile, Moods, and Notifications) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingMoods(true);
      try {
        // Run all API calls in parallel for better performance
        const [profile, trackers, notifs] = await Promise.all([
          patientService.getProfile(),
          patientService.getMoodTrackers(),
          notificationService.getNotifications({ notificationType: 'new_message' }) // Get real unread count
        ]);

        // Set Consent
        setIsShared(profile.MoodTracker ?? false);

        // Format & Set Moods
        const formattedTrackers = trackers.map((item: any) => {
          const questionnaire = JSON.parse(item.Questionnaire);
          return {
            date: formatDate(item.CreatedAt),
            status: t('patient.dashboard.statusSeen', 'Gespeichert'),
            mood: emojiDictionary[questionnaire[0]?.[0]] || '❓', 
            outdoor: emojiDictionary[questionnaire[3]?.[0]] || '❓', 
            physical: emojiDictionary[questionnaire[4]?.[0]] || '❓', 
            fullQuestionnaire: questionnaire,
          };
        });
        setMoodDiary(formattedTrackers);

        // Set Accurate Unread Notifications
        let totalUnread = 0;
        notifs.notifications.forEach((n) => {
          totalUnread += n.count || 1;
        });
        setUnreadChatCount(totalUnread);

      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoadingMoods(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  // --- Listen to Websocket for Live Updates ---
  useEffect(() => {
    // Only process new messages we haven't seen yet
    if (websocketMessages.length <= processedMessageCountRef.current) return;

    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    let newIncomingCount = 0;
    for (const msg of newMessages) {
      const parsed = msg as IncomingNotification;
      if (parsed.type === 'notification' && parsed.data?.type === 'new_message') {
        newIncomingCount += 1;
      }
    }

    if (newIncomingCount > 0) {
      setUnreadChatCount((prev) => prev + newIncomingCount);
    }
  }, [websocketMessages]);

  // --- Mark All as Read Logic ---
  const handleMarkAllAsRead = async () => {
    if (unreadChatCount === 0 || isMarkingRead) return;
    
    setIsMarkingRead(true);
    try {
      // Fetch all unread message notifications
      const { notifications } = await notificationService.getNotifications({ notificationType: 'new_message' });
      
      // Delete them all from the backend simultaneously
      await Promise.all(
        notifications.map((n) =>
          notificationService.readNotification({
            notificationType: 'new_message',
            notificationId: n.conversationId || '', 
          })
        )
      );

      // Instantly reset the UI
      setUnreadChatCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
      alert('Fehler beim Markieren als gelesen.');
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Handler for clicking the mood tracker consent toggle switch
  const handleToggleShare = async () => {
    setIsToggling(true);
    const newConsentState = !isShared;
    try {
      setIsShared(newConsentState);
      await patientService.updateMoodTrackerConsent(newConsentState);
    } catch (error) {
      console.error('Failed to update consent', error);
      setIsShared(!newConsentState);
      alert('Fehler beim Speichern der Freigabe. Bitte versuche es erneut.');
    } finally {
      setIsToggling(false);
    }
  };

  const unreadChatLine = t('patient.dashboard.unreadMessagesCount', {
    count: unreadChatCount,
    defaultValue: unreadChatCount === 1 ? '1 unread message' : `${unreadChatCount} unread messages`,
  });

  const notificationCards = [
    {
      icon: Calendar,
      iconColor: 'text-purple',
      title: t('patient.dashboard.calendar'),
      lines: [
        t('patient.dashboard.upcomingAppointments'),
        t('patient.dashboard.appointmentRequest'),
      ],
      path: '/calendar',
      isEnabled: false,
    },
    {
      icon: Send,
      iconColor: 'text-purple',
      title: t('patient.dashboard.chat'),
      lines: [unreadChatLine],
      path: '/patient',
      isEnabled: true,
    },
    {
      icon: Smile,
      iconColor: 'text-purple',
      title: t('patient.dashboard.moodTracker'),
      lines: [t('patient.dashboard.dailyReminder')],
      path: '/mood-tracker',
      isEnabled: false,
    },
    {
      icon: BookOpen,
      iconColor: 'text-purple',
      title: t('patient.dashboard.tasks'),
      lines: [t('patient.dashboard.tasksWaiting')],
      path: '/homework',
      isEnabled: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Notification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {notificationCards.map((card, index) => (
          <button
            key={index}
            className={`feelora-card relative flex items-center gap-4 transition-shadow text-left ${card.isEnabled ? 'cursor-pointer hover:shadow-md' : 'cursor-default opacity-70'}`}
            onClick={() => {
              if (card.isEnabled) navigate(card.path);
            }}
            type="button"
          >
            <card.icon className={`w-10 h-10 ${card.iconColor}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{card.title}</h3>
              {card.lines.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
            {card.isEnabled && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </button>
        ))}
      </div>

      {/* Mark all as read button */}
      <div className="flex justify-center mb-10">
        <button 
          onClick={handleMarkAllAsRead}
          disabled={unreadChatCount === 0 || isMarkingRead}
          className="feelora-btn-primary px-8 flex items-center gap-2 disabled:opacity-50 transition-opacity"
        >
          {isMarkingRead && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('patient.dashboard.allRead')}
        </button>
      </div>

      {/* --- Mood Tracker Diary Header with Flexbox Toggle --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('patient.dashboard.moodDiary')}</h2>

        {/* The Toggle Container */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {isShared
              ? t('app.patient.moodTrackerSharing.consent')
              : t('app.patient.moodTrackerSharing.private')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isShared}
            onClick={handleToggleShare}
            disabled={isToggling || isLoadingMoods}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isShared ? 'bg-primary' : 'bg-border'
            } ${isToggling || isLoadingMoods ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="sr-only">Toggle data sharing</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isShared ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      {/* -------------------------------------------------------- */}

      {isLoadingMoods ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : moodDiary.length === 0 ? (
        <div className="feelora-card text-center p-8 border-dashed border-2">
          <p className="text-muted-foreground text-lg mb-4">{t('patient.dashboard.noMoodData')}</p>
          <button onClick={() => navigate('../mood-tracker')} className="feelora-btn-outline">
            {t('patient.dashboard.newMoodData')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {moodDiary.map((entry, index) => (
            <div
              key={index}
              className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-4 sm:gap-6 flex-1">
                <img src={avatar} alt="User" className="w-14 h-14 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-primary">{entry.date}</p>
                  <p className="text-sm text-muted-foreground italic">{entry.status}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <span className="text-2xl">{entry.mood}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('patient.dashboard.mood')}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl">{entry.outdoor}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('patient.dashboard.outdoor')}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl">{entry.physical}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('patient.dashboard.physical')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('details', { state: { entry } })}
                  className="text-primary font-medium hover:underline"
                >
                  {t('patient.dashboard.details')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;