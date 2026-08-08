import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GET_OWN_USER_PROFILE_QUERY, GET_MATCHED_THERAPISTS_QUERY } from '../api/patient-service';
import MonthCalendar from '@/features/calendar/components/MonthCalendar';
import AppointmentInfoDialog from '@/features/calendar/components/AppointmentInfoDialog';
import CancelAppointmentDialog from '@/features/calendar/components/CancelAppointmentDialog';
import { sessionService } from '@/features/calendar/api/session-service';
import { Session } from '@/features/calendar/types/session';
import { useWebsocket } from '@/contexts/WebsocketContext';
import {
  notificationService,
  NotificationType,
  SESSION_NOTIFICATION_TYPES,
} from '@/features/notifications/api/notification-service';

const DATE_FORMAT = 'yyyy-MM-dd';

// Mirrors SidebarNav's own local shape for websocket notification payloads —
// see notification-service.ts's schema comment for why type stays a loose
// string here rather than NotificationType (the raw WS payload is untyped JSON).
interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    bookingId?: string;
  };
}
const isSessionNotification = (type?: string) =>
  SESSION_NOTIFICATION_TYPES.includes(type as (typeof SESSION_NOTIFICATION_TYPES)[number]);

const CalendarPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Tracked separately from selectedDate because getOwnSessions requires an
  // explicit [StartingDate, EndDate] range (no "get everything" option) —
  // this is what drives that range, controlling MonthCalendar so we always
  // know which month is actually visible.
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Patient profile and matched therapist come from the real backend
  // (same query pattern as ProfilePage). This is also what enforces "only
  // book with your matched therapist": the booking page simply never has
  // any other therapist to show.
  const { data: patientData, loading: patientLoading } = useQuery(GET_OWN_USER_PROFILE_QUERY);
  const patient = patientData?.getOwnUserProfile;

  const { data: therapistData } = useQuery(GET_MATCHED_THERAPISTS_QUERY, {
    variables: { TherapistsIds: patient?.Matches },
    skip: !patient?.Matches || patient.Matches.length === 0,
  });
  const therapist = therapistData?.getMatchedTherapists?.items?.[0];
  const therapistName = therapist ? `${therapist.Name} ${therapist.Surname}` : '';

  const { messages: websocketMessages } = useWebsocket();
  const processedMessageCountRef = useRef(0);

  const refreshSessions = async () => {
    if (!patient?.Id) return;
    setIsLoading(true);
    try {
      setSessions(
        await sessionService.getSessions(
          'CONFIRMED',
          format(startOfMonth(displayMonth), DATE_FORMAT),
          format(endOfMonth(displayMonth), DATE_FORMAT),
        ),
      );
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error(t('patient.calendar.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // getOwnSessions requires a mandatory date range — re-fetch whenever the
  // patient navigates to a different month in the calendar below.
  useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.Id, displayMonth]);

  // Live-updates the calendar when the therapist books/cancels/updates a
  // session, instead of requiring a manual reload — SidebarNav handles the
  // unread-badge side of these same events when this page isn't open.
  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;
    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    const sessionNotifs = newMessages.filter((msg) => {
      const parsed = msg as IncomingNotification;
      return parsed.type === 'notification' && isSessionNotification(parsed.data?.type);
    });
    if (sessionNotifs.length === 0) return;

    refreshSessions();
    sessionNotifs.forEach((msg) => {
      const parsed = msg as IncomingNotification;
      if (!parsed.data?.type || !parsed.data.bookingId) return;
      notificationService
        .readNotification({
          notificationType: parsed.data.type as NotificationType,
          notificationId: parsed.data.bookingId,
        })
        .then(() => window.dispatchEvent(new Event('notificationsRead')))
        .catch((error) => console.error('Failed to ack session notification:', error));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocketMessages]);

  const appointmentDates = useMemo(
    () => sessions.map((s) => parseISO(s.date)),
    [sessions],
  );

  const selectedDateKey = format(selectedDate, DATE_FORMAT);
  const sessionsForSelectedDate = sessions.filter((s) => s.date === selectedDateKey);

  const handleCancel = async (bookingId: string) => {
    try {
      await sessionService.cancelSession(bookingId);
      await refreshSessions();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.error(t('patient.calendar.actionError'));
    }
  };

  if (patientLoading || !patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('patient.calendar.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="lg:flex-[3]">
          <MonthCalendar
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            appointmentDates={appointmentDates}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
          />
        </div>

        <div className="lg:flex-[2]">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {format(selectedDate, 'd. MMMM yyyy', { locale: de })}
          </h2>

          {isLoading ? (
            <div className="feelora-card flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessionsForSelectedDate.length > 0 ? (
            <div className="space-y-3 mb-6">
              {sessionsForSelectedDate.map((session) => (
                <div key={session.bookingId} className="feelora-card">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">
                        {t('patient.calendar.sessionWith', { name: therapistName })}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.startTime} – {session.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AppointmentInfoDialog session={session} counterpartName={therapistName} />
                      <CancelAppointmentDialog
                        // Each session carries a snapshot of the therapist's
                        // cancellation policy from when it was booked (not a
                        // live fetch of their current settings), so this
                        // stays accurate even if the therapist edits their
                        // policy afterwards. Purely informational — the
                        // cancellation itself is never blocked by it.
                        warningMessage={
                          session.cancellationPolicy?.cancellationPolicy ?? t('patient.calendar.cancelWarning')
                        }
                        onConfirm={() => handleCancel(session.bookingId)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="feelora-card mb-6 text-center text-muted-foreground py-8">
              {t('patient.calendar.noAppointmentsThisDay')}
            </div>
          )}

          {therapist ? (
            <button
              onClick={() => navigate('book')}
              className="feelora-btn-primary"
            >
              {t('patient.calendar.bookAppointment')}
              <CalendarPlus className="w-4 h-4" />
            </button>
          ) : (
            <div className="feelora-card text-center text-muted-foreground">
              {t('patient.calendar.noTherapistForBooking')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
