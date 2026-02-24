// src/types/profile.ts

// --- Patient/User Types ---
export interface PatientProfile {
  Id: string;
  Email: string;
  Name: string;
  Surname: string;
  Gender: string;
  BirthDate: number; 
  City: string;
  Languages: string[];
  Availability: string[];
  Matches?: string[] | null; 
  Plan: string;
  MoodTracker: boolean;
}

export interface MatchedUser {
  Id: string;
  Email?: string | null;
  Name?: string | null;
  Surname?: string | null;
  Gender?: string | null;
  BirthDate?: number | null;
  City?: string | null;
  Languages?: string[] | null;
  Availability?: string[] | null;
  MoodTracker?: boolean | null;
}

// --- Therapist Types ---
export interface TherapistProfile {
  Id: string;
  Email: string;
  Name: string;
  Surname: string;
  Gender: string;
  BirthDate: number;
  City: string;
  Languages: string[];
  Availability: string[];
  Specialties: string[];
  Matches?: string[] | null;
  Plan: string;
  Address?: string | null;
  LicenseData: any; // Assuming AWSJSON is parsed or kept as any/string
  LicenseVerified: string;
}

export interface MatchedTherapist {
  Id: string;
  Email?: string;
  Name?: string;
  Surname?: string;
  Gender?: string;
  BirthDate?: number; // Schema uses Float
  City?: string;
  Address?: string;
  LicenseVerified?: string;
  Languages?: string[];
  Availability?: string[];
  Specialties?: string[];
}

export interface AlgorithmMatch {
  Id: string;
  Email: string;
  Name: string;
  Surname: string;
  Gender: string;
  BirthDate: number;
  City: string;
  Languages: string[];
  Availability: string[];
  Specialties: string[];
  Address?: string;
  Title?: string;
  JobTitle: string;
  Ranking?: number;
}