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
}