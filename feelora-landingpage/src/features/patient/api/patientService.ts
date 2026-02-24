import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apolloClient';
import { MatchingAlgorithmResponse, QuestionnaireData } from '../types/questionnaire';
import { PatientProfile, MatchedTherapist } from '../types/profiles';


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

// Get Logged-In Patient Profile
const GET_OWN_USER_PROFILE_QUERY = gql`
  query GetOwnUserProfile {
    getOwnUserProfile {
      Id
      Email
      Name
      Surname
      Gender
      BirthDate
      City
      Languages
      Availability
      Matches
      Plan
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

// Get Matched Therapists (For Patients)
const GET_MATCHED_THERAPISTS_QUERY = gql`
  query GetMatchedTherapists($ids: [ID]) {
    getMatchedTherapists(TherapistsIds: $ids) {
      items {
        Id
        Email
        Name
        Surname
        Gender
        BirthDate
        City
        Address
        LicenseVerified
        Languages
        Availability
        Specialties
      }
    }
  }
`;

const SAVE_MATCH_MUTATION = gql`
  mutation SaveMatch($match: ID!) {
    saveMatch(match: $match)
  }
`;

// For pinging algorithm 
const PING_LAMBDA_QUERY = gql`
  query PingLambda {
    pingLambda
  }
`;

// Helper function to guarantee an array
const ensureArray = (val: any) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

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


  //Get patient profile API call
  getProfile: async (): Promise<PatientProfile> => {
    const { data: responseData } = await apolloClient.query({
      query: GET_OWN_USER_PROFILE_QUERY,
      fetchPolicy: 'network-only' // Ensure to get fresh data
    });
    return responseData.getOwnUserProfile;
  },

  // Fetch matched therapist(s)
  getMatchedTherapists: async (therapistIds: string[]): Promise<MatchedTherapist[]> => {
   const { data: responseData } = await apolloClient.query({
     query: GET_MATCHED_THERAPISTS_QUERY,
     variables: { ids: therapistIds },
   });

   return responseData.getMatchedTherapists.items || [];
 },

 // -- API call to accept and save a therapist match --
  saveMatch: async (therapistId: string): Promise<boolean> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SAVE_MATCH_MUTATION,
        variables: { match: therapistId },
      });
      return data.saveMatch; // returns true or false
    } catch (error) {
      console.error("Error saving match:", error);
      throw error;
    }
  },

  // -- Wake up the matching algorithm Lambda --
  pingMatchingAlgorithm: () => {
    // no "await" here! It's a "fire-and-forget" call.
    apolloClient.query({
      query: PING_LAMBDA_QUERY,
      fetchPolicy: 'network-only'
    }).catch(error => {
      // We catch the error silently. If the ping fails, we don't want to 
      // alert the user or stop them from continuing the questionnaire.
      console.debug("Ping Lambda failed (ignored):", error);
    });
  },

};