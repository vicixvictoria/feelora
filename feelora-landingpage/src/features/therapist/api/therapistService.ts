import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apolloClient';
import { TherapistQuestionnaireData } from '../types/questionnaireT';

// --- GraphQL Definitions (Reusing the same mutations as Patient) --- //

const MATCHING_ALGORITHM_MUTATION = gql`
  mutation MatchingAlgorithm($input: MatchingInput!) {
    matchingAlgorithm(input: $input) {
      Id
      filters
      description
    }
  }
`;

const GET_OWN_USER_PROFILE_QUERY = gql`
  query GetOwnUserProfile {
    getOwnUserProfile {
      Id
      Email
      Name
      Gender
      City
      MoodTracker
    }
  }
`;

const SAVE_USER_PROFILE_MUTATION = gql`
  mutation saveUserProfile($input: CreateUserProfileInput!) {
    saveUserProfile(input: $input) {
      Name
      Surname
      Gender
      BirthDate
      City
      Languages
      Availability
    }
  }
`;

// --- Service Object --- //
export const therapistService = {

  // -- API call to submit the full questionnaire --
  submitQuestionnaire: async (data: TherapistQuestionnaireData): Promise<any> => {
    // 1. Prepare Input
    // Map the therapist's specific data to the generic 'MatchingInput' structure
    const input = {
      Questionnaire: JSON.stringify(data),
      filters: JSON.stringify({
        languages: data.languages?.selected || [],
        gender: data.personalData?.gender,
        specialties: data.specialties?.selected || [],
        setting: data.therapySetting || [],
        availability: data.availability || [],
      })
    };

    try {
      const { data: responseData } = await apolloClient.mutate({
        mutation: MATCHING_ALGORITHM_MUTATION,
        variables: { input },
      });

      return {
        success: true,
        matches: responseData.matchingAlgorithm, 
      };
    } catch (error: unknown) {
      console.error("Therapist Submission Error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error during the therapist submission occurred";
      
      return {
        success: false,
        matches: [],
        error: errorMessage
      };
    }
  },

  // -- Create User Profile API call --
  // Maps the Therapist Questionnaire fields to the User Profile Schema
  createTherapistProfile: async (data: Partial<TherapistQuestionnaireData>): Promise<any> => {
    const input = {
      Name: data.personalData?.firstName,
      Surname: data.personalData?.lastName,
      // Convert ISO string to Unix timestamp (seconds) if bday exists
      BirthDate: data.personalData?.bday 
        ? new Date(data.personalData.bday).getTime() / 1000 
        : null,
      Gender: data.personalData?.gender,
      City: data.contactInfo?.city,
      Languages: data.languages?.selected || [],
      Availability: data.availability || [],
    };

    const { data: responseData } = await apolloClient.mutate({
      mutation: SAVE_USER_PROFILE_MUTATION,
      variables: { input },
    });

    return responseData.saveUserProfile;
  },

  // -- Get profile API call --
  getProfile: async (): Promise<any> => {
    const { data: responseData } = await apolloClient.query({
      query: GET_OWN_USER_PROFILE_QUERY,
    });

    return responseData.getOwnUserProfile;
  }
};