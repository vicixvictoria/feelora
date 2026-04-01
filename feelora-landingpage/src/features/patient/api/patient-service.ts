import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { QuestionnaireData } from '../types/questionnaire';
import { PatientProfile, MatchedTherapist, AlgorithmMatch } from '../types/profiles';

// --- GraphQL Definitions (Aligned with Schema) --- //

// -- Matching Algorithm and Questionnaire Mutations --

// Matching Algorithm Mutation -- Accepts 'MatchingInput' and returns a list of 'Match'
const MATCHING_ALGORITHM_MUTATION = gql`
  mutation MatchingAlgorithm($input: MatchingInput!) {
    matchingAlgorithm(input: $input) {
      Id
      Email
      Name
      Surname
      Gender
      BirthDate
      City
      Languages
      Availability
      Specialties
      Address
      Title
      JobTitle
      Ranking
    }
  }
`;

const SAVE_MATCH_MUTATION = gql`
  mutation SaveMatch($match: ID!) {
    saveMatch(match: $match)
  }
`;

// -- User Profile Mutations --

// Get Logged-In Patient Profile
export const GET_OWN_USER_PROFILE_QUERY = gql`
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

/*const UPDATE_OWN_USER_PROFILE_MUTATION = gql`
  mutation UpdateOwnUserProfile($input: UserProfileInput!) {
    updateOwnUserProfile(input: $input) {
      Id
      MoodTracker
      Name      
      City   
    }
  }
`;*/

const MOOD_TRACKER_SHARE_CONSENT_MUTATION = gql`
  mutation MoodTrackerShareConsent($allow: Boolean!) {
    MoodTrackerShareConsent(allow: $allow)
  }
`;

// export to use for cache in profile page
export const GET_MATCHED_THERAPISTS_QUERY = gql`
  query GetMatchedTherapists($TherapistsIds: [ID]) {
    getMatchedTherapists(TherapistsIds: $TherapistsIds) {
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

// --- Chat & Mood Tracker Chat Mutations ---

const CREATE_CONVERSATION_MUTATION = gql`
  mutation CreateConversation($participantId: ID!) {
    createConversation(participantId: $participantId) {
      conversationId
      participantIds
      createdAt
    }
  }
`;

/* After MVP Feature 
const SEND_MOOD_TRACKER_MESSAGE_MUTATION = gql`
  mutation SendMoodTrackerMessage(
    $conversationId: ID!
    $content: String!
    $moodTrackerQuestionnaire: Boolean
  ) {
    sendMoodTrackerMessage(
      conversationId: $conversationId
      content: $content
      moodTrackerQuestionnaire: $moodTrackerQuestionnaire
    ) {
      messageId
      sentAt
    }
  }
`;*/

const GET_CONVERSATIONS_QUERY = gql`
  query GetConversations {
    getConversations {
      items {
        conversationId
        participantIds
      }
    }
  }
`;

// -- Mood Tracker Questionnaire Mutations--

const SAVE_MOOD_TRACKER_QUESTIONNAIRE_MUTATION = gql`
  mutation SaveMoodTrackerQuestionnaire($input: MoodTrackerQuestionnaireInput!) {
    saveMoodTrackerQuestionnaire(input: $input) {
      CreatedAt
      UpdatedAt
    }
  }
`;

const GET_MOOD_TRACKER_QUESTIONNAIRES_QUERY = gql`
  query GetMoodTrackerQuestionnaires($limit: Int) {
    getMoodTrackerQuestionnaires(limit: $limit) {
      items {
        CreatedAt
        Questionnaire
        QuestionnaireSummary
      }
    }
  }
`;

// -- Delete Account Data Mutation --
const DELETE_DATA_MUTATION = gql`
  mutation DeleteData {
    deleteData
  }
`;

// For pinging algorithm
const PING_LAMBDA_QUERY = gql`
  query PingLambda {
    pingLambda
  }
`;



// --- Service Object --- //
export const patientService = {
  // -- API call to submit the questionnaire and get matches based on the input data --
  submitQuestionnaire: async (
    data: QuestionnaireData,
  ): Promise<{ success: boolean; matches: AlgorithmMatch[]; error?: string }> => {
    // 1. Prepare Input (Matches 'MatchingInput' in schema)
    const input = {
      Questionnaire: JSON.stringify(data),
      filters: JSON.stringify({
        languages: data.languages?.selected || [],
        gender: data.therapistGender,
        setting: data.therapySetting,
        availability: data.availability || [],
      }),
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
      console.error('Matching Error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An error during the matching algorithm occurred';

      return {
        success: false,
        matches: [],
        error: errorMessage,
      };
    }
  },

  //-- Create User Profile API call --
  createPatientProfile: async (
    data: Partial<QuestionnaireData>,
  ): Promise<Partial<PatientProfile>> => {
    //Prepare Payload according to the UserProfileInput type in the schema
    const input = {
      Name: data.personalData?.firstName,
      Surname: data.personalData?.lastName,
      BirthDate: data.personalData?.bday ? new Date(data.personalData.bday).getTime() / 1000 : null,
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
      fetchPolicy: 'cache-first', // Ensure to not always hit the backend, but use cache when available for better performance
    });
    return responseData.getOwnUserProfile;
  },

  // -- Update Mood Tracker Sharing Consent --
  updateMoodTrackerConsent: async (consent: boolean): Promise<boolean> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: MOOD_TRACKER_SHARE_CONSENT_MUTATION,
        variables: { allow: consent }, // <-- Using the dedicated 'allow' variable
      });
      
      console.log(
        `Security Firewall successfully updated! Therapist access: ${data.MoodTrackerShareConsent}`
      );
      
      return data.MoodTrackerShareConsent;
    } catch (error) {
      console.error('❌ Error updating GDPR consent firewall:', error);
      throw error;
    }
  },

  // Fetch matched therapist(s)
  getMatchedTherapists: async (therapistIds: string[]): Promise<MatchedTherapist[]> => {
    // Log to understand return
    console.log('Sending IDs to backend:', therapistIds);
    console.log('Is it an array?', Array.isArray(therapistIds));

    // Safety net
    if (!therapistIds || therapistIds.length === 0) {
      return [];
    }
    const { data: responseData } = await apolloClient.query({
      query: GET_MATCHED_THERAPISTS_QUERY,
      variables: { TherapistsIds: therapistIds },
    });

    return responseData.getMatchedTherapists.items || [];
  },

  // -- API call to accept and save a therapist match and automatically create conversations --
  saveMatch: async (therapistId: string): Promise<boolean> => {
    try {
      // save the match
      const { data } = await apolloClient.mutate({
        mutation: SAVE_MATCH_MUTATION,
        variables: { match: therapistId },
      });

      // 2. Automatically create the required conversations for the chat and mood tracker
      console.log('Creating conversation for Therapist...');
      await apolloClient.mutate({
        mutation: CREATE_CONVERSATION_MUTATION,
        variables: { participantId: therapistId },
      });

      /* //not in the MVP, but we can keep it here for later! We create the mood tracker conversation already at this step, so that it's ready to go when the patient enters the mood tracker for the first time. The conversation will be created with a special participantId "moodtracker" that we can use to identify it when we fetch the conversations list later and get its conversationId for sending messages into it.
      console.log("Creating conversation for Mood Tracker...");
      await apolloClient.mutate({
        mutation: CREATE_CONVERSATION_MUTATION,
        variables: { participantId: "moodtracker" }
      });*/

      return data.saveMatch; // returns true or false
    } catch (error) {
      console.error('Error saving match or creating conversations:', error);
      throw error;
    }
  },

  // -- Fetch Conversations to find the Mood Tracker ID --
  getMoodTrackerConversationId: async (): Promise<string | null> => {
    try {
      const { data } = await apolloClient.query({
        query: GET_CONVERSATIONS_QUERY,
        fetchPolicy: 'network-only', // Always get fresh in case it was just created, dont rely on cache
      });

      // Find the specific conversation where "moodtracker" is in the participantIds array!
      const moodChat = data.getConversations.items.find(
        (chat: any) => chat.participantIds && chat.participantIds.includes('moodtracker'),
      );

      return moodChat ? moodChat.conversationId : null; // Return conversationId, not id
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return null;
    }
  },

  // -- Save Mood Tracker Chat Message --
  //Not in the MVP but keep it for later
  /*
  saveMoodData: async (
    conversationId: string,
    moodData: Record<number, string[]>,
  ): Promise<boolean> => {
    try {
      // Stringify the questionnaire answers as schema requires
      const payload = JSON.stringify(moodData);

      // Send the mood data as a message in the mood tracker conversation, with a flag to identify it as mood tracker data
      await apolloClient.mutate({
        mutation: SEND_MOOD_TRACKER_MESSAGE_MUTATION,
        variables: {
          conversationId: conversationId,
          content: payload,
          moodTrackerQuestionnaire: true,
        },
      });

      return true;
    } catch (error: any) {
      console.error('Error saving mood data:', error);
      // Using the 'cause' property links the two errors for better debugging
      throw new (Error as any)('Failed to save mood tracking data.', { cause: error });
    }
  },*/

  // -- Delete User Profile and all associated data --
  deleteProfile: async (): Promise<boolean> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_DATA_MUTATION,
      });
      return data.deleteData; // This will return true if successful
    } catch (error) {
      console.error('Error deleting profile data:', error);
      throw error;
    }
  },

  // -- MOOD TRACKER API --

  // -- Save Mood Tracker Data from Questionnaire --
  saveMoodTrackerQuestionnaire: async (
    moodData: Record<number, string[]>,
  ): Promise<boolean> => {
    try {
      // The backend requires a 'QuestionnaireSummary' AWSJSON object.
      // We create a basic summary of the main mood (Question 0) and total answered.
      const summary = {
        totalCategoriesAnswered: Object.keys(moodData).length,
        primaryMood: moodData[0]?.[0] || 'Not specified', 
      };

      const input = {
        Questionnaire: JSON.stringify(moodData),
        QuestionnaireSummary: JSON.stringify(summary),
      };

      // for debugging: Capture the response from the mutation
      const response = await apolloClient.mutate({
        mutation: SAVE_MOOD_TRACKER_QUESTIONNAIRE_MUTATION,
        variables: { input },
      });

      //debugging: Log the successful return data from the backend
      console.log(
        '✅ Mood Tracker data successfully saved in backend:', 
        response.data?.saveMoodTrackerQuestionnaire
      );

      return true;
    } catch (error: any) {
      console.error('Error saving mood tracking data:', error);
      throw new Error(`Failed to save mood tracking data: ${error.message}`);
    }
  },

  // -- Fetch all saved Mood Trackers for the Dashboard --
  getMoodTrackers: async () => {
    try {
      const { data } = await apolloClient.query({
        query: GET_MOOD_TRACKER_QUESTIONNAIRES_QUERY,
        variables: { limit: 20 }, // Fetch the 10 most recent --> do we need more / all?
        fetchPolicy: 'network-only', // Always get fresh data for the dashboard
      });
      return data.getMoodTrackerQuestionnaires.items || [];
    } catch (error) {
      console.error('Error fetching mood trackers:', error);
      return [];
    }
  },

  // -- PING API --

  // -- Wake up the matching algorithm Lambda --
  pingMatchingAlgorithm: () => {
    // no "await" here! It's a "fire-and-forget" call.
    apolloClient
      .query({
        query: PING_LAMBDA_QUERY,
        fetchPolicy: 'network-only',
      })
      .catch((error) => {
        // We catch the error silently. If the ping fails, we don't want to
        // alert the user or stop them from continuing the questionnaire.
        console.debug('Ping Lambda failed (ignored):', error);
      });
  },
};
