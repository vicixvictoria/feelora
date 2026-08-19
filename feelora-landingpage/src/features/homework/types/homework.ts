// Homework types
// TherapistId is never supplied by the client (yet) — both
// assignHomework (therapist assigns) and updateOwnHomework (patient updates)
// infer the acting user from the auth token, only PatientId is explicit
// (the therapist picks which patient). A note is sent to the backend as a
// plain string; the resolver builds the HomeworkNote object (From/Type/
// CreatedAt) itself from the auth context.

export type HomeworkStatus = 'IN_PROGRESS' | 'COMPLETED';

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
