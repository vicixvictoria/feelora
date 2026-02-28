import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Phone, RefreshCw, Plus } from 'lucide-react';
import { addWeeks, subWeeks, startOfWeek, addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Appointment {
  day: number; // 0=Mon, 1=Tue, etc.
  startSlot: number; // index into timeSlots
  span: number; // how many slots wide
  title: string;
  color: 'teal' | 'yellow' | 'peach';
}

const timeSlots = [
  '08:00',
  '08:15',
  '08:30',
  '08:45',
  '09:00',
  '09:15',
  '09:30',
  '09:45',
  '10:00',
  '10:15',
  '10:30',
  '10:45',
  '11:00',
  '11:15',
];

const appointments: Appointment[] = [
  { day: 0, startSlot: 1, span: 7, title: 'Online Therapie Nina', color: 'teal' },
  { day: 1, startSlot: 3, span: 7, title: 'Online Therapie Tom', color: 'teal' },
  { day: 3, startSlot: 6, span: 7, title: 'Erstgespräch Mel', color: 'yellow' },
  { day: 3, startSlot: 11, span: 7, title: 'Online Therapie Jon', color: 'teal' },
  { day: 4, startSlot: 1, span: 7, title: 'Online Therapie Nina', color: 'teal' },
  { day: 4, startSlot: 8, span: 7, title: 'Vor Ort Therapie Tom', color: 'peach' },
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sst', 'Sun'];

const colorMap = {
  teal: 'bg-primary/15 border-primary/30',
  yellow: 'bg-yellow-100 border-yellow-300',
  peach: 'bg-orange-100 border-orange-300',
};

const TherapistCalendarPage = () => {
  const { t } = useTranslation();
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const weekEnd = addDays(currentWeekStart, 6);
  const weekLabel = `${format(currentWeekStart, 'd')}.- ${format(weekEnd, 'd')}. ${format(weekEnd, 'MMMM yyyy', { locale: de })}`;

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative">
      {/* Coming Soon Watermark */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <p
          className="text-7xl font-extrabold text-primary/20 uppercase tracking-widest select-none"
          style={{ transform: 'rotate(-25deg)' }}
        >
          {t('app.therapist.calendar.comingSoon')}
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">{weekLabel}</h1>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <button className="feelora-btn-primary">
          {t('app.therapist.calendar.new')}
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="feelora-card overflow-x-auto">
        {/* Time header */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `100px repeat(${timeSlots.length}, minmax(70px, 1fr))` }}
        >
          <div />
          {timeSlots.map((time) => (
            <div
              key={time}
              className="text-xs text-muted-foreground text-center py-2 border-b border-border"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Day rows */}
        {weekDays.map((date, dayIndex) => {
          const dayAppointments = appointments.filter((a) => a.day === dayIndex);
          return (
            <div
              key={dayIndex}
              className="grid border-b border-border last:border-0"
              style={{
                gridTemplateColumns: `100px repeat(${timeSlots.length}, minmax(70px, 1fr))`,
              }}
            >
              {/* Day label */}
              <div className="flex flex-col items-center justify-center py-4 border-r border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  {dayLabels[dayIndex]}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {format(date, 'dd')}.{format(date, 'MMM', { locale: de })}
                </span>
              </div>

              {/* Time cells with appointments */}
              <div
                className="relative col-span-full"
                style={{
                  gridColumn: `2 / -1`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${timeSlots.length}, minmax(70px, 1fr))`,
                  minHeight: '80px',
                }}
              >
                {/* Grid lines */}
                {timeSlots.map((_, i) => (
                  <div key={i} className="border-r border-border/50" />
                ))}

                {/* Appointments */}
                {dayAppointments.map((apt, aptIndex) => (
                  <div
                    key={aptIndex}
                    className={`absolute top-2 bottom-2 rounded-xl border px-3 py-2 flex flex-col justify-center ${colorMap[apt.color]}`}
                    style={{
                      gridColumn: `${apt.startSlot + 1} / span ${apt.span}`,
                      left: `${(apt.startSlot / timeSlots.length) * 100}%`,
                      width: `${(apt.span / timeSlots.length) * 100}%`,
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground truncate">{apt.title}</p>
                    <div className="flex gap-2 mt-1">
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-primary border border-primary/30 rounded-full px-2 py-0.5 bg-background/80">
                        {t('app.therapist.calendar.startCall')} <Phone className="w-3 h-3" />
                      </button>
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-primary border border-primary/30 rounded-full px-2 py-0.5 bg-background/80">
                        {t('app.therapist.calendar.reschedule')} <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TherapistCalendarPage;
