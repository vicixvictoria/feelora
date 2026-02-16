import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apolloClient';
import { MatchingAlgorithmResponse, QuestionnaireData } from '../types/questionnaire';


// --- GraphQL Definitions (Aligned with Schema) --- //

// Matching Algorithm Mutation -- Accepts 'MatchingInput' and returns a list of 'Match'
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
export const patientService = {


  // -- API call to submit the questionnaire and get matches based on the input data --
  submitQuestionnaire: async (data: QuestionnaireData): Promise<any> => {
    // 1. Prepare Input (Matches 'MatchingInput' in schema)
    const input = {
      Questionnaire: JSON.stringify(data),
      filters: JSON.stringify({
        languages: data.languages?.selected || [],
        gender: data.therapistGender,
        setting: data.therapySetting,
        availability: data.availability || [],
      })
    };

   try {
    const { data: responseData } = await apolloClient.mutate({
      mutation: MATCHING_ALGORITHM_MUTATION,
      variables: { input },
    });

    // The backend returns [Match]!, so responseData.matchingAlgorithm is an array
    return {
      success: true,
      matches: responseData.matchingAlgorithm, 
    };
  } catch (error: unknown) {
    console.error("Matching Error:", error);
    const errorMessage = error instanceof Error 
    ? error.message 
    : "An error during the matching algorithm occurred";
    
    return {
      success: false,
      matches: [],
      error: errorMessage
    };
  }
},


  //-- Create User Profile API call --
  createPatientProfile: async (data: Partial<QuestionnaireData>): Promise<any> => {
    //Prepare Payload according to the UserProfileInput type in the schema
    const input = {
      Name: data.personalData?.firstName,
      Surname: data.personalData?.lastName,
      BirthDate: data.personalData?.bday ? new Date(data.personalData.bday).getTime() / 1000
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


  //Get profile API call
  getProfile: async (): Promise<any> => {
    const { data: responseData } = await apolloClient.query({
      query: GET_OWN_USER_PROFILE_QUERY,
    });

    return responseData.getOwnUserProfile;
  }
};