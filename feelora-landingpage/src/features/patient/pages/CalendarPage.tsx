import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { GET_OWN_USER_PROFILE_QUERY, GET_MATCHED_THERAPISTS_QUERY } from '../api/patient-service';
import MonthCalendar from '@/features/calendar/components/MonthCalendar';
import AppointmentTypeBadge from '@/features/calendar/components/AppointmentTypeBadge';
import AppointmentInfoDialog from '@/features/calendar/components/AppointmentInfoDialog';
import CancelAppointmentDialog from '@/features/calendar/components/CancelAppointmentDialog';
import { mockCalendarService } from '@/features/calendar/api/mockCalendarService';
import { Appointment } from '@/features/calendar/types/appointment';

const DATE_FORMAT = 'yyyy-MM-dd';

const CalendarPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // The therapist's own cancellation-policy text, shown instead of a generic
  // message when the patient goes to cancel. Falls back to that generic
  // copy until it's loaded.
  const [cancellationPolicy, setCancellationPolicy] = useState<string | null>(null);

  // Patient profile and matched therapist come from the real backend
  // (same query pattern as ProfilePage) — only the appointment data itself
  // is mocked. This is also what enforces "only book with your matched
  // therapist": the booking page simply never has any other therapist to show.
  const { data: patientData, loading: patientLoading } = useQuery(GET_OWN_USER_PROFILE_QUERY);
  const patient = patientData?.getOwnUserProfile;

  const { data: therapistData } = useQuery(GET_MATCHED_THERAPISTS_QUERY, {
    variables: { TherapistsIds: patient?.Matches },
    skip: !patient?.Matches || patient.Matches.length === 0,
  });
  const therapist = therapistData?.getMatchedTherapists?.items?.[0];
  const therapistName = therapist ? `${therapist.Name} ${therapist.Surname}` : '';

  useEffect(() => {
    if (!patient?.Id || !therapist?.Id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Seed demo data once per patient/therapist pair, then load whatever's
    // actually stored for this patient (their own bookings + the demo one).
    mockCalendarService.ensureDemoData(therapist.Id, therapistName, patient.Id, `${patient.Name} ${patient.Surname}`);
    mockCalendarService
      .getAppointmentsForPatient(patient.Id)
      .then(setAppointments)
      .finally(() => setIsLoading(false));
    mockCalendarService.getTherapistSettings(therapist.Id).then((settings) => {
      setCancellationPolicy(settings.cancellationPolicy);
    });
  }, [patient?.Id, patient?.Name, patient?.Surname, therapist?.Id, therapistName]);

  const appointmentDates = useMemo(
    () => appointments.map((a) => parseISO(a.date)),
    [appointments],
  );

  const selectedDateKey = format(selectedDate, DATE_FORMAT);
  const appointmentsForSelectedDate = appointments.filter((a) => a.date === selectedDateKey);

  const handleCancel = async (appointmentId: string) => {
    await mockCalendarService.cancelAppointment(appointmentId);
    if (patient?.Id) {
      setAppointments(await mockCalendarService.getAppointmentsForPatient(patient.Id));
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
          ) : appointmentsForSelectedDate.length > 0 ? (
            <div className="space-y-3 mb-6">
              {appointmentsForSelectedDate.map((appointment) => (
                <div key={appointment.id} className="feelora-card">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">
                        {t('patient.calendar.sessionWith', { name: appointment.therapistName })}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {appointment.startTime} – {appointment.endTime}
                      </p>
                      <AppointmentTypeBadge type={appointment.type} />
                    </div>
                    <div className="flex items-center gap-2">
                      <AppointmentInfoDialog appointment={appointment} />
                      <CancelAppointmentDialog
                        warningMessage={cancellationPolicy ?? t('patient.calendar.cancelWarning')}
                        onConfirm={() => handleCancel(appointment.id)}
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
