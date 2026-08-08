import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  addDays,
  addWeeks,
  endOfMonth,
  format,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { GET_OWN_THERAPIST_PROFILE_QUERY, therapistService } from '../api/therapist-service';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Used by the monthly view's day-detail list. The weekly view renders its
// own, more compact session blocks directly in the grid below instead (see
// the `compact` props on AppointmentInfoDialog/CancelAppointmentDialog),
// since a day cell in the grid is much tighter on space than this list.
const AppointmentCard = ({
  session,
  patientName,
  onSaveAddress,
  onCancel,
}: {
  session: Session;
  patientName: string;
  onSaveAddress: (address: string) => Promise<void>;
  onCancel: () => Promise<void>;
}) => {
  const { t } = useTranslation();
  return (
    <div className="feelora-card">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-foreground">{patientName}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {session.startTime} – {session.endTime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AppointmentInfoDialog session={session} counterpartName={patientName} editable onSave={onSaveAddress} />
          <CancelAppointmentDialog
            warningMessage={t('app.therapist.calendar.cancelWarning')}
            onConfirm={onCancel}
          />
        </div>
      </div>
    </div>
  );
};

// One session's compact "chip" in the weekly view, shared between the
// desktop grid (stacked full-width in a day column) and the mobile layout
// (fixed-width, sitting in a day row's horizontal scroller) — only the
// wrapper's own width/shrink behavior differs between the two, via `className`.
const WeekSessionChip = ({
  session,
  patientName,
  onSaveAddress,
  onCancel,
  className = '',
}: {
  session: Session;
  patientName: string;
  onSaveAddress: (address: string) => Promise<void>;
  onCancel: () => Promise<void>;
  className?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className={`rounded-lg border border-primary/30 bg-primary/10 px-2 py-2 ${className}`}>
      <p className="text-xs font-semibold text-foreground truncate">{session.startTime}</p>
      <p className="text-xs text-foreground truncate mb-1.5">{patientName}</p>
      <div className="flex flex-col gap-1">
        <AppointmentInfoDialog
          session={session}
          counterpartName={patientName}
          editable
          compact
          onSave={onSaveAddress}
        />
        <CancelAppointmentDialog
          warningMessage={t('app.therapist.calendar.cancelWarning')}
          onConfirm={onCancel}
          compact
        />
      </div>
    </div>
  );
};

const TherapistCalendarPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Session only carries patientId/patientEmail, not a name — resolved once
  // from the therapist's matched-patients list (same data the chat feature uses).
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});

  const { data: therapistData, loading: therapistLoading } = useQuery(
    GET_OWN_THERAPIST_PROFILE_QUERY,
  );
  const therapist = therapistData?.getOwnTherapistProfile;

  const { messages: websocketMessages } = useWebsocket();
  const processedMessageCountRef = useRef(0);

  useEffect(() => {
    if (!therapist?.Matches || therapist.Matches.length === 0) return;
    therapistService.getMatchedPatients(therapist.Matches).then((patients) => {
      const names: Record<string, string> = {};
      patients.forEach((p: any) => {
        names[p.Id] = `${p.Name} ${p.Surname}`;
      });
      setPatientNames(names);
    });
  }, [therapist?.Matches]);

  const weekEnd = addDays(currentWeekStart, 6);

  const refreshSessions = async () => {
    if (!therapist?.Id) return;
    // getOwnSessions has no "everything" mode — only whichever range is
    // actually on screen gets fetched, so switching tabs (or paging the
    // week/month) always triggers a fresh, differently-scoped query below.
    const [rangeStart, rangeEnd] =
      view === 'weekly'
        ? [currentWeekStart, weekEnd]
        : [startOfMonth(displayMonth), endOfMonth(displayMonth)];
    setIsLoading(true);
    try {
      setSessions(
        await sessionService.getSessions('CONFIRMED', format(rangeStart, DATE_FORMAT), format(rangeEnd, DATE_FORMAT)),
      );
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error(t('app.therapist.calendar.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // getOwnSessions requires a mandatory date range — re-fetch whenever the
  // visible range changes (switching view, paging the week, or navigating
  // the month calendar).
  useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapist?.Id, view, currentWeekStart, displayMonth]);

  // Live-updates the calendar when a patient books/cancels a session, or
  // when this or another tab attaches an address, instead of requiring a
  // manual reload — SidebarNav handles the unread-badge side of these same
  // events when this page isn't open.
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

  const handleSaveAddress = async (bookingId: string, address: string) => {
    try {
      await sessionService.updateSessionAddress(bookingId, address);
      await refreshSessions();
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error(t('app.therapist.calendar.actionError'));
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await sessionService.cancelSession(bookingId);
      await refreshSessions();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.error(t('app.therapist.calendar.actionError'));
    }
  };

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );
  const weekLabel = `${format(currentWeekStart, 'd')}.–${format(weekEnd, 'd')}. ${format(weekEnd, 'MMMM yyyy', { locale: de })}`;

  const appointmentDates = useMemo(() => sessions.map((s) => parseISO(s.date)), [sessions]);
  const selectedDateKey = format(selectedDate, DATE_FORMAT);
  const sessionsForSelectedDate = sessions.filter((s) => s.date === selectedDateKey);

  const patientName = (patientId: string) => patientNames[patientId] ?? t('app.therapist.calendar.unknownPatient');

  if (therapistLoading || !therapist) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as 'weekly' | 'monthly')}>
          <TabsList>
            <TabsTrigger value="weekly">{t('app.therapist.calendar.weekly')}</TabsTrigger>
            <TabsTrigger value="monthly">{t('app.therapist.calendar.monthly')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <button onClick={() => navigate('manage')} className="feelora-btn-outline">
          {t('app.therapist.calendar.manageAvailability')}
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {view === 'weekly' ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{weekLabel}</h1>
            <button
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Mobile (below md): one full-width row per weekday, day
                  label on the left and that day's sessions in a horizontally
                  scrollable strip to its right — swipe if there are more
                  than fit on screen, rather than squeezing 7 columns in. */}
              <div className="feelora-card md:hidden divide-y divide-border">
                {weekDays.map((date) => {
                  const dateKey = format(date, DATE_FORMAT);
                  const daySessions = sessions
                    .filter((s) => s.date === dateKey)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const isCurrentDay = isToday(date);

                  return (
                    <div key={dateKey} className="flex items-stretch gap-3 py-2">
                      <div className="flex flex-col items-center justify-center w-10 shrink-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {format(date, 'EEE', { locale: de })}
                        </p>
                        <p
                          className={`text-sm font-bold mt-0.5 flex items-center justify-center ${
                            isCurrentDay
                              ? 'w-7 h-7 rounded-full bg-primary text-primary-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {format(date, 'd')}
                        </p>
                      </div>
                      {daySessions.length === 0 ? (
                        <p className="flex-1 self-center text-xs text-muted-foreground">—</p>
                      ) : (
                        <div className="flex-1 flex gap-2 overflow-x-auto">
                          {daySessions.map((session) => (
                            <WeekSessionChip
                              key={session.bookingId}
                              session={session}
                              patientName={patientName(session.patientId)}
                              onSaveAddress={(address) => handleSaveAddress(session.bookingId, address)}
                              onCancel={() => handleCancel(session.bookingId)}
                              className="w-36 shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop (md+): agenda-style grid, 7 day columns each
                  stacking that day's session cards vertically (rather than a
                  proportional time-axis layout), so it stays readable at any
                  session length. */}
              <div className="hidden md:block feelora-card overflow-x-auto">
                <div className="grid grid-cols-7 divide-x divide-border min-w-[840px]">
                  {weekDays.map((date) => {
                    const dateKey = format(date, DATE_FORMAT);
                    const daySessions = sessions
                      .filter((s) => s.date === dateKey)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime));
                    const isCurrentDay = isToday(date);

                    return (
                      <div key={dateKey} className="flex flex-col">
                        <div
                          className={`text-center py-3 border-b border-border ${isCurrentDay ? 'bg-primary/5' : ''}`}
                        >
                          <p className="text-xs font-medium text-muted-foreground">
                            {format(date, 'EEE', { locale: de })}
                          </p>
                          <p
                            className={`text-lg font-bold mx-auto mt-0.5 flex items-center justify-center ${
                              isCurrentDay
                                ? 'w-8 h-8 rounded-full bg-primary text-primary-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {format(date, 'd')}
                          </p>
                        </div>
                        <div className="flex-1 p-2 space-y-2 min-h-[220px]">
                          {daySessions.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center mt-4">—</p>
                          ) : (
                            daySessions.map((session) => (
                              <WeekSessionChip
                                key={session.bookingId}
                                session={session}
                                patientName={patientName(session.patientId)}
                                onSaveAddress={(address) => handleSaveAddress(session.bookingId, address)}
                                onCancel={() => handleCancel(session.bookingId)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
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
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sessionsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {sessionsForSelectedDate.map((session) => (
                  <AppointmentCard
                    key={session.bookingId}
                    session={session}
                    patientName={patientName(session.patientId)}
                    onSaveAddress={(address) => handleSaveAddress(session.bookingId, address)}
                    onCancel={() => handleCancel(session.bookingId)}
                  />
                ))}
              </div>
            ) : (
              <div className="feelora-card text-center text-muted-foreground py-8">
                {t('app.therapist.calendar.noAppointmentsThisDay')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendarPage;
