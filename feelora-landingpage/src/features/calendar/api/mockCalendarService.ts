// Stand-in for the not-yet-built appointments/availability backend.
//
// All state lives in plain module-level variables, so it's shared across
// every component that imports this module but resets on every full page
// reload (nothing is persisted to localStorage or a server). Every exported
// method is async and returns Promises the same way an Apollo/GraphQL call
// would, so pages can already be written against the "real" data-fetching
// pattern and later be repointed at actual queries/mutations with minimal
// changes.
//
// Availability is modelled as a recurring weekly template (TherapistSettings)
// rather than per-date overrides, matching the direction of the backend's
// schema.graphql: a therapist picks working days once and they repeat every
// week. Working hours only define the outer timeframe a slot may fall
// within — the actual bookable slots (slotsByDay) are placed one at a time
// by the therapist, and a break is simply the gap they leave before the
// next block. Nothing here auto-slices a range into slots at runtime.
import { addDays, addMinutes, format, getDay, parse } from 'date-fns';
import { Appointment, BookAppointmentInput, TimeSlot } from '../types/appointment';
import { TherapistSettings } from '../types/settings';

const DATE_FORMAT = 'yyyy-MM-dd';
const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';
const NETWORK_DELAY_MS = 250;

const DEFAULT_SETTINGS: Omit<TherapistSettings, 'workingHoursByDay' | 'slotsByDay'> = {
  workingDays: [1, 2, 3, 4, 5], // Mon–Fri
  slotLengthMinutes: 50,
  breakBetweenSessionsMinutes: 10,
  minimalNoticeHours: 24,
  cancellationPolicy: 'Please cancel at least 24 hours before your session.',
};

const appointments: Appointment[] = [];
const settingsByTherapist = new Map<string, TherapistSettings>();
// Track which therapists/patient-therapist pairs have already been seeded
// with demo data, so re-visiting a page doesn't keep appending duplicates.
const seededTherapistIds = new Set<string>();
const seededPairIds = new Set<string>();

// Small artificial latency so loading states are visible, like a real network call.
const delay = () => new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));

// Only used once, to give a freshly-seeded therapist believable starter
// slots — splits one "HH:mm-HH:mm" range into consecutive fixed-length
// blocks with a gap after each. This is NOT run at request time; once
// seeded, slotsByDay is the therapist's own manually-managed list.
const generateStarterSlots = (
  range: string,
  slotLengthMinutes: number,
  breakMinutes: number,
): TimeSlot[] => {
  const [start, end] = range.split('-');
  const slots: TimeSlot[] = [];
  let cursor = parse(start, 'HH:mm', new Date());
  const rangeEnd = parse(end, 'HH:mm', new Date());

  while (addMinutes(cursor, slotLengthMinutes) <= rangeEnd) {
    const slotEnd = addMinutes(cursor, slotLengthMinutes);
    slots.push({ startTime: format(cursor, 'HH:mm'), endTime: format(slotEnd, 'HH:mm') });
    cursor = addMinutes(slotEnd, breakMinutes);
  }
  return slots;
};

// True if `slot` falls fully inside at least one "HH:mm-HH:mm" range — this
// is what makes "working hours" a real constraint rather than decorative:
// a manually-placed slot outside every working-hours window is never
// returned as bookable.
const isWithinAnyRange = (slot: TimeSlot, ranges: string[]): boolean => {
  const slotStart = parse(slot.startTime, 'HH:mm', new Date());
  const slotEnd = parse(slot.endTime, 'HH:mm', new Date());
  return ranges.some((range) => {
    const [start, end] = range.split('-');
    return slotStart >= parse(start, 'HH:mm', new Date()) && slotEnd <= parse(end, 'HH:mm', new Date());
  });
};

// First time a given therapist is seen, set up a default Mon–Fri
// 09:00–17:00 template — plus starter slots generated from it — so the UI
// (booking slots, monthly dots, weekly grid) has something to show before
// the therapist has configured anything themselves via
// ManageAvailabilityPage. Real therapists overwrite this via
// saveTherapistSettings once they place their own slots.
const seedTherapistSettings = (therapistId: string) => {
  if (seededTherapistIds.has(therapistId)) return;
  seededTherapistIds.add(therapistId);

  const workingHoursByDay = {
    1: ['09:00-17:00'],
    2: ['09:00-17:00'],
    3: ['09:00-17:00'],
    4: ['09:00-17:00'],
    5: ['09:00-17:00'],
  };
  const slotsByDay: Record<number, TimeSlot[]> = {};
  Object.entries(workingHoursByDay).forEach(([day, ranges]) => {
    slotsByDay[Number(day)] = ranges.flatMap((range) =>
      generateStarterSlots(range, DEFAULT_SETTINGS.slotLengthMinutes, DEFAULT_SETTINGS.breakBetweenSessionsMinutes),
    );
  });

  settingsByTherapist.set(therapistId, { ...DEFAULT_SETTINGS, workingHoursByDay, slotsByDay });
};

const createAppointment = (input: BookAppointmentInput): Appointment => {
  const appointment: Appointment = {
    id: crypto.randomUUID(),
    ...input,
  };
  appointments.push(appointment);
  return appointment;
};

// First time a given patient/therapist pair is seen, book one demo
// appointment a few days out so the patient's calendar, the therapist's
// calendar, and the dashboard teaser aren't all empty on first load.
const seedDemoAppointment = (
  patientId: string,
  patientName: string,
  therapistId: string,
  therapistName: string,
) => {
  const pairKey = `${patientId}:${therapistId}`;
  if (seededPairIds.has(pairKey)) return;
  seededPairIds.add(pairKey);
  seedTherapistSettings(therapistId);

  const settings = settingsByTherapist.get(therapistId)!;
  const targetDate = addDays(new Date(), 2);
  const slots = settings.slotsByDay[getDay(targetDate)] ?? [];
  const slot = slots[1] ?? slots[0];
  if (!slot) return;

  createAppointment({
    patientId,
    patientName,
    therapistId,
    therapistName,
    date: format(targetDate, DATE_FORMAT),
    startTime: slot.startTime,
    endTime: slot.endTime,
    type: 'online',
    meetingLink: 'https://meet.feelora.com/demo-room',
  });
};

export const mockCalendarService = {
  // Call once per page load (patient/therapist calendar, dashboard) before
  // reading data, so there's always something to render. Safe to call
  // repeatedly — seeding is idempotent per therapist/pair (see the Sets above).
  ensureDemoData(
    therapistId: string,
    therapistName: string,
    patientId?: string,
    patientName?: string,
  ) {
    seedTherapistSettings(therapistId);
    if (patientId && patientName) {
      seedDemoAppointment(patientId, patientName, therapistId, therapistName);
    }
  },

  async getAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
    await delay();
    return appointments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  },

  async getAppointmentsForTherapist(therapistId: string): Promise<Appointment[]> {
    await delay();
    return appointments
      .filter((a) => a.therapistId === therapistId)
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  },

  // Returns the therapist's manually-placed slots for `date` — filtered to
  // that weekday being a working day, falling inside working hours,
  // excluding anything already booked, and excluding anything starting
  // sooner than minimalNoticeHours from now. This is what
  // BookAppointmentPage lists as choosable times.
  async getAvailableSlots(therapistId: string, date: string): Promise<TimeSlot[]> {
    await delay();
    seedTherapistSettings(therapistId);
    const settings = settingsByTherapist.get(therapistId)!;
    const weekday = getDay(parse(date, DATE_FORMAT, new Date()));
    if (!settings.workingDays.includes(weekday)) return [];

    const boundaryRanges = settings.workingHoursByDay[weekday] ?? [];
    const daySlots = (settings.slotsByDay[weekday] ?? []).filter((slot) =>
      isWithinAnyRange(slot, boundaryRanges),
    );

    const earliestBookable = addMinutes(new Date(), settings.minimalNoticeHours * 60);
    const bookedStartTimes = new Set(
      appointments
        .filter((a) => a.therapistId === therapistId && a.date === date)
        .map((a) => a.startTime),
    );

    return daySlots.filter((slot) => {
      if (bookedStartTimes.has(slot.startTime)) return false;
      const slotStart = parse(`${date} ${slot.startTime}`, DATE_TIME_FORMAT, new Date());
      return slotStart >= earliestBookable;
    });
  },

  async bookAppointment(input: BookAppointmentInput): Promise<Appointment> {
    await delay();
    return createAppointment(input);
  },

  // Lets a therapist attach/edit the meeting link, address, or phone number
  // for an appointment after it's been booked (used by the editable variant
  // of AppointmentInfoDialog).
  async updateAppointmentDetails(
    appointmentId: string,
    details: { meetingLink?: string; location?: string },
  ): Promise<Appointment | undefined> {
    await delay();
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return undefined;
    Object.assign(appointment, details);
    return appointment;
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await delay();
    const index = appointments.findIndex((a) => a.id === appointmentId);
    if (index !== -1) appointments.splice(index, 1);
  },

  async getTherapistSettings(therapistId: string): Promise<TherapistSettings> {
    await delay();
    seedTherapistSettings(therapistId);
    return settingsByTherapist.get(therapistId)!;
  },

  // Mirrors the backend's createSettings/updateSettings as a single upsert,
  // since the mock has no separate "does a settings row already exist" state.
  async saveTherapistSettings(therapistId: string, settings: TherapistSettings): Promise<void> {
    await delay();
    settingsByTherapist.set(therapistId, settings);
  },
};
