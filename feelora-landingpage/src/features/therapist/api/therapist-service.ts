import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { TherapistQuestionnaireData } from '../types/questionnaire-therapist';
import { TherapistProfile } from '../types/profiles';

// --- GraphQL Definitions --- //

// Using the insert questionnaire mutation for therapist submission, as it accepts the full questionnaire data and has the 'Discoverable' flag
const INSERT_QUESTIONNAIRE_MUTATION = gql`
  mutation InsertQuestionnaire($input: QuestionnaireInput!) {
    insertQuestionnaire(input: $input) {
      Id
      Type
      Questionnaire
    }
  }
`;

// match the Therapist Query to get existing Therapist Data
const GET_OWN_THERAPIST_PROFILE_QUERY = gql`
  query GetOwnTherapistProfile {
    getOwnTherapistProfile {
      Id
      Email
      Name
      Surname
      Gender
      BirthDate
      City
      Address
      Languages
      Availability
      Specialties
      LicenseData
      LicenseVerified
      Matches
    }
  }
`;

// to save a new Therpaists Data
const SAVE_THERAPIST_PROFILE_MUTATION = gql`
  mutation SaveTherapistProfile($input: CreateTherapistProfileInput!) {
    saveTherapistProfile(input: $input) {
      Id
      Name
      Surname
      Address
      LicenseVerified
    }
  }
`;

// get the matched patients of a therapist
const GET_MATCHED_USERS_QUERY = gql`
  query GetMatchedUsers($UsersIds: [ID]) {
    getMatchedUsers(UsersIds: $UsersIds) {
      items {
        Id
        Name
        Surname
        Gender
        City
      }
    }
  }
`;

// -- Delete Account Data Mutation
const DELETE_DATA_MUTATION = gql`
  mutation DeleteData {
    deleteData
  }
`;

// -- Mood Tracker Data Queries
const THERAPIST_GET_MOOD_TRACKERS_QUERY = gql`
  query TherapistGetMoodTrackerQuestionnaires($userId: ID!, $limit: Int) {
    therapistGetMoodTrackerQuestionnaires(userId: $userId, limit: $limit) {
      items {
        CreatedAt
        Questionnaire
        QuestionnaireSummary
      }
    }
  }
`;

// --- Service Object --- //
export const therapistService = {
  // -- API call to submit the full questionnaire --
  submitQuestionnaire: async (
    data: TherapistQuestionnaireData,
  ): Promise<{
    success: boolean;
    savedData?: { Id: string; Type: string; Questionnaire: string };
    error?: string;
  }> => {
    // 1. Prepare Input (Matches 'QuestionnaireInput' in schema)
    const input = {
      Questionnaire: JSON.stringify(data),
      Discoverable: true, // Crucial: Makes the therapist visible to the patient matching algorithm
    };

    try {
      const { data: responseData } = await apolloClient.mutate({
        mutation: INSERT_QUESTIONNAIRE_MUTATION,
        variables: { input },
      });

      return {
        success: true,
        savedData: responseData.insertQuestionnaire,
      };
    } catch (error: unknown) {
      console.error('Therapist Submission Error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error during the therapist submission occurred';

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // -- Create User Profile API call --
  // (Triggered earlier in the flow on the Availability step)
  createTherapistProfile: async (
    data: Partial<TherapistQuestionnaireData>,
  ): Promise<TherapistProfile> => {
    const formattedAddress = [
      data.contactInfo?.street,
      data.contactInfo?.zip,
      data.contactInfo?.city,
    ]
      .filter(Boolean)
      .join(', ');

    const licenseDataObj = {
      licenseId: data.qualifications?.licenseNumber || '',
      pathToLicenseDocument: data.qualifications?.idUpload || '',
    };

    // Fallback value safety net: Add || "" to all strictly required String! fields
    // Add || 0 to BirthDate since it is a required Float
    const input = {
      Name: data.personalData?.firstName || '',
      Surname: data.personalData?.lastName || '',
      BirthDate: data.personalData?.bday ? new Date(data.personalData.bday).getTime() / 1000 : 0,
      Gender: data.personalData?.gender || '',
      City: data.contactInfo?.city || '',
      Languages: data.languages?.selected || [],
      Address: formattedAddress || null,
      Availability: data.availability || [],
      LicenseData: JSON.stringify(licenseDataObj),
      Specialties: data.specialties?.selected || [],
      Title: data.personalData?.title || '',
      JobTitle: data.personalData?.jobTitle || '',
    };
    console.log('2. Formatted GraphQL Payload (input):', input);

    const { data: responseData } = await apolloClient.mutate({
      mutation: SAVE_THERAPIST_PROFILE_MUTATION,
      variables: { input },
    });

    return responseData.saveTherapistProfile;
  },

  // -- Get profile API call --
  getProfile: async (): Promise<TherapistProfile> => {
    const { data: responseData } = await apolloClient.query({
      query: GET_OWN_THERAPIST_PROFILE_QUERY,
      fetchPolicy: 'cache-first', // Ensure to not always hit the backend, but use cache when available for better performance
    });

    return responseData.getOwnTherapistProfile;
  },

  // -- Fetch matched patient(s) profiles --
  getMatchedPatients: async (patientIds: string[]): Promise<any[]> => {
    // Safety net: if the therapist has no matches yet, just return an empty array
    if (!patientIds || patientIds.length === 0) {
      return [];
    }

    try {
      const { data: responseData } = await apolloClient.query({
        query: GET_MATCHED_USERS_QUERY,
        variables: { UsersIds: patientIds },
        fetchPolicy: 'cache-first', // Uses cache if we already loaded them elsewhere
      });

      return responseData.getMatchedUsers.items || [];
    } catch (error) {
      console.error('Error fetching matched patients:', error);
      return [];
    }
  },

  // -- Delete Therapist Profile and all associated data --
  deleteProfile: async (): Promise<boolean> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_DATA_MUTATION,
      });
      return data.deleteData; // Returns true if successful
    } catch (error) {
      console.error('Error deleting therapist profile data:', error);
      throw error;
    }
  },

  // -- Fetch Mood Trackers for a specific patient --
  getPatientMoodTrackers: async (
    userId: string,
  ): Promise<{ trackers: any[]; hasConsent: boolean }> => {
    try {
      const { data } = await apolloClient.query({
        query: THERAPIST_GET_MOOD_TRACKERS_QUERY,
        variables: { userId, limit: 10 }, // Get their 10 most recent entries --> do we need more?
        fetchPolicy: 'network-only',
      });
      return {
        trackers: data.therapistGetMoodTrackerQuestionnaires.items || [],
        hasConsent: true,
      };
    } catch (error: any) {
      // Check if the backend threw the specific GDPR consent error
      if (error.message && error.message.includes('consented')) {
        console.info(`Patient ${userId} withheld consent for mood trackers.`); // Soft info instead of red error
        return { trackers: [], hasConsent: false };
      }

      console.error(`Error fetching mood trackers for patient ${userId}:`, error);
      return { trackers: [], hasConsent: true }; // Return true for standard network drops to avoid false locked states
    }
  },
};
