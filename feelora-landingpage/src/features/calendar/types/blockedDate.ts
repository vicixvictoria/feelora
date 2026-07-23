// A one-off exception to the recurring weekly schedule: blocking a specific
// session (one slot) or an entire day on one particular date, without
// touching the recurring template itself (TherapistSettings). There is no
// backend endpoint for this yet (schema.graphql still only has Settings) —
// this type, mockCalendarService's storage, and the UI in
// ManageAvailabilityPage are built ahead of it so the feature is ready to
// wire up to a real createBlockedSession-style mutation once it exists.
export interface BlockedDate {
  date: string; // 'yyyy-MM-dd'
  fullDay: boolean; // true = every slot on this date is blocked, regardless of blockedStartTimes
  blockedStartTimes: string[]; // specific slot start times blocked on this date (ignored when fullDay is true)
}
