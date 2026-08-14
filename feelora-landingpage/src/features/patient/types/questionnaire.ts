// 1. Helper type for "Selected + Other" pattern
export interface SelectionWithOther {
  selected: string[];
  other?: string;
}

// for Languages: Helper type for "Selected + Other (Array)" pattern (Used in Step 7)
export interface SelectionWithMultipleOther {
  selected: string[];
  other?: string[];
}

// Therapy school orientations, used both for direct selection and for scoring the determination quiz
export type TherapySchoolId = 'psychodynamic' | 'humanistic' | 'systemic' | 'behavioral';

export interface TherapySchoolQuizAnswer {
  questionId: number;
  school: TherapySchoolId;
}

// Step 8: direct selection as before, or (if the user didn't know) answers to the 10-question determination quiz
export interface TherapySchoolData extends SelectionWithOther {
  quizAnswers?: TherapySchoolQuizAnswer[];
}

// 2. The Main Data Structure
export interface QuestionnaireData {
  // Use specific types if known (e.g., string instead of any)
  personalData: Record<string, any>;
  contactInfo: Record<string, any>;

  mentalHealth: SelectionWithOther;
  timeframe: string[];

  previousTherapy: SelectionWithOther & {
    neverHadTherapy: boolean;
  };

  languages: SelectionWithMultipleOther; // <-- Updated to use the new type with array for "other"
  therapySchool: TherapySchoolData;

  therapySetting: string[];
  therapyFormat: string[];
  therapyDuration: string;
  sessionFrequency: string[];
  therapistGender: string[];

  valuesPreferences: SelectionWithOther;
  additionalInfo: string;
  availability: string[];
}

export interface Match {
  Id: string;
  filters?: string; // AWSJSON from schema
  description?: string; // AWSJSON from schema
}

export interface MatchingAlgorithmResponse {
  matchingAlgorithm: Match[];
}

// If we eventually fetch the full therapist details
export interface MatchedTherapist {
  Id: string;
  Email?: string;
  Name?: string;
  Gender?: string;
  City?: string;
  LicenseVerified?: string;
}
