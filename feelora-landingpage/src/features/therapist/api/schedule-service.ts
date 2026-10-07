// PORTFOLIO DEMO MODE: the backend is offline, so the real API calls below are
// commented out (not deleted) and `scheduleService` at the bottom of this file
// serves demo data from src/mocks instead.
//
// Real backend integration for the therapist's own recurring schedule and
// per-date overrides (schema.graphql: Settings/OverrideSettings, both
// @aws_auth(cognito_groups: ["type:T"]) — therapist-only, no patient path
// exists for either).
// import { gql } from '@apollo/client';
// import { apolloClient, isCacheStale, markCacheFresh } from '@/lib/apollo-client';
// import { fromAWSTime, toAWSTime } from '@/features/calendar/lib/awsTime';
// import { isMissingDataError } from '@/features/calendar/lib/graphqlErrors';
// import { Policy, TimeSlot } from '@/features/calendar/types/session';
import { TimeSlot } from '@/features/calendar/types/session';
import { DateOverride, TherapistSchedule } from '@/features/calendar/types/schedule';
import { db, notifyDemoStoreChanged, respond } from '@/mocks/demo-store';

// // Index = weekday number (0=Sunday..6=Saturday), value = the matching
// // Settings field name on the backend.
// const DAY_FIELD_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//
// const SETTINGS_FIELDS = `
//   Mon { Start End }
//   Tue { Start End }
//   Wed { Start End }
//   Thu { Start End }
//   Fri { Start End }
//   Sat { Start End }
//   Sun { Start End }
//   MinimalNotice
//   CancellationPolicy { MinimalNotice CancellationPolicy }
//   LastUpdate
// `;
//
// const GET_SETTINGS_QUERY = gql`
//   query GetSettings {
//     getSettings {
//       ${SETTINGS_FIELDS}
//     }
//   }
// `;
//
// const CREATE_SETTINGS_MUTATION = gql`
//   mutation CreateSettings($input: SettingsInput!) {
//     createSettings(input: $input) {
//       ${SETTINGS_FIELDS}
//     }
//   }
// `;
//
// const UPDATE_SETTINGS_MUTATION = gql`
//   mutation UpdateSettings($input: SettingsUpdateInput!) {
//     updateSettings(input: $input) {
//       ${SETTINGS_FIELDS}
//     }
//   }
// `;
//
// const OVERRIDE_FIELDS = `
//   Date
//   Availabilities { Start End }
//   LastUpdate
// `;
//
// const GET_OVERRIDE_SETTINGS_QUERY = gql`
//   query GetOverrideSettings($date: AWSDate!) {
//     getOverrideSettings(Date: $date) {
//       ${OVERRIDE_FIELDS}
//     }
//   }
// `;
//
// const OVERRIDE_SETTINGS_MUTATION = gql`
//   mutation OverrideSettings($input: OverrideSettingsInput!) {
//     overrideSettings(input: $input) {
//       ${OVERRIDE_FIELDS}
//     }
//   }
// `;
//
// interface RemoteTimeSlot {
//   Start: string;
//   End: string;
// }
// interface RemotePolicy {
//   MinimalNotice: number;
//   CancellationPolicy: string;
// }
// interface RemoteSettings {
//   MinimalNotice: number;
//   CancellationPolicy: RemotePolicy;
//   LastUpdate: string;
//   [dayField: string]: RemoteTimeSlot[] | number | RemotePolicy | string;
// }
//
// const toSlotsByDay = (settings: RemoteSettings): Record<number, TimeSlot[]> => {
//   const slotsByDay: Record<number, TimeSlot[]> = {};
//   DAY_FIELD_NAMES.forEach((field, day) => {
//     const daySlots = (settings[field] as RemoteTimeSlot[] | undefined) ?? [];
//     slotsByDay[day] = daySlots.map((slot) => ({
//       startTime: fromAWSTime(slot.Start),
//       endTime: fromAWSTime(slot.End),
//     }));
//   });
//   return slotsByDay;
// };
//
// const fromSlotsByDay = (slotsByDay: Record<number, TimeSlot[]>): Record<string, RemoteTimeSlot[]> => {
//   const input: Record<string, RemoteTimeSlot[]> = {};
//   DAY_FIELD_NAMES.forEach((field, day) => {
//     input[field] = (slotsByDay[day] ?? []).map((slot) => ({
//       Start: toAWSTime(slot.startTime),
//       End: toAWSTime(slot.endTime),
//     }));
//   });
//   return input;
// };
//
// const toPolicy = (policy: RemotePolicy): Policy => ({
//   minimalNoticeHours: policy.MinimalNotice,
//   cancellationPolicy: policy.CancellationPolicy,
// });
//
// const fromPolicy = (policy: Policy): RemotePolicy => ({
//   MinimalNotice: policy.minimalNoticeHours,
//   CancellationPolicy: policy.cancellationPolicy,
// });
//
// const toTherapistSchedule = (settings: RemoteSettings): TherapistSchedule => ({
//   slotsByDay: toSlotsByDay(settings),
//   bookingNoticeHours: settings.MinimalNotice,
//   cancellationPolicy: toPolicy(settings.CancellationPolicy),
//   lastUpdate: settings.LastUpdate,
// });
//
// export const scheduleService = {
//   // Returns null if the therapist hasn't created settings yet — the
//   // backend has no upsert, so this tells the caller whether the next save
//   // must go through createSettings (first time) or updateSettings.
//   async getSchedule(forceRefresh = false): Promise<TherapistSchedule | null> {
//     const CACHE_KEY = 'therapist:getSettings';
//     const useNetwork = forceRefresh || isCacheStale(CACHE_KEY);
//     try {
//       const { data } = await apolloClient.query({
//         query: GET_SETTINGS_QUERY,
//         fetchPolicy: useNetwork ? 'network-only' : 'cache-first',
//       });
//       if (useNetwork) markCacheFresh(CACHE_KEY);
//       if (!data.getSettings) return null;
//       return toTherapistSchedule(data.getSettings);
//     } catch (error) {
//       if (isMissingDataError(error)) return null;
//       throw error;
//     }
//   },
//
//   async saveSchedule(
//     schedule: Pick<TherapistSchedule, 'slotsByDay' | 'bookingNoticeHours' | 'cancellationPolicy'>,
//     isFirstSave: boolean,
//   ): Promise<TherapistSchedule> {
//     const input = {
//       ...fromSlotsByDay(schedule.slotsByDay),
//       MinimalNotice: schedule.bookingNoticeHours,
//       CancellationPolicy: fromPolicy(schedule.cancellationPolicy),
//     };
//     const { data } = await apolloClient.mutate({
//       mutation: isFirstSave ? CREATE_SETTINGS_MUTATION : UPDATE_SETTINGS_MUTATION,
//       variables: { input },
//     });
//     return toTherapistSchedule(isFirstSave ? data.createSettings : data.updateSettings);
//   },
//
//   // Returns null if the date has no override yet — the recurring schedule
//   // applies to it as-is.
//   async getOverride(date: string): Promise<DateOverride | null> {
//     try {
//       const { data } = await apolloClient.query({
//         query: GET_OVERRIDE_SETTINGS_QUERY,
//         variables: { date },
//         fetchPolicy: 'network-only',
//       });
//       const override = data.getOverrideSettings;
//       if (!override) return null;
//       return {
//         date: override.Date,
//         availabilities: override.Availabilities.map((slot: RemoteTimeSlot) => ({
//           startTime: fromAWSTime(slot.Start),
//           endTime: fromAWSTime(slot.End),
//         })),
//       };
//     } catch (error) {
//       if (isMissingDataError(error)) return null;
//       throw error;
//     }
//   },
//
//   async saveOverride(date: string, availabilities: TimeSlot[]): Promise<DateOverride> {
//     const { data } = await apolloClient.mutate({
//       mutation: OVERRIDE_SETTINGS_MUTATION,
//       variables: {
//         input: {
//           Date: date,
//           Availabilities: availabilities.map((slot) => ({
//             Start: toAWSTime(slot.startTime),
//             End: toAWSTime(slot.endTime),
//           })),
//         },
//       },
//     });
//     const override = data.overrideSettings;
//     return {
//       date: override.Date,
//       availabilities: override.Availabilities.map((slot: RemoteTimeSlot) => ({
//         startTime: fromAWSTime(slot.Start),
//         endTime: fromAWSTime(slot.End),
//       })),
//     };
//   },
// };

// --- Demo Service Object (portfolio mode — serves src/mocks data, no network) --- //
export const scheduleService = {
  async getSchedule(_forceRefresh = false): Promise<TherapistSchedule | null> {
    return respond(db.schedule);
  },

  async saveSchedule(
    schedule: Pick<TherapistSchedule, 'slotsByDay' | 'bookingNoticeHours' | 'cancellationPolicy'>,
    _isFirstSave: boolean,
  ): Promise<TherapistSchedule> {
    db.schedule = { ...structuredClone(schedule), lastUpdate: new Date().toISOString() };
    notifyDemoStoreChanged();
    return respond(db.schedule, 400);
  },

  async getOverride(date: string): Promise<DateOverride | null> {
    const availabilities = db.overrides[date];
    return respond(availabilities ? { date, availabilities } : null);
  },

  async saveOverride(date: string, availabilities: TimeSlot[]): Promise<DateOverride> {
    db.overrides[date] = structuredClone(availabilities);
    notifyDemoStoreChanged();
    return respond({ date, availabilities }, 300);
  },
};
