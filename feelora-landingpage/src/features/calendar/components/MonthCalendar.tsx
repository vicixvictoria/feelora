// Thin wrapper around the shadcn/react-day-picker Calendar that adds the
// small dot under any date in `appointmentDates`, and an optional
// past-dates-disabled mode for booking/availability pickers. Reused by the
// patient calendar, the therapist calendar's monthly view, the booking
// page's date picker, and the availability manager's date picker.
import { de } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

interface MonthCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  appointmentDates?: Date[];
  // Dates with a one-off block (see BlockedDate) — rendered as a second,
  // differently-colored dot so both can show on the same day at once.
  blockedDates?: Date[];
  month?: Date;
  onMonthChange?: (date: Date) => void;
  disablePastDates?: boolean;
}

const MonthCalendar = ({
  selected,
  onSelect,
  appointmentDates = [],
  blockedDates = [],
  month,
  onMonthChange,
  disablePastDates = false,
}: MonthCalendarProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Calendar
      mode="single"
      locale={de}
      selected={selected}
      onSelect={onSelect}
      month={month}
      onMonthChange={onMonthChange}
      disabled={disablePastDates ? { before: today } : undefined}
      // react-day-picker's "modifiers" API tags matching days with a class
      // instead of needing a custom day-cell renderer; each class just draws
      // a small CSS dot under the day number. hasAppointment uses ::after
      // and hasBlock uses ::before so both dots can render on the same day
      // cell at once (a cell only gets one of each pseudo-element).
      modifiers={{ hasAppointment: appointmentDates, hasBlock: blockedDates }}
      modifiersClassNames={{
        hasAppointment:
          "after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary",
        hasBlock:
          "before:content-[''] before:absolute before:bottom-0.5 before:left-1/2 before:translate-x-1 before:w-1.5 before:h-1.5 before:rounded-full before:bg-destructive",
      }}
      className="feelora-card"
    />
  );
};

export default MonthCalendar;
