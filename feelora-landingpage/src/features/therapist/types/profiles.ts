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
  Address?: string;
  Title?: string;
  JobTitle?: string;
  LicenseData: string; // This will be a JSON string that we can parse into an object
  LicenseVerified: boolean;
}
