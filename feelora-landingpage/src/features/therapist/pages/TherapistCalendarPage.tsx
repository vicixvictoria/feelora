import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  addDays,
  addWeeks,
  format,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Settings2 } from 'lucide-react';
import { GET_OWN_THERAPIST_PROFILE_QUERY } from '../api/therapist-service';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonthCalendar from '@/features/calendar/components/MonthCalendar';
import AppointmentTypeBadge from '@/features/calendar/components/AppointmentTypeBadge';
import AppointmentInfoDialog from '@/features/calendar/components/AppointmentInfoDialog';
import CancelAppointmentDialog from '@/features/calendar/components/CancelAppointmentDialog';
import { mockCalendarService } from '@/features/calendar/api/mockCalendarService';
import { Appointment } from '@/features/calendar/types/appointment';

const DATE_FORMAT = 'yyyy-MM-dd';

// Used by the monthly view's day-detail list. The weekly view renders its
// own, more compact appointment blocks directly in the grid below instead
// (see the `compact` props on AppointmentInfoDialog/CancelAppointmentDialog),
// since a day cell in the grid is much tighter on space than this list.
const AppointmentCard = ({
  appointment,
  onSaveDetails,
  onCancel,
}: {
  appointment: Appointment;
  onSaveDetails: (details: { meetingLink?: string; location?: string }) => Promise<void>;
  onCancel: () => Promise<void>;
}) => {
  const { t } = useTranslation();
  return (
    <div className="feelora-card">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-foreground">{appointment.patientName}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {appointment.startTime} – {appointment.endTime}
          </p>
          <AppointmentTypeBadge type={appointment.type} />
        </div>
        <div className="flex items-center gap-2">
          <AppointmentInfoDialog appointment={appointment} editable onSave={onSaveDetails} />
          <CancelAppointmentDialog
            warningMessage={t('app.therapist.calendar.cancelWarning')}
            onConfirm={onCancel}
          />
        </div>
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: therapistData, loading: therapistLoading } = useQuery(
    GET_OWN_THERAPIST_PROFILE_QUERY,
  );
  const therapist = therapistData?.getOwnTherapistProfile;
  const therapistName = therapist ? `${therapist.Name} ${therapist.Surname}` : '';

  const refreshAppointments = async (therapistId: string) => {
    setIsLoading(true);
    try {
      setAppointments(await mockCalendarService.getAppointmentsForTherapist(therapistId));
    } finally {
      setIsLoading(false);
    }
  };

  // Seed a demo appointment with a placeholder patient so the calendar isn't
  // empty even if no real patient has been through the booking flow yet in
  // this browser session (appointment data is in-memory only, see
  // mockCalendarService.ts).
  useEffect(() => {
    if (!therapist?.Id) return;
    mockCalendarService.ensureDemoData(therapist.Id, therapistName, 'demo-patient-preview', 'Nina Muster');
    refreshAppointments(therapist.Id);
  }, [therapist?.Id, therapistName]);

  const handleSaveDetails = async (
    appointmentId: string,
    details: { meetingLink?: string; location?: string },
  ) => {
    await mockCalendarService.updateAppointmentDetails(appointmentId, details);
    if (therapist?.Id) await refreshAppointments(therapist.Id);
  };

  const handleCancel = async (appointmentId: string) => {
    await mockCalendarService.cancelAppointment(appointmentId);
    if (therapist?.Id) await refreshAppointments(therapist.Id);
  };

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );
  const weekEnd = addDays(currentWeekStart, 6);
  const weekLabel = `${format(currentWeekStart, 'd')}.–${format(weekEnd, 'd')}. ${format(weekEnd, 'MMMM yyyy', { locale: de })}`;

  const appointmentDates = useMemo(() => appointments.map((a) => parseISO(a.date)), [appointments]);
  const selectedDateKey = format(selectedDate, DATE_FORMAT);
  const appointmentsForSelectedDate = appointments.filter((a) => a.date === selectedDateKey);

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
            // Agenda-style grid: 7 day columns, each stacking that day's
            // appointment cards vertically (rather than a proportional
            // time-axis layout), so it stays readable at any session length.
            <div className="feelora-card overflow-x-auto">
              <div className="grid grid-cols-7 divide-x divide-border min-w-[840px]">
                {weekDays.map((date) => {
                  const dateKey = format(date, DATE_FORMAT);
                  const dayAppointments = appointments
                    .filter((a) => a.date === dateKey)
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
                        {dayAppointments.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center mt-4">—</p>
                        ) : (
                          dayAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="rounded-lg border border-primary/30 bg-primary/10 px-2 py-2"
                            >
                              <p className="text-xs font-semibold text-foreground truncate">
                                {appointment.startTime}
                              </p>
                              <p className="text-xs text-foreground truncate mb-1.5">
                                {appointment.patientName}
                              </p>
                              <div className="flex flex-col gap-1">
                                <AppointmentInfoDialog
                                  appointment={appointment}
                                  editable
                                  compact
                                  onSave={(details) => handleSaveDetails(appointment.id, details)}
                                />
                                <CancelAppointmentDialog
                                  warningMessage={t('app.therapist.calendar.cancelWarning')}
                                  onConfirm={() => handleCancel(appointment.id)}
                                  compact
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:flex-[3]">
            <MonthCalendar
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              appointmentDates={appointmentDates}
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
            ) : appointmentsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {appointmentsForSelectedDate.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onSaveDetails={(details) => handleSaveDetails(appointment.id, details)}
                    onCancel={() => handleCancel(appointment.id)}
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
