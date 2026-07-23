import { TimeSlot } from './appointment';

// Therapist scheduling settings — a recurring weekly template, matching the
// backend's Settings/Policy types (schema.graphql): every weekday (Mon..Sun
// on the backend, 0=Sunday..6=Saturday here) always has an hours entry —
// there's no separate "which days do I work" list. An empty array for a
// day means the therapist doesn't work that day; it's never omitted. The
// same template applies to every future week — there's no way to change a
// single occurrence without affecting all the others (a "block this one
// session/day" endpoint is planned backend-side but doesn't exist yet).
//
// Working hours only define the outer timeframe a slot is allowed to fall
// within — they are not auto-sliced into slots. The therapist places each
// bookable slot themselves (slotsByDay), one block at a time, and creates a
// break simply by leaving a gap before the next block instead of butting it
// up against the previous one's end.
export interface TherapistSettings {
  workingHoursByDay: Record<number, string[]>; // every weekday 0-6 always present; the outer "HH:mm-HH:mm" window(s) slots may be scheduled within, [] if not a working day
  slotsByDay: Partial<Record<number, TimeSlot[]>>; // per weekday: the actual bookable appointment blocks, placed individually by the therapist
  slotLengthMinutes: number; // default duration used when adding a new slot block (therapist can still edit it per block)
  breakBetweenSessionsMinutes: number; // default gap suggested before the next slot block when adding one
  minimalNoticeHours: number; // how far in advance a slot must still be open to be bookable; applies to every slot
  cancellationPolicy: string; // free text the therapist writes, shown to patients when they cancel
}
