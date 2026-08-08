// A "you have calendar news" card pinned to the right side of the screen
// that requires an explicit click to dismiss (no auto-dismiss timer, no
// outside-click) — but unlike a modal, it has no backdrop, so the rest of
// the app stays fully usable underneath it. Mounted once per app shell
// (patient/therapist AppLayout) so it fires regardless of which page is
// open — deliberately separate from each calendar page's own live-refresh
// listener and from SidebarNav's badge counter, which both independently
// track the same shared websocket `messages` array with their own
// read-cursor (each `useRef` below only affects this component's own copy).
//
// This component never calls readNotification itself: dismissing the card
// only acknowledges "I saw the alert," same as a toast. The actual
// notification only gets cleared (and the sidebar badge cleared with it)
// once the user opens Calendar, matching how a chat toast doesn't mark the
// conversation itself as read.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarCheck, CalendarClock, CalendarX, X } from 'lucide-react';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { NotificationType, SESSION_NOTIFICATION_TYPES } from '@/features/notifications/api/notification-service';
import { sessionService } from '@/features/calendar/api/session-service';
import { Session } from '@/features/calendar/types/session';

interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    bookingId?: string;
  };
}
const isSessionNotification = (type?: string) =>
  SESSION_NOTIFICATION_TYPES.includes(type as (typeof SESSION_NOTIFICATION_TYPES)[number]);

interface QueuedAlert {
  type: NotificationType;
  bookingId: string;
}

const ICON_BY_TYPE: Record<NotificationType, typeof CalendarCheck> = {
  new_session: CalendarCheck,
  updated_session: CalendarClock,
  deleted_session: CalendarX,
  new_message: CalendarCheck,
  new_match: CalendarCheck,
  new_unmatch: CalendarCheck,
};

const TITLE_KEY_BY_TYPE: Record<string, string> = {
  new_session: 'calendar.notification.newTitle',
  updated_session: 'calendar.notification.updatedTitle',
  deleted_session: 'calendar.notification.cancelledTitle',
};

const SessionNotificationModal = () => {
  const { t } = useTranslation();
  const { messages: websocketMessages } = useWebsocket();
  const processedMessageCountRef = useRef(0);
  const [queue, setQueue] = useState<QueuedAlert[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;
    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    const newAlerts: QueuedAlert[] = [];
    newMessages.forEach((msg) => {
      const parsed = msg as IncomingNotification;
      if (parsed.type === 'notification' && isSessionNotification(parsed.data?.type) && parsed.data?.bookingId) {
        newAlerts.push({ type: parsed.data.type as NotificationType, bookingId: parsed.data.bookingId });
      }
    });
    if (newAlerts.length > 0) {
      setQueue((prev) => [...prev, ...newAlerts]);
    }
  }, [websocketMessages]);

  const current = queue[0] ?? null;

  // Only bookingId comes over the wire — fetch the actual date/time to show.
  useEffect(() => {
    if (!current) {
      setSession(null);
      return;
    }
    setIsLoadingSession(true);
    sessionService
      .getSession(current.bookingId)
      .then(setSession)
      .catch((error) => {
        console.error('Failed to load session for notification popup:', error);
        setSession(null);
      })
      .finally(() => setIsLoadingSession(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.bookingId, current?.type]);

  if (!current) return null;

  const Icon = ICON_BY_TYPE[current.type];
  const titleKey = TITLE_KEY_BY_TYPE[current.type];

  const handleDismiss = () => setQueue((prev) => prev.slice(1));

  return (
    <div
      role="alert"
      className="fixed top-20 right-4 left-4 sm:left-auto z-50 w-auto sm:w-96 max-w-full feelora-card border-primary/30 shadow-lg animate-in slide-in-from-right-8 fade-in duration-300"
    >
      <button
        onClick={handleDismiss}
        aria-label={t('calendar.notification.dismiss')}
        className="absolute right-3 top-3 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 pr-6 font-semibold text-foreground">
        <Icon className="w-5 h-5 text-primary shrink-0" />
        {t(titleKey)}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isLoadingSession
          ? t('calendar.notification.loading')
          : session
            ? t('calendar.notification.details', {
                date: format(new Date(session.date), 'd. MMMM yyyy', { locale: de }),
                start: session.startTime,
                end: session.endTime,
              })
            : t('calendar.notification.detailsUnavailable')}
      </p>

      <button onClick={handleDismiss} className="feelora-btn-primary text-sm mt-3 w-full justify-center">
        {t('calendar.notification.dismiss')}
      </button>
    </div>
  );
};

export default SessionNotificationModal;
