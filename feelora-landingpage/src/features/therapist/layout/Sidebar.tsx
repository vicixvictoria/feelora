import { useEffect, useState, useRef } from 'react';
import { Calendar, User, Send, Smile, BookOpen, Users2 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebsocket } from '@/contexts/WebsocketContext';
import {
  notificationService,
  SESSION_NOTIFICATION_TYPES,
  HOMEWORK_NOTIFICATION_TYPES,
} from '../../notifications/api/notification-service';

// --- Interfaces for Websocket Data ---
interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    conversationId?: string;
    count?: number;
    bookingId?: string;
  };
}

const isSessionNotification = (type?: string) =>
  SESSION_NOTIFICATION_TYPES.includes(type as (typeof SESSION_NOTIFICATION_TYPES)[number]);

// Same bucketing idea as isSessionNotification, but for the Aufgaben nav
// item's own badge. In practice a therapist only ever gets "updated_homework"
// (new_homework/deleted_homework go to the patient), but this checks the
// whole homework group rather than hardcoding that assumption.
const isHomeworkNotification = (type?: string) =>
  HOMEWORK_NOTIFICATION_TYPES.includes(type as (typeof HOMEWORK_NOTIFICATION_TYPES)[number]);

const menuItems = [
  {
    titleKey: 'app.therapist.sidebar.calendar',
    descKey: 'app.therapist.sidebar.calendarDesc',
    icon: Calendar,
    path: '/therapist/calendar',
    comingSoon: false,
  },
  {
    titleKey: 'app.therapist.sidebar.chat',
    descKey: 'app.therapist.sidebar.chatDesc',
    icon: Send,
    path: '/therapist/',
    comingSoon: false,
  },
  {
    titleKey: 'app.therapist.sidebar.patients',
    descKey: 'app.therapist.sidebar.patientsDesc',
    icon: Users2,
    path: '/therapist/patients',
    comingSoon: false,
  },
  {
    titleKey: 'app.therapist.sidebar.moodTracker',
    descKey: 'app.therapist.sidebar.moodTrackerDesc',
    icon: Smile,
    path: '/therapist/mood-tracker',
    comingSoon: false,
  },
  {
    titleKey: 'app.therapist.sidebar.profile',
    descKey: 'app.therapist.sidebar.profileDesc',
    icon: User,
    path: '/therapist/profile',
    comingSoon: false,
  },
  {
    titleKey: 'app.therapist.sidebar.homework',
    descKey: 'app.therapist.sidebar.homeworkDesc',
    icon: BookOpen,
    path: '/therapist/homework',
    comingSoon: false,
  },
];

export const TherapistSidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { messages: websocketMessages } = useWebsocket();
  
  // Notification States
  const [chatNotifCount, setChatNotifCount] = useState(0);
  const [patientsNotifCount, setPatientsNotifCount] = useState(0);
  const [calendarNotifCount, setCalendarNotifCount] = useState(0);
  const [homeworkNotifCount, setHomeworkNotifCount] = useState(0);
  const processedMessageCountRef = useRef(0);

  // --- Fetch Initial Notifications & Listen for Read Events ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { notifications } = await notificationService.getNotifications();
        let chatCount = 0;
        let patientsCount = 0;
        let calendarCount = 0;
        let homeworkCount = 0;

        notifications.forEach((n) => {
          if (n.type === 'new_message') chatCount += n.count || 1;
          else if (n.type === 'new_match' || n.type === 'new_unmatch') patientsCount += 1;
          else if (isSessionNotification(n.type)) calendarCount += 1;
          else if (isHomeworkNotification(n.type)) homeworkCount += 1;
        });

        setChatNotifCount(chatCount);
        setPatientsNotifCount(patientsCount);
        setCalendarNotifCount(calendarCount);
        setHomeworkNotifCount(homeworkCount);
      } catch (err) {
        console.error('Sidebar failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    // Custom Event Listener: Refetch when Chat or Patients marks items as read
    const handleNotificationsRead = () => {
      fetchNotifications();
    };
    window.addEventListener('notificationsRead', handleNotificationsRead);

    return () => {
      window.removeEventListener('notificationsRead', handleNotificationsRead);
    };
  }, [location.pathname]); // Also refetch when navigating between pages as a safety net

  // --- Real-time WebSocket Updates ---
  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;

    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    let newChats = 0;
    let newPatientsNotifs = 0;
    let newCalendar = 0;
    let newHomework = 0;

    for (const msg of newMessages) {
      const parsed = msg as IncomingNotification;
      if (parsed.type === 'notification' && parsed.data) {
        if (parsed.data.type === 'new_message') {
          newChats += 1;
        } else if (parsed.data.type === 'new_match' || parsed.data.type === 'new_unmatch') {
          newPatientsNotifs += 1;
        } else if (isSessionNotification(parsed.data.type)) {
          newCalendar += 1;
        } else if (isHomeworkNotification(parsed.data.type)) {
          newHomework += 1;
        }
      }
    }

    // Only increment if we are NOT currently on that specific page
    if (newChats > 0 && location.pathname !== '/therapist/') {
      setChatNotifCount((prev) => prev + newChats);
    }
    if (newPatientsNotifs > 0 && location.pathname !== '/therapist/patients') {
      setPatientsNotifCount((prev) => prev + newPatientsNotifs);
    }
    if (newCalendar > 0 && location.pathname !== '/therapist/calendar') {
      setCalendarNotifCount((prev) => prev + newCalendar);
    }
    if (newHomework > 0 && location.pathname !== '/therapist/homework') {
      setHomeworkNotifCount((prev) => prev + newHomework);
    }
  }, [websocketMessages, location.pathname]);

  // Helper to get the correct badge count for the current menu item
  const getBadgeCount = (path: string) => {
    if (path === '/therapist/') return chatNotifCount;
    if (path === '/therapist/patients') return patientsNotifCount;
    if (path === '/therapist/calendar') return calendarNotifCount;
    if (path === '/therapist/homework') return homeworkNotifCount;
    return 0;
  };

  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => {
        const badgeCount = getBadgeCount(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/therapist/'}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
          >
            {/* Icon Container with relative positioning for the badge */}
            <div className="relative mt-0.5">
              <item.icon className="w-5 h-5 text-sidebar-text" />
              {badgeCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </div>

            <div className="flex flex-col ml-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-sidebar-text">{t(item.titleKey)}</span>
                {item.comingSoon && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide bg-primary/15 text-primary px-1.5 py-0.5 rounded-full leading-none">
                    {t('app.therapist.calendar.comingSoon')}
                  </span>
                )}
              </div>
              <span className="text-xs text-sidebar-muted leading-tight">{t(item.descKey)}</span>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-60 bg-sidebar h-screen sticky top-0 py-6 px-3 overflow-y-auto z-10 border-r border-border">
      <TherapistSidebarNav />
    </aside>
  );
};

export default Sidebar;