// Homework types
// TherapistId is never supplied by the client (yet) — both
// assignHomework (therapist assigns) and updateOwnHomework (patient updates)
// infer the acting user from the auth token, only PatientId is explicit
// (the therapist picks which patient). A note is sent to the backend as a
// plain string; the resolver builds the HomeworkNote object (From/Type/
// CreatedAt) itself from the auth context.

// NEW = assigned but not yet acted on by the patient, IN_PROGRESS = patient
// has started/left a note, COMPLETED = patient marked it done. The frontend
// never sets NEW itself — it's the resolver's default for a freshly assigned
// homework — but does need to read and display it.
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
  notes: HomeworkNote[];
}

// Payload for assignHomework — PatientId is who the therapist is assigning
// to, TherapistId is inferred server-side from the auth token.
export interface AssignHomeworkInput {
  patientId: string;
  title: string;
  description: string;
}
