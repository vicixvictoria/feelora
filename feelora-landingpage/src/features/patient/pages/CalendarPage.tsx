import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Phone, Video, Smile, Plus, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const daysOfWeek = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];

const appointments = [
  {
    title: "Online Therapy Session with Eva",
    time: "at 13:00",
    icon: Video,
    iconColor: "text-primary",
  },
  {
    title: "Weekly Mood Tracker Recording",
    time: "all day",
    icon: Smile,
    iconColor: "text-primary",
  },
];

const emergencyNumbers = [
  {
    name: "Rat auf Draht",
    number: "+43 800 1234",
    description: "Benötigst du dringend Unterstützung? Diese Hotline ist rund um die Uhr erreichbar. Kostenlos.",
  },
  { name: "Other Number", number: "", description: "" },
  { name: "Other Numer", number: "", description: "" },
  { name: "Other Number", number: "", description: "" },
];

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate calendar days for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday
  const daysInMonth = monthEnd.getDate();

  const calendarDays: (number | null)[] = [];
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add the actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex gap-8">
        {/* Coming Soon Watermark */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <p
          className="text-7xl font-extrabold text-primary/20 uppercase tracking-widest select-none"
          style={{ transform: "rotate(-25deg)" }}
        >
          Coming Soon
        </p>
      </div>
        {/* Left Column - Calendar */}
        <div className="flex-1">
          {/* Calendar */}
          <div className="feelora-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h3 className="font-semibold text-foreground">
                {format(currentMonth, "MMMM yyyy", { locale: de })}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm text-muted-foreground font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayDate = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                const isSelected = dayDate && isSameDay(dayDate, selectedDate);
                return (
                  <button
                    key={index}
                    onClick={() => dayDate && setSelectedDate(dayDate)}
                    className={`
                      h-10 rounded-full text-sm font-medium transition-colors
                      ${day === null ? "" : "hover:bg-muted"}
                      ${isSelected ? "bg-primary text-primary-foreground" : "text-foreground"}
                    `}
                    disabled={day === null}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Appointments */}
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {format(selectedDate, "d. MMMM yyyy", { locale: de })}
          </h3>
          <div className="feelora-card space-y-3 mb-6">
            {appointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{apt.title}</p>
                  <p className="text-sm text-muted-foreground">{apt.time}</p>
                </div>
                <button className="feelora-btn-outline">
                  Start
                  <apt.icon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Request Session Button */}
          <div className="flex justify-center">
            <button className="feelora-btn-primary">
              <Clock className="w-4 h-4" />
              Request Session
            </button>
          </div>
        </div>

        {/* Right Column - Appointments & Emergency */}
        <div className="w-96">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Termine eintragen
          </h2>

          {/* Appointment requests */}
          <div className="feelora-card mb-4">
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-foreground">
                Therapie Stunde mit Dr. Eva
              </span>
              <button className="feelora-btn-outline text-sm">
                Request
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="feelora-card mb-8">
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-foreground">
                Anderes Verwalten
              </span>
              <button className="feelora-btn-outline text-sm text-primary">
                new
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Emergency Numbers */}
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Notfall Nummern
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {emergencyNumbers.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="feelora-card border-none"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <span className="font-medium text-foreground">{item.name}</span>
                </AccordionTrigger>
                <AccordionContent>
                  {item.number && (
                    <>
                      <p className="font-semibold text-foreground mb-2">
                        {item.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
