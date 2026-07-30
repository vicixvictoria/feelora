import { Policy, TimeSlot } from './session';

// The therapist's real recurring schedule, matching the backend's Settings
// type (schema.graphql) — a genuine slot system: each weekday is simply the
// list of individual bookable slots the therapist has placed, no separate
// working-hours boundary and no SlotRange/BreakBetweenSessions (those exist
// only as local UI defaults now, see ManageAvailabilityPage's "Add Slot").
//
// Note the schema has two distinct notice-period fields: `bookingNoticeHours`
// (Settings.MinimalNotice — how soon before its start a slot may still be
// booked) and `cancellationPolicy.minimalNoticeHours` (nested inside
// Settings.CancellationPolicy — the notice period the policy text itself
// refers to). They aren't the same value and both must round-trip.
export interface TherapistSchedule {
  slotsByDay: Record<number, TimeSlot[]>; // 0=Sunday .. 6=Saturday, always present, [] if no slots that day
  bookingNoticeHours: number;
  cancellationPolicy: Policy;
  lastUpdate?: string;
}

// A one-off override for a specific date (backend's OverrideSettings) —
// replaces that date's slots entirely: [] blocks the whole day, a shorter
// list blocks specific slots, a different list can add one-off extra slots
// on a day the therapist doesn't normally work. There is no "delete
// override" mutation — reverting to the recurring schedule means saving an
// override that matches it again.
export interface DateOverride {
  date: string; // 'yyyy-MM-dd'
  availabilities: TimeSlot[];
}
