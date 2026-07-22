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
  month?: Date;
  onMonthChange?: (date: Date) => void;
  disablePastDates?: boolean;
}

const MonthCalendar = ({
  selected,
  onSelect,
  appointmentDates = [],
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
      // instead of needing a custom day-cell renderer; the class just draws
      // a small CSS dot under the day number via an ::after pseudo-element.
      modifiers={{ hasAppointment: appointmentDates }}
      modifiersClassNames={{
        hasAppointment:
          "after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary",
      }}
      className="feelora-card"
    />
  );
};

export default MonthCalendar;
