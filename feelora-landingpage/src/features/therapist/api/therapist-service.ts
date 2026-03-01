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

// to match the Therapist Query
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
    }
  }
`;

// to use the correct Therapist Mutation and Input Type
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

// --- Service Object --- //
export const therapistService = {
  // -- API call to submit the full questionnaire --
  submitQuestionnaire: async (data: TherapistQuestionnaireData): Promise<{ success: boolean; savedData?: { Id: string; Type: string; Questionnaire: string }; error?: string }> => {
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
  createTherapistProfile: async (data: Partial<TherapistQuestionnaireData>): Promise<TherapistProfile> => {
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
      fetchPolicy: 'network-only', // Ensure fresh data
    });

    return responseData.getOwnTherapistProfile;
  },
};
