import { generateClient } from 'aws-amplify/api';
import { handleGraphQL } from '@/lib/api-wrapper'; 
import {MatchingAlgorithmResponse, QuestionnaireData, Match} from '../types/questionnaire';

const client = generateClient();

// --- GraphQL Definitions (Aligned with Schema) --- //

// Matching Algorithm Mutation -- Accepts 'MatchingInput' and returns a list of 'Match'
const matchingAlgorithmMutation = /* GraphQL */ `
  mutation MatchingAlgorithm($input: MatchingInput!) {
    matchingAlgorithm(input: $input) {
      Id
      filters
      description
    }
  }
`;

const getOwnUserProfileQuery = /* GraphQL */ `
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

// --- Service Object --- //
export const patientService = {
 
  submitQuestionnaire: async (data: QuestionnaireData): Promise<any> => {
    // 1. Prepare Input (Matches 'MatchingInput' in schema)
    const input = {
      Questionnaire: JSON.stringify(data),
      filters: JSON.stringify({
        languages: data.languages.selected,
        gender: data.therapistGender,
        setting: data.therapySetting,
        availability: data.availability,
      })
    };

    // 2. Call the mutation
    // Note: The schema says this returns a list of [Match]!
    const responseData = await handleGraphQL<MatchingAlgorithmResponse>(
      client.graphql({
        query: matchingAlgorithmMutation,
        variables: { input }
      }) 
    );

    // Return the matches to the component
    return {
      success: true,
      // responseData will contain a property named 'matchingAlgorithm', because that is the name of the mutation in the schema
      matches: responseData.matchingAlgorithm
    };
  },

  //
  getProfile: async (): Promise<any> => {
    const responseData = await handleGraphQL<any>(
      client.graphql({
        query: getOwnUserProfileQuery
      })
    );
    return responseData.getOwnUserProfile;
  }
};