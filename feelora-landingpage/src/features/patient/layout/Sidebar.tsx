import { useEffect, useState, useRef } from 'react';
import { User, Send, Smile, LayoutDashboard, Calendar, BookOpen } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { notificationService, SESSION_NOTIFICATION_TYPES } from '../../notifications/api/notification-service';

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

const menuItems = [
  {
    titleKey: 'patient.sidebar.dashboard',
    descKey: 'patient.sidebar.dashboardDesc',
    icon: LayoutDashboard,
    path: '/patient/dashboard',
    comingSoon: false,
  },
  {
    titleKey: 'patient.sidebar.chat',
    descKey: 'patient.sidebar.chatDesc',
    icon: Send,
    path: '/patient/',
    comingSoon: false,
  },
  {
    titleKey: 'patient.sidebar.moodTracker',
    descKey: 'patient.sidebar.moodTrackerDesc',
    icon: Smile,
    path: '/patient/mood-tracker',
    comingSoon: false,
  },
  {
    titleKey: 'patient.sidebar.calendar',
    descKey: 'patient.sidebar.calendarDesc',
    icon: Calendar,
    path: '/patient/calendar',
    comingSoon: false,
  },
  {
    titleKey: 'patient.sidebar.profile',
    descKey: 'patient.sidebar.profileDesc',
    icon: User,
    path: '/patient/profile',
    comingSoon: false,
  },
  {
    titleKey: 'patient.sidebar.homework',
    descKey: 'patient.sidebar.homeworkDesc',
    icon: BookOpen,
    path: '/patient/homework',
    comingSoon: true,
  },
];

export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { messages: websocketMessages } = useWebsocket();
  
  // Notification States
  const [chatNotifCount, setChatNotifCount] = useState(0);
  const [dashboardNotifCount, setDashboardNotifCount] = useState(0);
  const [calendarNotifCount, setCalendarNotifCount] = useState(0);
  const processedMessageCountRef = useRef(0);

  // --- Fetch Initial Notifications & Listen for Read Events ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { notifications } = await notificationService.getNotifications({});
        let chatCount = 0;
        let dashCount = 0;
        let calendarCount = 0;

        notifications.forEach((n) => {
          if (n.type === 'new_message') {
            chatCount += n.count || 1;
          } else if (isSessionNotification(n.type)) {
            calendarCount += 1;
          } else {
            // General notifications go to the dashboard
            dashCount += 1;
          }
        });

        setChatNotifCount(chatCount);
        setDashboardNotifCount(dashCount);
        setCalendarNotifCount(calendarCount);
      } catch (err) {
        console.error('Sidebar failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    // Custom Event Listener: Refetch when Chat or Dashboard marks items as read
    const handleNotificationsRead = () => {
      fetchNotifications();
    };
    window.addEventListener('notificationsRead', handleNotificationsRead);

    return () => {
      window.removeEventListener('notificationsRead', handleNotificationsRead);
    };
  }, [location.pathname]); // Refetch when navigating between pages as a safety net

  // --- Real-time WebSocket Updates ---
  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;

    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    let newChats = 0;
    let newDash = 0;
    let newCalendar = 0;

    for (const msg of newMessages) {
      const parsed = msg as IncomingNotification;
      if (parsed.type === 'notification' && parsed.data) {
        if (parsed.data.type === 'new_message') {
          newChats += 1;
        } else if (isSessionNotification(parsed.data.type)) {
          newCalendar += 1;
        } else {
          newDash += 1;
        }
      }
    }

    // Only increment if we are NOT currently on that specific page
    if (newChats > 0 && location.pathname !== '/patient/') {
      setChatNotifCount((prev) => prev + newChats);
    }
    if (newDash > 0 && location.pathname !== '/patient/dashboard') {
      setDashboardNotifCount((prev) => prev + newDash);
    }
    if (newCalendar > 0 && location.pathname !== '/patient/calendar') {
      setCalendarNotifCount((prev) => prev + newCalendar);
    }
  }, [websocketMessages, location.pathname]);

  // --- Helper to get the correct badge count ---
  const getBadgeCount = (path: string) => {
    // 💡 UX TRICK: Hide the badge immediately if the user is currently on that exact tab!
    // "If I'm looking at it, don't scream at me to look at it."
    if (path === '/patient/' && location.pathname === '/patient/') return 0;
    if (path === '/patient/dashboard' && location.pathname === '/patient/dashboard') return 0;
    if (path === '/patient/calendar' && location.pathname === '/patient/calendar') return 0;

    // Otherwise, show the actual count
    if (path === '/patient/') return chatNotifCount;
    if (path === '/patient/dashboard') return dashboardNotifCount;
    if (path === '/patient/calendar') return calendarNotifCount;

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
            end={item.path === '/patient/'}
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
                    {t('patient.calendar.comingSoon')}
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
    <aside className="w-60 bg-sidebar h-screen sticky top-0 py-6 px-3 overflow-y-auto">
      <SidebarNav />
    </aside>
  );
};

export default Sidebar;