// 1. Helper type for "Selected + Other" pattern
export interface SelectionWithOther {
  selected: string[];
  other?: string;
}

// 2. The Main Data Structure
export interface QuestionnaireData {
  // Use specific types if known (e.g., string instead of any)
  personalData: Record<string, any>; 
  contactInfo: Record<string, any>; 
  
  mentalHealth: SelectionWithOther;
  timeframe: string[]; 
  
  previousTherapy: SelectionWithOther & { 
    neverHadTherapy: boolean 
  };
  
  languages: SelectionWithOther;
  therapySchool: SelectionWithOther;
  
  therapySetting: string[];
  therapyFormat: string[];
  therapyDuration: string;
  sessionFrequency: string[];
  therapistGender: string[];
  
  valuesPreferences: SelectionWithOther;
  additionalInfo: string;
  availability: string[];
}