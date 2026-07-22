import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GET_OWN_USER_PROFILE_QUERY, GET_MATCHED_THERAPISTS_QUERY } from '../api/patient-service';
import MonthCalendar from '@/features/calendar/components/MonthCalendar';
import { mockCalendarService } from '@/features/calendar/api/mockCalendarService';
import { AppointmentType, TimeSlot } from '@/features/calendar/types/appointment';

const DATE_FORMAT = 'yyyy-MM-dd';
const appointmentTypes: AppointmentType[] = ['online', 'in_person', 'phone'];
const typeKey = (type: AppointmentType) => (type === 'in_person' ? 'inPerson' : type);

const BookAppointmentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<AppointmentType>('online');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const { data: patientData, loading: patientLoading } = useQuery(GET_OWN_USER_PROFILE_QUERY);
  const patient = patientData?.getOwnUserProfile;

  const { data: therapistData } = useQuery(GET_MATCHED_THERAPISTS_QUERY, {
    variables: { TherapistsIds: patient?.Matches },
    skip: !patient?.Matches || patient.Matches.length === 0,
  });
  const therapist = therapistData?.getMatchedTherapists?.items?.[0];
  const therapistName = therapist ? `${therapist.Name} ${therapist.Surname}` : '';

  // Re-fetch the therapist's open slots whenever the selected day changes.
  // Note this page never lets the patient pick a different therapist — the
  // matched therapist from the query above is the only one it ever queries.
  useEffect(() => {
    if (!therapist?.Id) return;
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    mockCalendarService
      .getAvailableSlots(therapist.Id, format(selectedDate, DATE_FORMAT))
      .then(setSlots)
      .finally(() => setIsLoadingSlots(false));
  }, [therapist?.Id, selectedDate]);

  // Books immediately — there's no therapist-side confirmation step in this
  // flow. Once booked it's just an appointment the patient can cancel later.
  const handleBook = async () => {
    if (!patient?.Id || !therapist?.Id || !selectedSlot) return;
    setIsBooking(true);
    try {
      await mockCalendarService.bookAppointment({
        patientId: patient.Id,
        patientName: `${patient.Name} ${patient.Surname}`,
        therapistId: therapist.Id,
        therapistName,
        date: format(selectedDate, DATE_FORMAT),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: selectedType,
      });
      toast.success(t('patient.calendar.bookingConfirmed'));
      navigate('/patient/calendar');
    } finally {
      setIsBooking(false);
    }
  };

  if (patientLoading || !patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="feelora-card text-center text-muted-foreground">
        {t('patient.calendar.noTherapistForBooking')}
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/patient/calendar')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('patient.calendar.backToCalendar')}
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('patient.calendar.bookAppointmentWith', { name: therapistName })}
      </h1>

      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-2">{t('calendar.type.label')}</p>
        <div className="flex gap-2">
          {appointmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={
                selectedType === type ? 'feelora-btn-primary text-sm' : 'feelora-btn-outline text-sm'
              }
            >
              {t(`calendar.type.${typeKey(type)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex-1 max-w-md">
          <p className="text-lg font-semibold text-foreground mb-4">
            {t('patient.calendar.dateAndTime')}
          </p>
          <MonthCalendar
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disablePastDates
          />
        </div>

        <div className="flex-1">
          <p className="text-lg font-semibold text-foreground mb-4">
            {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
          </p>

          {isLoadingSlots ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : slots.length > 0 ? (
            <div className="space-y-2 mb-6">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {slot.startTime} – {slot.endTime}
                  {selectedSlot?.startTime === slot.startTime && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="feelora-card text-center text-muted-foreground py-8 mb-6">
              {t('patient.calendar.noSlotsAvailable')}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={!selectedSlot || isBooking}
            className="feelora-btn-primary w-full justify-center disabled:opacity-50"
          >
            {isBooking && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('patient.calendar.confirmBooking')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
