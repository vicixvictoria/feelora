// PORTFOLIO DEMO MODE: the backend is offline, so the real API calls below are
// commented out (not deleted) and `homeworkService` at the bottom of this file
// serves demo data from src/mocks instead.
//
// Homework Service for APIs Shared by the therapist's homework page
// (assignHomework/updateHomework/deleteHomework/getPatientHomeworks — auth
// group "type:T") and the patient's homework page
// (updateOwnHomework/getOwnHomeworks — auth group "type:U"). getHomework is
// readable by both.
//
// Notes live on a separate Notes entity (getNotes/updateNotes), not on
// Homework itself. updateNotes is technically callable by both auth groups,
// but only the patient-facing UI calls it — see HomeworkNotes in
// types/homework.ts for why.
// import { gql } from '@apollo/client';
// import { apolloClient } from '@/lib/apollo-client';
import { AssignHomeworkInput, Homework, HomeworkNote, HomeworkNotes, HomeworkStatus } from '../types/homework';
import { db, getCurrentUserId, notifyDemoStoreChanged, respond } from '@/mocks/demo-store';
import type { NotificationItem } from '@/features/notifications/api/notification-service';

// const HOMEWORK_NOTE_FIELDS = `
//   From
//   Type
//   Note
//   CreatedAt
// `;
//
// const HOMEWORK_FIELDS = `
//   Id
//   PatientId
//   TherapistId
//   CreatedAt
//   UpdatedAt
//   Status
//   Title
//   Description
// `;
//
// const NOTES_FIELDS = `
//   Id
//   CreatedAt
//   UpdatedAt
//   ShareToPatient
//   ShareToTherapist
//   PatientNotes { ${HOMEWORK_NOTE_FIELDS} }
//   TherapistNotes { ${HOMEWORK_NOTE_FIELDS} }
//   TherapistId
//   PatientId
// `;
//
// const GET_HOMEWORK_QUERY = gql`
//   query GetHomework($id: ID!) {
//     getHomework(Id: $id) { ${HOMEWORK_FIELDS} }
//   }
// `;
//
// const GET_PATIENT_HOMEWORKS_QUERY = gql`
//   query GetPatientHomeworks($patientId: ID!, $nextToken: String) {
//     getPatientHomeworks(PatientId: $patientId, NextToken: $nextToken) {
//       items { ${HOMEWORK_FIELDS} }
//       nextToken
//     }
//   }
// `;
//
// const GET_OWN_HOMEWORKS_QUERY = gql`
//   query GetOwnHomeworks($nextToken: String) {
//     getOwnHomeworks(NextToken: $nextToken) {
//       items { ${HOMEWORK_FIELDS} }
//       nextToken
//     }
//   }
// `;
//
// const GET_NOTES_QUERY = gql`
//   query GetNotes($id: ID!) {
//     getNotes(Id: $id) { ${NOTES_FIELDS} }
//   }
// `;
//
// const ASSIGN_HOMEWORK_MUTATION = gql`
//   mutation AssignHomework($input: AssignHomeworkInput!) {
//     assignHomework(input: $input) { ${HOMEWORK_FIELDS} }
//   }
// `;
//
// const UPDATE_OWN_HOMEWORK_MUTATION = gql`
//   mutation UpdateOwnHomework($id: ID!, $status: HomeworkStatus) {
//     updateOwnHomework(Id: $id, Status: $status) { ${HOMEWORK_FIELDS} }
//   }
// `;
//
// const UPDATE_HOMEWORK_MUTATION = gql`
//   mutation UpdateHomework($id: ID!, $title: String, $description: String) {
//     updateHomework(Id: $id, Title: $title, Description: $description) { ${HOMEWORK_FIELDS} }
//   }
// `;
//
// const UPDATE_NOTES_MUTATION = gql`
//   mutation UpdateNotes($id: ID!, $note: String, $share: Boolean) {
//     updateNotes(Id: $id, Note: $note, Share: $share) { ${NOTES_FIELDS} }
//   }
// `;
//
// const DELETE_HOMEWORK_MUTATION = gql`
//   mutation DeleteHomework($id: ID!) {
//     deleteHomework(Id: $id)
//   }
// `;
//
// interface RemoteHomeworkNote {
//   From: string;
//   Type: HomeworkNote['type'];
//   Note: string;
//   CreatedAt: string;
// }
//
// interface RemoteHomework {
//   Id: string;
//   PatientId: string;
//   TherapistId: string;
//   CreatedAt: string;
//   UpdatedAt: string;
//   Status: HomeworkStatus;
//   Title: string;
//   Description: string;
// }
//
// interface RemoteNotes {
//   Id: string;
//   CreatedAt: string;
//   UpdatedAt: string;
//   ShareToPatient: boolean;
//   ShareToTherapist: boolean;
//   PatientNotes: (RemoteHomeworkNote | null)[] | null;
//   TherapistNotes: (RemoteHomeworkNote | null)[] | null;
//   TherapistId: string;
//   PatientId: string;
// }
//
// const toHomeworkNote = (note: RemoteHomeworkNote): HomeworkNote => ({
//   from: note.From,
//   type: note.Type,
//   note: note.Note,
//   createdAt: note.CreatedAt,
// });
//
// const toHomeworkNoteList = (notes: (RemoteHomeworkNote | null)[] | null): HomeworkNote[] =>
//   (notes ?? []).filter((note): note is RemoteHomeworkNote => note != null).map(toHomeworkNote);
//
// const toHomework = (remote: RemoteHomework): Homework => ({
//   id: remote.Id,
//   patientId: remote.PatientId,
//   therapistId: remote.TherapistId,
//   createdAt: remote.CreatedAt,
//   updatedAt: remote.UpdatedAt,
//   status: remote.Status,
//   title: remote.Title,
//   description: remote.Description,
// });
//
// const toHomeworkNotes = (remote: RemoteNotes): HomeworkNotes => ({
//   id: remote.Id,
//   createdAt: remote.CreatedAt,
//   updatedAt: remote.UpdatedAt,
//   shareToPatient: remote.ShareToPatient,
//   shareToTherapist: remote.ShareToTherapist,
//   patientNotes: toHomeworkNoteList(remote.PatientNotes),
//   therapistNotes: toHomeworkNoteList(remote.TherapistNotes),
//   therapistId: remote.TherapistId,
//   patientId: remote.PatientId,
// });
//
// export const homeworkService = {
//   async getHomework(id: string): Promise<Homework | null> {
//     const { data } = await apolloClient.query({
//       query: GET_HOMEWORK_QUERY,
//       variables: { id },
//       fetchPolicy: 'network-only',
//     });
//     return data.getHomework ? toHomework(data.getHomework) : null;
//   },
//
//   // Therapist-only: every homework assigned to one specific patient, followed
//   // to the end of pagination since the homework page needs the full list at once.
//   async getPatientHomeworks(patientId: string): Promise<Homework[]> {
//     const items: Homework[] = [];
//     let nextToken: string | undefined;
//     do {
//       const { data } = await apolloClient.query({
//         query: GET_PATIENT_HOMEWORKS_QUERY,
//         variables: { patientId, nextToken },
//         fetchPolicy: 'network-only',
//       });
//       items.push(...data.getPatientHomeworks.items.map(toHomework));
//       nextToken = data.getPatientHomeworks.nextToken ?? undefined;
//     } while (nextToken);
//     return items;
//   },
//
//   // Patient-only: every homework assigned to the current user (auth-inferred).
//   async getOwnHomeworks(): Promise<Homework[]> {
//     const items: Homework[] = [];
//     let nextToken: string | undefined;
//     do {
//       const { data } = await apolloClient.query({
//         query: GET_OWN_HOMEWORKS_QUERY,
//         variables: { nextToken },
//         fetchPolicy: 'network-only',
//       });
//       items.push(...data.getOwnHomeworks.items.map(toHomework));
//       nextToken = data.getOwnHomeworks.nextToken ?? undefined;
//     } while (nextToken);
//     return items;
//   },
//
//   // Readable by both roles. Returns null when nobody has ever called
//   // updateNotes for this homework yet (the Notes record is created lazily).
//   async getNotes(id: string): Promise<HomeworkNotes | null> {
//     const { data } = await apolloClient.query({
//       query: GET_NOTES_QUERY,
//       variables: { id },
//       fetchPolicy: 'network-only',
//     });
//     return data.getNotes ? toHomeworkNotes(data.getNotes) : null;
//   },
//
//   // Therapist-only: assigns a new homework to a patient.
//   async assignHomework(input: AssignHomeworkInput): Promise<Homework> {
//     const { data } = await apolloClient.mutate({
//       mutation: ASSIGN_HOMEWORK_MUTATION,
//       variables: {
//         input: {
//           PatientId: input.patientId,
//           Title: input.title,
//           Description: input.description,
//         },
//       },
//     });
//     return toHomework(data.assignHomework);
//   },
//
//   // Patient-only: updates the status of their own homework.
//   async updateOwnHomework(id: string, status: HomeworkStatus): Promise<Homework> {
//     const { data } = await apolloClient.mutate({
//       mutation: UPDATE_OWN_HOMEWORK_MUTATION,
//       variables: { id, status },
//     });
//     return toHomework(data.updateOwnHomework);
//   },
//
//   // Therapist-only: edits title/description.
//   async updateHomework(id: string, updates: { title?: string; description?: string }): Promise<Homework> {
//     const { data } = await apolloClient.mutate({
//       mutation: UPDATE_HOMEWORK_MUTATION,
//       variables: { id, title: updates.title ?? null, description: updates.description ?? null },
//     });
//     return toHomework(data.updateHomework);
//   },
//
//   // Patient-only by product decision (the mutation itself allows both auth
//   // groups — see the file header comment). Note and Share are independently
//   // optional, so this covers three call shapes: adding a note (share
//   // omitted, leaves sharing unchanged), flipping the share toggle on its own
//   // (note omitted, leaves notes unchanged), or both at once.
//   async updateNotes(id: string, updates: { note?: string; share?: boolean }): Promise<HomeworkNotes> {
//     const { data } = await apolloClient.mutate({
//       mutation: UPDATE_NOTES_MUTATION,
//       variables: { id, note: updates.note ?? null, share: updates.share ?? null },
//     });
//     return toHomeworkNotes(data.updateNotes);
//   },
//
//   // Therapist-only.
//   async deleteHomework(id: string): Promise<boolean> {
//     const { data } = await apolloClient.mutate({
//       mutation: DELETE_HOMEWORK_MUTATION,
//       variables: { id },
//     });
//     return data.deleteHomework;
//   },
// };

// --- Demo Service Object (portfolio mode — serves src/mocks data, no network) --- //

const findHomework = (id: string): Homework => {
  const homework = db.homeworks.find((h) => h.id === id);
  if (!homework) throw new Error(`Homework ${id} not found`);
  return homework;
};

const newestFirst = (a: Homework, b: Homework) => b.createdAt.localeCompare(a.createdAt);

// Mirrors the backend's homework notifications to the other side.
const notifyHomework = (recipientId: string, type: 'new_homework' | 'updated_homework', homeworkId: string) => {
  const inbox = (db.notifications[recipientId] ??= []).filter(
    (n) => !(n.type === type && n.homeworkId === homeworkId),
  );
  const timestamp = new Date().toISOString();
  const item: NotificationItem = {
    recipientId,
    sk: `${type}#${homeworkId}`,
    type,
    homeworkId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.notifications[recipientId] = [...inbox, item];
};

export const homeworkService = {
  async getHomework(id: string): Promise<Homework | null> {
    return respond(db.homeworks.find((h) => h.id === id) ?? null);
  },

  async getPatientHomeworks(patientId: string): Promise<Homework[]> {
    return respond(db.homeworks.filter((h) => h.patientId === patientId).sort(newestFirst));
  },

  async getOwnHomeworks(): Promise<Homework[]> {
    const userId = getCurrentUserId();
    return respond(db.homeworks.filter((h) => h.patientId === userId).sort(newestFirst));
  },

  async getNotes(id: string): Promise<HomeworkNotes | null> {
    return respond(db.homeworkNotes[id] ?? null);
  },

  async assignHomework(input: AssignHomeworkInput): Promise<Homework> {
    const timestamp = new Date().toISOString();
    const homework: Homework = {
      id: `demo-homework-${Date.now()}`,
      patientId: input.patientId,
      therapistId: getCurrentUserId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'NEW',
      title: input.title,
      description: input.description,
    };
    db.homeworks.push(homework);
    notifyHomework(input.patientId, 'new_homework', homework.id);
    notifyDemoStoreChanged();
    return respond(homework, 400);
  },

  async updateOwnHomework(id: string, status: HomeworkStatus): Promise<Homework> {
    const homework = findHomework(id);
    homework.status = status;
    homework.updatedAt = new Date().toISOString();
    notifyHomework(homework.therapistId, 'updated_homework', id);
    notifyDemoStoreChanged();
    return respond(homework, 300);
  },

  async updateHomework(id: string, updates: { title?: string; description?: string }): Promise<Homework> {
    const homework = findHomework(id);
    if (updates.title !== undefined) homework.title = updates.title;
    if (updates.description !== undefined) homework.description = updates.description;
    homework.updatedAt = new Date().toISOString();
    notifyDemoStoreChanged();
    return respond(homework, 300);
  },

  async updateNotes(id: string, updates: { note?: string; share?: boolean }): Promise<HomeworkNotes> {
    const homework = findHomework(id);
    const timestamp = new Date().toISOString();
    // Created lazily on the first write, like the real Notes entity.
    const notes = (db.homeworkNotes[id] ??= {
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      shareToPatient: false,
      shareToTherapist: false,
      patientNotes: [],
      therapistNotes: [],
      therapistId: homework.therapistId,
      patientId: homework.patientId,
    });
    if (updates.note) {
      const note: HomeworkNote = { from: getCurrentUserId(), type: 'PATIENT', note: updates.note, createdAt: timestamp };
      notes.patientNotes.push(note);
    }
    if (updates.share !== undefined) notes.shareToTherapist = updates.share;
    notes.updatedAt = timestamp;
    notifyDemoStoreChanged();
    return respond(notes, 300);
  },

  async deleteHomework(id: string): Promise<boolean> {
    db.homeworks = db.homeworks.filter((h) => h.id !== id);
    delete db.homeworkNotes[id];
    notifyDemoStoreChanged();
    return respond(true, 300);
  },
};
