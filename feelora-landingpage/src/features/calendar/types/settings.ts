import { TimeSlot } from './appointment';

// Therapist scheduling settings — a recurring weekly template, matching the
// shape of the backend's Settings/Policy types (schema.graphql) rather than
// the old per-date override model: working days repeat identically every
// week, and each working day carries its own set of "HH:mm-HH:mm" hour
// ranges (the backend's current schema uses one shared WorkingHours list
// for every working day; per-day hours is a planned schema change being
// discussed with the backend dev).
//
// Working hours only define the outer timeframe a slot is allowed to fall
// within — they are not auto-sliced into slots. The therapist places each
// bookable slot themselves (slotsByDay), one block at a time, and creates a
// break simply by leaving a gap before the next block instead of butting it
// up against the previous one's end.
export interface TherapistSettings {
  workingDays: number[]; // 0=Sunday .. 6=Saturday, recurring every week
  workingHoursByDay: Partial<Record<number, string[]>>; // per weekday: the outer "HH:mm-HH:mm" window(s) slots may be scheduled within
  slotsByDay: Partial<Record<number, TimeSlot[]>>; // per weekday: the actual bookable appointment blocks, placed individually by the therapist
  slotLengthMinutes: number; // default duration used when adding a new slot block (therapist can still edit it per block)
  breakBetweenSessionsMinutes: number; // default gap suggested before the next slot block when adding one
  minimalNoticeHours: number; // how far in advance a slot must still be open to be bookable; applies to every slot
  cancellationPolicy: string; // free text the therapist writes, shown to patients when they cancel
}
