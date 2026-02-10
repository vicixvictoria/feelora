import apiClient from '@/lib/axios';
import { QuestionnaireData } from '../types/questionnaire'; // Import the type above

export const patientService = {
 
// POST - Submit the questionnaire data to the backend
  submitQuestionnaire: async (data: QuestionnaireData) => {
   // 1. Construct the Payload to match Backend expectations
    const payload = {
      // The "AWSJSON!" field should expect the full data object - if it expects Stringified JSON: JSON.stringify(data) here
      Questionnaire: data, 

      //OPTIONAL The "filters" field can be used for specific fields we need for the algorithm - extract the relevant preferences from the data here
      filters: {
        languages: data.languages.selected,
        gender: data.therapistGender,
        setting: data.therapySetting,
        availability: data.availability,
        // Add any other criteria here
      }
    };

    // 2. Send the wrapped payload
    const response = await apiClient.post('/patient/onboarding', payload);
    return response.data;
  },

  
// GET - Fetch the patient's profile data from the backend
  getProfile: async () => {
    const response = await apiClient.get('/patient/profile');
    return response.data;
  }
};