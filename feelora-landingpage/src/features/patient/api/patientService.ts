import { generateClient, GraphQLResult } from 'aws-amplify/api'; // Add GraphQLResult
import { handleGraphQL } from '@/lib/api-wrapper'; 
import { QuestionnaireData } from '../types/questionnaire';

// 1. Generate the GraphQL client
const client = generateClient();

export interface MatchingInput {
  Questionnaire: string; // AWSJSON is sent as a stringified object
  filters?: string;      // AWSJSON is sent as a stringified object
}

// --- 2. define the expected response structure from the backend for the matching mutation -- //
export interface QuestionnaireResponse { // Define the expected response structure from the backend
  submiQuestionnaireData: {
    success: boolean;
    message: string;
    patientId?: string;
  };
}

export interface PatientProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // Add other fields from your GraphQL schema here
}

export interface GetProfileResponse {
  getPatientProfile: PatientProfile;
}


// --- GraphQL Definitions --- //
// The mutation string matching the backend dev's input type - ceck with backend dev if the actual mutation name in the schema is that
const createMatching = /* GraphQL */ `
  mutation SubmitQuestionnaire($input: MatchingInput!) {
    submitQuestionnaire(input: $input) {
      success
      message
    }
  }
`;

const getProfileQuery = /* GraphQL */ `
  query GetProfile {
    getPatientProfile {
      id
      email
      firstName
      lastName //add other fields depening on backend
    }
  }
`;

// --- Service Object --- //
export const patientService = {
 
  // --- Submit Questionnaire API call--- //
  submitQuestionnaire: async (data: QuestionnaireData): Promise<QuestionnaireResponse['submiQuestionnaireData']> => {
    // 1. Prepare your input as before
    const input: MatchingInput = {
      Questionnaire: JSON.stringify(data),
      filters: JSON.stringify({ //add more specific filters if needed
        languages: data.languages.selected,
        gender: data.therapistGender,
        setting: data.therapySetting,
        availability: data.availability,
      })
    };

    // 2. Use the wrapper to handle the request and validation
    // handleGraphQL will throw an error automatically if data is missing or if errors exist
    const responseData = await handleGraphQL<QuestionnaireResponse>(
      client.graphql({
        query: createMatching,
        variables: { input }
      }) 
    );

    // 3. Return the specific property defined in your Promise
    return responseData.submiQuestionnaireData;
  },

  // --- Get Profile Data API call--- //
  getProfile: async (): Promise<PatientProfile> => {
    // No casting needed, the wrapper handles the TypeScript complexity
    const responseData = await handleGraphQL<GetProfileResponse>(
      client.graphql({
        query: getProfileQuery
      })
    );
    
    return responseData.getPatientProfile;
  }
};