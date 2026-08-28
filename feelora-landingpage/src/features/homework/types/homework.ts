// Homework types
// TherapistId is never supplied by the client — assignHomework (therapist
// assigns) infers the acting user from the auth token, only PatientId is
// explicit (the therapist picks which patient).
//
// Notes are a separate entity from Homework (fetched/updated via their own
// getNotes/updateNotes calls, not embedded on Homework) — see HomeworkNotes
// below. By product decision (not an API restriction — updateNotes is
// technically callable by both roles), only the patient writes notes; the
// therapist can only read PatientNotes, and only when the patient has
// chosen to share them (see HomeworkNotes.shareToTherapist).

// NEW = assigned but not yet acted on by the patient, IN_PROGRESS = patient
// has started it, COMPLETED = patient marked it done. The frontend never
// sets NEW itself — it's the resolver's default for a freshly assigned
// homework — but does need to read and display it. Since notes live on a
// separate entity now (see HomeworkNotes below) and updateNotes can't touch
// Status, the frontend is what moves NEW → IN_PROGRESS the moment a patient
// adds their first note — see handleAddNote in patient/pages/HomeworkPage.tsx.
export type HomeworkStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

export type HomeworkNoteAuthorType = 'THERAPIST' | 'PATIENT';

export interface HomeworkNote {
  from: string;
  type: HomeworkNoteAuthorType;
  note: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  patientId: string;
  therapistId: string;
  createdAt: string;
  updatedAt: string;
  status: HomeworkStatus;
  title: string;
  description: string;
}

// The notes side-table for one homework — keyed by the same Id as its
// Homework (there's no separate getNotes(homeworkId) vs. notes.id
// distinction; both mean the same thing). Created lazily by the backend on
// the first updateNotes call, with both share flags defaulting to false, so
// getNotes(id) returns null until either side has written something.
export interface HomeworkNotes {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Whether the patient can see the therapist's notes / the therapist can
  // see the patient's notes. TherapistNotes is always empty today (the
  // therapist has no write UI), so shareToPatient has no visible effect yet
  // — kept for when/if that changes.
  shareToPatient: boolean;
  shareToTherapist: boolean;
  patientNotes: HomeworkNote[];
  therapistNotes: HomeworkNote[];
  therapistId: string;
  patientId: string;
}

// Payload for assignHomework — PatientId is who the therapist is assigning
// to, TherapistId is inferred server-side from the auth token.
export interface AssignHomeworkInput {
  patientId: string;
  title: string;
  description: string;
}
