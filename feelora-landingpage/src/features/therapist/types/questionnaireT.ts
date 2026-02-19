// Helper type for "Selected + Other" pattern
export interface SelectionWithOther {
  selected: string[];
  other?: string;
}

// for Languages: Helper type for "Selected + Other (Array)" pattern (Used in Step 7)
export interface SelectionWithMultipleOther {
  selected: string[];
  other?: string[]; 
}

export interface TherapistPersonalData {
  firstName: string;
  lastName: string;
  gender: string;
  bday: string; // ISO date string
  phone?: string;
}

export interface TherapistContactInfo {
  city: string;
  street?: string;
  zip?: string;
  [key: string]: any;
}

export interface Qualifications {
  degree: string;
  institution: string;
  licenseNumber: string;
  idUpload: string | null;
  [key: string]: any;
}

// The Main Data Structure
export interface TherapistQuestionnaireData {
  personalData: TherapistPersonalData;
  contactInfo: TherapistContactInfo;
  qualifications: Qualifications;
  
  experience: string[];
  specialties: SelectionWithOther;
  languages: SelectionWithMultipleOther; // <-- Updated to use the new type with array for "other"
  
  therapySchool: SelectionWithOther;
  therapyMethods: string;
  therapySetting: string[];
  therapyFormat: string[];
  therapyDuration: string;
  sessionFrequency: string[];
  
  patientGender: string[];
  valuesPreferences: SelectionWithOther;
  additionalInfo: string;
  availability: string[];
}