// Booking/session types, matching the backend's Session/Policy/DeletionResponse
// types (schema.graphql). Note the schema has no "appointment type"
// (online/in-person/phone) field — a session only ever carries a single
// free-text `address`, filled in by the therapist after booking (see
// AppointmentInfoDialog, which auto-detects a URL vs. plain text for
// display). It also has no patient/therapist display name, only emails —
// callers resolve a display name themselves from profile data they already
// have (the patient's single matched therapist, or the therapist's matched
// patients list).

export type SessionStatus = 'CONFIRMED' | 'CANCELLED';

export interface TimeSlot {
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
}

// Mirrors the backend's Policy type. Also used standalone for the
// therapist's schedule-wide cancellation policy (see schedule.ts).
export interface Policy {
  minimalNoticeHours: number; // how far in advance a cancellation should be made, per the policy text
  cancellationPolicy: string; // free text describing the policy, shown to patients
}

export interface Session {
  bookingId: string;
  patientId: string;
  patientEmail: string;
  therapistId: string;
  therapistEmail: string;
  date: string; // 'yyyy-MM-dd'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  status: SessionStatus;
  createdAt: string;
  lastUpdatedAt: string;
  // Snapshot of the therapist's cancellation policy at the time this session
  // was booked — this is what a cancel dialog should show, not a live fetch
  // of the therapist's current settings, so it stays accurate even if the
  // therapist edits their policy later.
  cancellationPolicy?: Policy;
  cancelledAt?: string;
  cancelledBy?: string;
  address?: string;
}

// Payload for createSession — the backend infers the patient from the auth
// token, so only the therapist/date/time need to be supplied.
export interface CreateSessionInput {
  therapistId: string;
  date: string;
  startTime: string;
  endTime: string;
}

// Mirrors the backend's DeletionResponse. Cancellation is never blocked
// client- or server-side by the notice period — WithinNotice is purely
// informational (e.g. for a toast after the fact).
export interface DeletionResponse {
  deleted: boolean;
  withinNotice: boolean;
  cancellationPolicy?: Policy;
}
