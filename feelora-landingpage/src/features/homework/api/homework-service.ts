// Homework Service for APIs Shared by the therapist's homework page
// (assignHomework/updateHomework/deleteHomework/getPatientHomeworks — auth
// group "type:T") and the patient's homework page
// (updateOwnHomework/getOwnHomeworks — auth group "type:U"). getHomework is
// readable by both.
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { AssignHomeworkInput, Homework, HomeworkNote, HomeworkStatus } from '../types/homework';

const HOMEWORK_NOTE_FIELDS = `
  From
  Type
  Note
  CreatedAt
`;

const HOMEWORK_FIELDS = `
  Id
  PatientId
  TherapistId
  CreatedAt
  UpdatedAt
  Status
  Title
  Description
  Notes { ${HOMEWORK_NOTE_FIELDS} }
`;

const GET_HOMEWORK_QUERY = gql`
  query GetHomework($id: ID!) {
    getHomework(Id: $id) { ${HOMEWORK_FIELDS} }
  }
`;

const GET_PATIENT_HOMEWORKS_QUERY = gql`
  query GetPatientHomeworks($patientId: ID!, $nextToken: String) {
    getPatientHomeworks(PatientId: $patientId, NextToken: $nextToken) {
      items { ${HOMEWORK_FIELDS} }
      nextToken
    }
  }
`;

const GET_OWN_HOMEWORKS_QUERY = gql`
  query GetOwnHomeworks($nextToken: String) {
    getOwnHomeworks(NextToken: $nextToken) {
      items { ${HOMEWORK_FIELDS} }
      nextToken
    }
  }
`;

const ASSIGN_HOMEWORK_MUTATION = gql`
  mutation AssignHomework($input: AssignHomeworkInput!) {
    assignHomework(input: $input) { ${HOMEWORK_FIELDS} }
  }
`;

const UPDATE_OWN_HOMEWORK_MUTATION = gql`
  mutation UpdateOwnHomework($id: ID!, $status: HomeworkStatus, $note: String) {
    updateOwnHomework(Id: $id, Status: $status, Note: $note) { ${HOMEWORK_FIELDS} }
  }
`;

const UPDATE_HOMEWORK_MUTATION = gql`
  mutation UpdateHomework($id: ID!, $title: String, $description: String, $note: String) {
    updateHomework(Id: $id, Title: $title, Description: $description, Note: $note) { ${HOMEWORK_FIELDS} }
  }
`;

const DELETE_HOMEWORK_MUTATION = gql`
  mutation DeleteHomework($id: ID!) {
    deleteHomework(Id: $id)
  }
`;

interface RemoteHomeworkNote {
  From: string;
  Type: HomeworkNote['type'];
  Note: string;
  CreatedAt: string;
}

interface RemoteHomework {
  Id: string;
  PatientId: string;
  TherapistId: string;
  CreatedAt: string;
  UpdatedAt: string;
  Status: HomeworkStatus;
  Title: string;
  Description: string;
  Notes: (RemoteHomeworkNote | null)[] | null;
}

const toHomeworkNote = (note: RemoteHomeworkNote): HomeworkNote => ({
  from: note.From,
  type: note.Type,
  note: note.Note,
  createdAt: note.CreatedAt,
});

const toHomework = (remote: RemoteHomework): Homework => ({
  id: remote.Id,
  patientId: remote.PatientId,
  therapistId: remote.TherapistId,
  createdAt: remote.CreatedAt,
  updatedAt: remote.UpdatedAt,
  status: remote.Status,
  title: remote.Title,
  description: remote.Description,
  notes: (remote.Notes ?? []).filter((note): note is RemoteHomeworkNote => note != null).map(toHomeworkNote),
});

export const homeworkService = {
  async getHomework(id: string): Promise<Homework | null> {
    const { data } = await apolloClient.query({
      query: GET_HOMEWORK_QUERY,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return data.getHomework ? toHomework(data.getHomework) : null;
  },

  // Therapist-only: every homework assigned to one specific patient, followed
  // to the end of pagination since the homework page needs the full list at once.
  async getPatientHomeworks(patientId: string): Promise<Homework[]> {
    const items: Homework[] = [];
    let nextToken: string | undefined;
    do {
      const { data } = await apolloClient.query({
        query: GET_PATIENT_HOMEWORKS_QUERY,
        variables: { patientId, nextToken },
        fetchPolicy: 'network-only',
      });
      items.push(...data.getPatientHomeworks.items.map(toHomework));
      nextToken = data.getPatientHomeworks.nextToken ?? undefined;
    } while (nextToken);
    return items;
  },

  // Patient-only: every homework assigned to the current user (auth-inferred).
  async getOwnHomeworks(): Promise<Homework[]> {
    const items: Homework[] = [];
    let nextToken: string | undefined;
    do {
      const { data } = await apolloClient.query({
        query: GET_OWN_HOMEWORKS_QUERY,
        variables: { nextToken },
        fetchPolicy: 'network-only',
      });
      items.push(...data.getOwnHomeworks.items.map(toHomework));
      nextToken = data.getOwnHomeworks.nextToken ?? undefined;
    } while (nextToken);
    return items;
  },

  // Therapist-only: assigns a new homework to a patient.
  async assignHomework(input: AssignHomeworkInput): Promise<Homework> {
    const { data } = await apolloClient.mutate({
      mutation: ASSIGN_HOMEWORK_MUTATION,
      variables: {
        input: {
          PatientId: input.patientId,
          Title: input.title,
          Description: input.description,
        },
      },
    });
    return toHomework(data.assignHomework);
  },

  // Patient-only: updates status and/or adds a note to their own homework.
  async updateOwnHomework(id: string, updates: { status?: HomeworkStatus; note?: string }): Promise<Homework> {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_OWN_HOMEWORK_MUTATION,
      variables: { id, status: updates.status ?? null, note: updates.note ?? null },
    });
    return toHomework(data.updateOwnHomework);
  },

  // Therapist-only: edits title/description and/or adds a note.
  async updateHomework(
    id: string,
    updates: { title?: string; description?: string; note?: string },
  ): Promise<Homework> {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_HOMEWORK_MUTATION,
      variables: {
        id,
        title: updates.title ?? null,
        description: updates.description ?? null,
        note: updates.note ?? null,
      },
    });
    return toHomework(data.updateHomework);
  },

  // Therapist-only.
  async deleteHomework(id: string): Promise<boolean> {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_HOMEWORK_MUTATION,
      variables: { id },
    });
    return data.deleteHomework;
  },
};
