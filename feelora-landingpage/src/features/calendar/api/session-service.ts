// PORTFOLIO DEMO MODE: the backend is offline, so the real API calls below are
// commented out (not deleted) and `sessionService` at the bottom of this file
// serves demo data from src/mocks instead.
//
// Real backend integration for booking/session data (schema.graphql:
// Session/Bookings/AvailableSlots/DeletionResponse). Shared by both the
// patient booking flow (createSession, getTherapistAvailabilities — auth
// group "type:U") and the therapist calendar (getOwnSessions/updateSession —
// both groups can read their own sessions, but only a therapist can attach
// an address)
// import { gql } from '@apollo/client';
// import { apolloClient } from '@/lib/apollo-client';
// import { fromAWSTime, toAWSTime } from '@/features/calendar/lib/awsTime';
// import { isMissingDataError } from '@/features/calendar/lib/graphqlErrors';
import { CreateSessionInput, DeletionResponse, Policy, Session, SessionStatus, TimeSlot } from '../types/session';
import { db, getCurrentUserId, notifyDemoStoreChanged, respond } from '@/mocks/demo-store';
import type { NotificationType } from '@/features/notifications/api/notification-service';

// const SESSION_FIELDS = `
//   bookingId
//   patientId
//   patientEmail
//   therapistId
//   therapistEmail
//   date
//   startsAt
//   endsAt
//   status
//   createdAt
//   lastUpdatedAt
//   cancellationPolicy { MinimalNotice CancellationPolicy }
//   cancelledAt
//   cancelledBy
//   address
// `;
//
// const GET_THERAPIST_AVAILABILITIES_QUERY = gql`
//   query GetTherapistAvailabilities($therapistId: ID!, $date: AWSDate!) {
//     getTherapistAvailabilities(TherapistId: $therapistId, Date: $date) {
//       Date
//       Availabilities { Start End }
//     }
//   }
// `;
//
// const GET_OWN_SESSIONS_QUERY = gql`
//   query GetOwnSessions($status: SessionStatus!, $startingDate: AWSDate!, $endDate: AWSDate!, $nextToken: String) {
//     getOwnSessions(Status: $status, StartingDate: $startingDate, EndDate: $endDate, NextToken: $nextToken) {
//       Sessions { ${SESSION_FIELDS} }
//       NextToken
//     }
//   }
// `;
//
// const GET_SESSION_QUERY = gql`
//   query GetSession($bookingId: ID!) {
//     getSession(BookingId: $bookingId) { ${SESSION_FIELDS} }
//   }
// `;
//
// const CREATE_SESSION_MUTATION = gql`
//   mutation CreateSession($input: SessionInput!) {
//     createSession(input: $input) { ${SESSION_FIELDS} }
//   }
// `;
//
// const UPDATE_SESSION_MUTATION = gql`
//   mutation UpdateSession($bookingId: ID!, $address: String!) {
//     updateSession(BookingId: $bookingId, Address: $address) { ${SESSION_FIELDS} }
//   }
// `;
//
// const DELETE_SESSION_MUTATION = gql`
//   mutation DeleteSession($bookingId: ID!) {
//     deleteSession(BookingId: $bookingId) {
//       Deleted
//       WithinNotice
//       CancellationPolicy { MinimalNotice CancellationPolicy }
//     }
//   }
// `;
//
// interface RemoteTimeSlot {
//   Start: string;
//   End: string;
// }
// interface RemotePolicy {
//   MinimalNotice: number;
//   CancellationPolicy: string;
// }
// interface RemoteSession {
//   bookingId: string;
//   patientId: string;
//   patientEmail: string;
//   therapistId: string;
//   therapistEmail: string;
//   date: string;
//   startsAt: string;
//   endsAt: string;
//   status: SessionStatus;
//   createdAt: string;
//   lastUpdatedAt: string;
//   cancellationPolicy: RemotePolicy | null;
//   cancelledAt: string | null;
//   cancelledBy: string | null;
//   address: string | null;
// }
//
// const toPolicy = (policy: RemotePolicy | null): Policy | undefined =>
//   policy
//     ? { minimalNoticeHours: policy.MinimalNotice, cancellationPolicy: policy.CancellationPolicy }
//     : undefined;
//
// const toSession = (remote: RemoteSession): Session => ({
//   bookingId: remote.bookingId,
//   patientId: remote.patientId,
//   patientEmail: remote.patientEmail,
//   therapistId: remote.therapistId,
//   therapistEmail: remote.therapistEmail,
//   date: remote.date,
//   startTime: fromAWSTime(remote.startsAt),
//   endTime: fromAWSTime(remote.endsAt),
//   status: remote.status,
//   createdAt: remote.createdAt,
//   lastUpdatedAt: remote.lastUpdatedAt,
//   cancellationPolicy: toPolicy(remote.cancellationPolicy),
//   cancelledAt: remote.cancelledAt ?? undefined,
//   cancelledBy: remote.cancelledBy ?? undefined,
//   address: remote.address ?? undefined,
// });
//
// export const sessionService = {
//   // Lists the therapist's bookable slots for one specific date — the only
//   // granularity the backend offers (no "which days this month have
//   // openings" query), matching the existing pick-a-day-then-see-slots flow.
//   async getAvailableSlots(therapistId: string, date: string): Promise<TimeSlot[]> {
//     try {
//       const { data } = await apolloClient.query({
//         query: GET_THERAPIST_AVAILABILITIES_QUERY,
//         variables: { therapistId, date },
//         fetchPolicy: 'network-only',
//       });
//       const result = data.getTherapistAvailabilities;
//       if (!result) return [];
//       return result.Availabilities.map((slot: RemoteTimeSlot) => ({
//         startTime: fromAWSTime(slot.Start),
//         endTime: fromAWSTime(slot.End),
//       }));
//     } catch (error) {
//       // The therapist hasn't created a schedule yet — per the backend team
//       // this throws by design instead of returning an empty list, but from
//       // the patient's side it's a completely normal state (matched with a
//       // therapist who hasn't set up their calendar yet), not a failure.
//       if (isMissingDataError(error)) return [];
//       throw error;
//     }
//   },
//
//   // Fetches every session in [startDate, endDate] for the current user
//   // (patient or therapist — the backend scopes by the auth token, not an
//   // explicit id), following NextToken until exhausted since calendar views
//   // need the full range at once rather than a paginated list.
//   async getSessions(status: SessionStatus, startDate: string, endDate: string): Promise<Session[]> {
//     const sessions: Session[] = [];
//     let nextToken: string | undefined;
//     do {
//       const { data } = await apolloClient.query({
//         query: GET_OWN_SESSIONS_QUERY,
//         variables: { status, startingDate: startDate, endDate, nextToken },
//         fetchPolicy: 'network-only',
//       });
//       sessions.push(...data.getOwnSessions.Sessions.map(toSession));
//       nextToken = data.getOwnSessions.NextToken ?? undefined;
//     } while (nextToken);
//     return sessions;
//   },
//
//   async getSession(bookingId: string): Promise<Session | null> {
//     const { data } = await apolloClient.query({
//       query: GET_SESSION_QUERY,
//       variables: { bookingId },
//       fetchPolicy: 'network-only',
//     });
//     return data.getSession ? toSession(data.getSession) : null;
//   },
//
//   // Books a slot for the current patient (auth-inferred) with the given
//   // therapist. There's no address/type at creation — the therapist attaches
//   // that afterwards via updateSessionAddress.
//   async createSession(input: CreateSessionInput): Promise<Session> {
//     const { data } = await apolloClient.mutate({
//       mutation: CREATE_SESSION_MUTATION,
//       variables: {
//         input: {
//           TherapistId: input.therapistId,
//           Date: input.date,
//           StartTime: toAWSTime(input.startTime),
//           EndTime: toAWSTime(input.endTime),
//         },
//       },
//     });
//     return toSession(data.createSession);
//   },
//
//   // Therapist-only: attaches the meeting link (online) or address (in
//   // person) to an already-booked session. The schema has a single free-text
//   // field for both — see AppointmentInfoDialog for the URL-vs-text display split.
//   async updateSessionAddress(bookingId: string, address: string): Promise<Session> {
//     const { data } = await apolloClient.mutate({
//       mutation: UPDATE_SESSION_MUTATION,
//       variables: { bookingId, address },
//     });
//     return toSession(data.updateSession);
//   },
//
//   // Cancels a booking (patient or therapist). Never blocked client- or
//   // server-side by the notice period — WithinNotice on the response is
//   // purely informational.
//   async cancelSession(bookingId: string): Promise<DeletionResponse> {
//     const { data } = await apolloClient.mutate({
//       mutation: DELETE_SESSION_MUTATION,
//       variables: { bookingId },
//     });
//     const result = data.deleteSession;
//     return {
//       deleted: result.Deleted,
//       withinNotice: result.WithinNotice,
//       cancellationPolicy: toPolicy(result.CancellationPolicy),
//     };
//   },
// };

// --- Demo Service Object (portfolio mode — serves src/mocks data, no network) --- //

const startOf = (session: Pick<Session, 'date' | 'startTime'>) => new Date(`${session.date}T${session.startTime}:00`);

const findSession = (bookingId: string): Session => {
  const session = db.sessions.find((s) => s.bookingId === bookingId);
  if (!session) throw new Error(`Session ${bookingId} not found`);
  return session;
};

// Mirrors the backend's session notifications to the other participant.
const notifySession = (recipientId: string, type: NotificationType, bookingId: string) => {
  const timestamp = new Date().toISOString();
  db.notifications[recipientId] = [
    ...(db.notifications[recipientId] ?? []).filter((n) => !(n.type === type && n.bookingId === bookingId)),
    { recipientId, sk: `${type}#${bookingId}`, type, bookingId, createdAt: timestamp, updatedAt: timestamp },
  ];
};

const currentPolicy = (): Policy => db.schedule.cancellationPolicy;

export const sessionService = {
  // Slots come from the therapist's recurring schedule (or that date's
  // override), minus already-booked ones and anything inside the booking notice.
  async getAvailableSlots(therapistId: string, date: string): Promise<TimeSlot[]> {
    const weekday = new Date(`${date}T00:00:00`).getDay();
    const daySlots = db.overrides[date] ?? db.schedule.slotsByDay[weekday] ?? [];
    const earliestBookable = Date.now() + db.schedule.bookingNoticeHours * 3_600_000;
    const booked = new Set(
      db.sessions
        .filter((s) => s.therapistId === therapistId && s.date === date && s.status === 'CONFIRMED')
        .map((s) => s.startTime),
    );
    return respond(
      daySlots.filter((slot) => !booked.has(slot.startTime) && startOf({ date, startTime: slot.startTime }).getTime() >= earliestBookable),
    );
  },

  async getSessions(status: SessionStatus, startDate: string, endDate: string): Promise<Session[]> {
    const userId = getCurrentUserId();
    return respond(
      db.sessions.filter(
        (s) =>
          (s.therapistId === userId || s.patientId === userId) &&
          s.status === status &&
          s.date >= startDate &&
          s.date <= endDate,
      ),
    );
  },

  async getSession(bookingId: string): Promise<Session | null> {
    return respond(db.sessions.find((s) => s.bookingId === bookingId) ?? null);
  },

  async createSession(input: CreateSessionInput): Promise<Session> {
    const patient = db.patients[getCurrentUserId()];
    const timestamp = new Date().toISOString();
    const session: Session = {
      bookingId: `demo-booking-${Date.now()}`,
      patientId: patient?.Id ?? getCurrentUserId(),
      patientEmail: patient?.Email ?? '',
      therapistId: input.therapistId,
      therapistEmail: db.therapist.Email,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: 'CONFIRMED',
      createdAt: timestamp,
      lastUpdatedAt: timestamp,
      cancellationPolicy: currentPolicy(),
    };
    db.sessions.push(session);
    notifySession(input.therapistId, 'new_session', session.bookingId);
    notifyDemoStoreChanged();
    return respond(session, 500);
  },

  async updateSessionAddress(bookingId: string, address: string): Promise<Session> {
    const session = findSession(bookingId);
    session.address = address;
    session.lastUpdatedAt = new Date().toISOString();
    notifySession(session.patientId, 'updated_session', bookingId);
    notifyDemoStoreChanged();
    return respond(session, 300);
  },

  async cancelSession(bookingId: string): Promise<DeletionResponse> {
    const session = findSession(bookingId);
    const userId = getCurrentUserId();
    const policy = session.cancellationPolicy ?? currentPolicy();
    session.status = 'CANCELLED';
    session.cancelledAt = new Date().toISOString();
    session.cancelledBy = userId;
    session.lastUpdatedAt = session.cancelledAt;
    notifySession(userId === session.patientId ? session.therapistId : session.patientId, 'deleted_session', bookingId);
    notifyDemoStoreChanged();
    return respond(
      {
        deleted: true,
        withinNotice: startOf(session).getTime() - Date.now() < policy.minimalNoticeHours * 3_600_000,
        cancellationPolicy: policy,
      },
      400,
    );
  },
};
