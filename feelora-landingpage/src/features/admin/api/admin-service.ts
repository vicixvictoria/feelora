// PORTFOLIO DEMO MODE: the backend is offline, so the real API calls below are
// commented out (not deleted) and `adminService` at the bottom of this file
// returns demo data instead (no therapists are pending approval).
import { respond } from '@/mocks/demo-store';

// import { gql } from '@apollo/client';
// import { apolloClient } from '@/lib/apollo-client';

// // --- GraphQL Definitions ---
//
// const GET_PENDING_PROFILES_QUERY = gql`
//   query GetPendingProfiles {
//     getPendingProfiles {
//       Id
//       Email
//       Name
//       Surname
//     }
//   }
// `;
//
// const GET_PENDING_PROFILE_QUERY = gql`
//   query GetPendingProfile($Id: ID!) {
//     getPendingProfile(Id: $Id) {
//       Id
//       Email
//       Name
//       Surname
//       Gender
//       BirthDate
//       City
//       Languages
//       Availability
//       Specialties
//       Plan
//       Address
//       LicenseData
//       LicenseVerified
//       Title
//       JobTitle
//       PriceRange
//       HasInsurance
//     }
//   }
// `;
//
// const GET_PENDING_QUESTIONNAIRE_QUERY = gql`
//   query GetPendingQuestionnaire($Id: ID!) {
//     getPendingQuestionnaire(Id: $Id) {
//       Id
//       Type
//       Questionnaire
//     }
//   }
// `;
//
// const APPROVE_THERAPIST_MUTATION = gql`
//   mutation ApproveTherapist($Id: ID!) {
//     approveTherapist(Id: $Id)
//   }
// `;
//
// // --- Service Object ---
//
// export const adminService = {
//   getPendingProfiles: async () => {
//     const { data } = await apolloClient.query({
//       query: GET_PENDING_PROFILES_QUERY,
//       fetchPolicy: 'network-only',
//     });
//     return data.getPendingProfiles ?? [];
//   },
//
//   getPendingProfile: async (id: string) => {
//     const { data } = await apolloClient.query({
//       query: GET_PENDING_PROFILE_QUERY,
//       variables: { Id: id },
//       fetchPolicy: 'network-only',
//     });
//     return data.getPendingProfile;
//   },
//
//   getPendingQuestionnaire: async (id: string) => {
//     const { data } = await apolloClient.query({
//       query: GET_PENDING_QUESTIONNAIRE_QUERY,
//       variables: { Id: id },
//       fetchPolicy: 'network-only',
//     });
//     return data.getPendingQuestionnaire;
//   },
//
//   approveTherapist: async (id: string): Promise<boolean> => {
//     const { data } = await apolloClient.mutate({
//       mutation: APPROVE_THERAPIST_MUTATION,
//       variables: { Id: id },
//     });
//     return data.approveTherapist ?? false;
//   },
// };

// --- Demo Service Object (portfolio mode — no network) --- //
export const adminService = {
  getPendingProfiles: async (): Promise<any[]> => respond([]),
  getPendingProfile: async (_id: string): Promise<any> => respond(null),
  getPendingQuestionnaire: async (_id: string): Promise<any> => respond(null),
  approveTherapist: async (_id: string): Promise<boolean> => respond(true),
};
