// Shared calendar/booking types. These mirror the shape a future backend
// API is expected to return, so mockCalendarService.ts can be swapped for
// real GraphQL calls later without touching the pages/components that use it.

export type AppointmentType = 'online' | 'in_person' | 'phone';

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  therapistName: string;
  date: string; // 'yyyy-MM-dd'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  type: AppointmentType;
  meetingLink?: string;
  location?: string;
}

export interface TimeSlot {
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
}

// Payload for creating an appointment (booking or demo-seeding).
export interface BookAppointmentInput {
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  meetingLink?: string;
  location?: string;
}
