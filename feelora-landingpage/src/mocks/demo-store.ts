// In-memory "backend" for the portfolio demo.
//
// The real backend (GraphQL API, auth service, websocket, S3) has been shut
// down, so every service in src/features/*/api now reads from and writes to
// this store instead. The original API calls are kept, commented out, right
// above each demo implementation.
//
// State lives in memory only: changes made while clicking around (sending a
// message, booking a session, …) survive in-app navigation and switching
// between the therapist and patient demo logins, and reset on page reload.
import { createSeedDatabase, EVA_ID, NINA_ID } from './demo-data';
import { createInitialsAvatar } from './demo-avatars';

export type DemoRole = 'therapist' | 'patient';

export const db = createSeedDatabase();

// --- Current demo user --- //
// Set by the demo AuthProvider: /therapist/* is Dr. Eva Eddison and
// /patient/* is Nina Newton.
let currentRole: DemoRole | null = null;

export const setDemoRole = (role: DemoRole | null) => {
  currentRole = role;
};

export const getDemoRole = () => currentRole;

export const getCurrentUserId = (): string => (currentRole === 'therapist' ? EVA_ID : NINA_ID);

// --- Change notifications (lets useMockQuery re-render after a write) --- //
const listeners = new Set<() => void>();

export const subscribeToDemoStore = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyDemoStoreChanged = () => {
  listeners.forEach((listener) => listener());
};

// --- Helpers --- //

// Short artificial delay so loading states still flash briefly, like they
// did against the real API. Always hands out a copy so callers can't
// mutate the store by accident.
export const respond = <T>(value: T, delayMs = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), delayMs));

export const fullNameOf = (userId: string): string => {
  if (userId === db.therapist.Id) {
    return `${db.therapist.Title ? `${db.therapist.Title} ` : ''}${db.therapist.Name} ${db.therapist.Surname}`;
  }
  const patient = db.patients[userId];
  return patient ? `${patient.Name} ${patient.Surname}` : '';
};

// Profile pictures: generated initials avatars, replaced by a real image
// once someone "uploads" one through the edit-profile pages.
const uploadedAvatars = new Map<string, string>();

export const getAvatarUrl = (userId: string): string | null => {
  if (uploadedAvatars.has(userId)) return uploadedAvatars.get(userId)!;
  const name = fullNameOf(userId);
  return name ? createInitialsAvatar(name, userId) : null;
};

export const setUploadedAvatar = (userId: string, objectUrl: string) => {
  uploadedAvatars.set(userId, objectUrl);
};
