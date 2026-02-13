import { generateClient } from 'aws-amplify/api';
import { handleGraphQL } from '@/lib/api-wrapper'; 
import {MatchingAlgorithmResponse, QuestionnaireData, Match} from '../types/questionnaire';

const client = generateClient();
const manualToken = import.meta.env.VITE_TEST_AUTH_TOKEN;


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

const saveUserProfile = `
mutation SaveUserProfile($input: UserProfileInput!) {
  SaveUserProfile(input: $input) {
    Name
    Surname
    Gender
    BirthDate
    City
    Languages
    Availability
    }
  }
  `
  ;


// --- Service Object --- //
export const patientService = {
 
  submitQuestionnaire: async (data: QuestionnaireData): Promise<any> => {
    //const manualToken = import.meta.env.VITE_TEST_AUTH_TOKEN; //only for testing

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
        variables: { input },
        //authToken : manualToken. --> only for Testing without login
      }) 
    );

    // Return the matches to the component
    return {
      success: true,
      // responseData will contain a property named 'matchingAlgorithm', because that is the name of the mutation in the schema
      matches: responseData.matchingAlgorithm
    };
  },


  //Create User Profile API call
  createPatientProfile: async (data: Partial<QuestionnaireData>): Promise<any> => {
    //Prepare Payload according to the UserProfileInput type in the schema
    const input = {
      Name: data.personalData?.firstname,
      Surname: data.personalData?.lastname,
      Birthdate: data.personalData?.bday ? new Date(data.personalData.bday).getTime() / 1000 
      : null,
      Gender: data.personalData?.gender,
      City: data.contactInfo?.city,
      Languages: data.languages?.selected || [],
      Availability: data.availability || [],
    };

    const responseData = await handleGraphQL<any>(
      client.graphql({
        query: saveUserProfile,
        variables: { input },
      },{ 
        headers: {
          Authorization: `Bearer ${manualToken}`
        }
      });
    );

    return responseData.saveUserProfile;
  },


  //Get profile API call
  getProfile: async (): Promise<any> => {
    const responseData = await handleGraphQL<any>(
      client.graphql({
        query: getOwnUserProfileQuery
      })
    );
    return responseData.getOwnUserProfile;
  }
};