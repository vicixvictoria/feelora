// Real backend integration for booking/session data (schema.graphql:
// Session/Bookings/AvailableSlots/DeletionResponse). Shared by both the
// patient booking flow (createSession, getTherapistAvailabilities — auth
// group "type:U") and the therapist calendar (getOwnSessions/updateSession —
// both groups can read their own sessions, but only a therapist can attach
// an address)
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { fromAWSTime, toAWSTime } from '@/features/calendar/lib/awsTime';
import { CreateSessionInput, DeletionResponse, Policy, Session, SessionStatus, TimeSlot } from '../types/session';

const SESSION_FIELDS = `
  bookingId
  patientId
  patientEmail
  therapistId
  therapistEmail
  date
  startsAt
  endsAt
  status
  createdAt
  lastUpdatedAt
  cancellationPolicy { MinimalNotice CancellationPolicy }
  cancelledAt
  cancelledBy
  address
`;

const GET_THERAPIST_AVAILABILITIES_QUERY = gql`
  query GetTherapistAvailabilities($therapistId: ID!, $date: AWSDate!) {
    getTherapistAvailabilities(TherapistId: $therapistId, Date: $date) {
      Date
      Availabilities { Start End }
    }
  }
`;

const GET_OWN_SESSIONS_QUERY = gql`
  query GetOwnSessions($status: SessionStatus!, $startingDate: AWSDate!, $endDate: AWSDate!, $nextToken: String) {
    getOwnSessions(Status: $status, StartingDate: $startingDate, EndDate: $endDate, NextToken: $nextToken) {
      Sessions { ${SESSION_FIELDS} }
      NextToken
    }
  }
`;

const GET_SESSION_QUERY = gql`
  query GetSession($bookingId: ID!) {
    getSession(BookingId: $bookingId) { ${SESSION_FIELDS} }
  }
`;

const CREATE_SESSION_MUTATION = gql`
  mutation CreateSession($input: SessionInput!) {
    createSession(input: $input) { ${SESSION_FIELDS} }
  }
`;

const UPDATE_SESSION_MUTATION = gql`
  mutation UpdateSession($bookingId: ID!, $address: String!) {
    updateSession(BookingId: $bookingId, Address: $address) { ${SESSION_FIELDS} }
  }
`;

const DELETE_SESSION_MUTATION = gql`
  mutation DeleteSession($bookingId: ID!) {
    deleteSession(BookingId: $bookingId) {
      Deleted
      WithinNotice
      CancellationPolicy { MinimalNotice CancellationPolicy }
    }
  }
`;

interface RemoteTimeSlot {
  Start: string;
  End: string;
}
interface RemotePolicy {
  MinimalNotice: number;
  CancellationPolicy: string;
}
interface RemoteSession {
  bookingId: string;
  patientId: string;
  patientEmail: string;
  therapistId: string;
  therapistEmail: string;
  date: string;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
  createdAt: string;
  lastUpdatedAt: string;
  cancellationPolicy: RemotePolicy | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  address: string | null;
}

const toPolicy = (policy: RemotePolicy | null): Policy | undefined =>
  policy
    ? { minimalNoticeHours: policy.MinimalNotice, cancellationPolicy: policy.CancellationPolicy }
    : undefined;

const toSession = (remote: RemoteSession): Session => ({
  bookingId: remote.bookingId,
  patientId: remote.patientId,
  patientEmail: remote.patientEmail,
  therapistId: remote.therapistId,
  therapistEmail: remote.therapistEmail,
  date: remote.date,
  startTime: fromAWSTime(remote.startsAt),
  endTime: fromAWSTime(remote.endsAt),
  status: remote.status,
  createdAt: remote.createdAt,
  lastUpdatedAt: remote.lastUpdatedAt,
  cancellationPolicy: toPolicy(remote.cancellationPolicy),
  cancelledAt: remote.cancelledAt ?? undefined,
  cancelledBy: remote.cancelledBy ?? undefined,
  address: remote.address ?? undefined,
});

export const sessionService = {
  // Lists the therapist's bookable slots for one specific date — the only
  // granularity the backend offers (no "which days this month have
  // openings" query), matching the existing pick-a-day-then-see-slots flow.
  async getAvailableSlots(therapistId: string, date: string): Promise<TimeSlot[]> {
    const { data } = await apolloClient.query({
      query: GET_THERAPIST_AVAILABILITIES_QUERY,
      variables: { therapistId, date },
      fetchPolicy: 'network-only',
    });
    const result = data.getTherapistAvailabilities;
    if (!result) return [];
    return result.Availabilities.map((slot: RemoteTimeSlot) => ({
      startTime: fromAWSTime(slot.Start),
      endTime: fromAWSTime(slot.End),
    }));
  },

  // Fetches every session in [startDate, endDate] for the current user
  // (patient or therapist — the backend scopes by the auth token, not an
  // explicit id), following NextToken until exhausted since calendar views
  // need the full range at once rather than a paginated list.
  async getSessions(status: SessionStatus, startDate: string, endDate: string): Promise<Session[]> {
    const sessions: Session[] = [];
    let nextToken: string | undefined;
    do {
      const { data } = await apolloClient.query({
        query: GET_OWN_SESSIONS_QUERY,
        variables: { status, startingDate: startDate, endDate, nextToken },
        fetchPolicy: 'network-only',
      });
      sessions.push(...data.getOwnSessions.Sessions.map(toSession));
      nextToken = data.getOwnSessions.NextToken ?? undefined;
    } while (nextToken);
    return sessions;
  },

  async getSession(bookingId: string): Promise<Session | null> {
    const { data } = await apolloClient.query({
      query: GET_SESSION_QUERY,
      variables: { bookingId },
      fetchPolicy: 'network-only',
    });
    return data.getSession ? toSession(data.getSession) : null;
  },

  // Books a slot for the current patient (auth-inferred) with the given
  // therapist. There's no address/type at creation — the therapist attaches
  // that afterwards via updateSessionAddress.
  async createSession(input: CreateSessionInput): Promise<Session> {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_SESSION_MUTATION,
      variables: {
        input: {
          TherapistId: input.therapistId,
          Date: input.date,
          StartTime: toAWSTime(input.startTime),
          EndTime: toAWSTime(input.endTime),
        },
      },
    });
    return toSession(data.createSession);
  },

  // Therapist-only: attaches the meeting link (online) or address (in
  // person) to an already-booked session. The schema has a single free-text
  // field for both — see AppointmentInfoDialog for the URL-vs-text display split.
  async updateSessionAddress(bookingId: string, address: string): Promise<Session> {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_SESSION_MUTATION,
      variables: { bookingId, address },
    });
    return toSession(data.updateSession);
  },

  // Cancels a booking (patient or therapist). Never blocked client- or
  // server-side by the notice period — WithinNotice on the response is
  // purely informational.
  async cancelSession(bookingId: string): Promise<DeletionResponse> {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_SESSION_MUTATION,
      variables: { bookingId },
    });
    const result = data.deleteSession;
    return {
      deleted: result.Deleted,
      withinNotice: result.WithinNotice,
      cancellationPolicy: toPolicy(result.CancellationPolicy),
    };
  },
};
