// Detects the backend's confirmed-intentional "no Settings/OverrideSettings
// row exists yet" behavior: getSettings/getOverrideSettings/
// getTherapistAvailabilities throw a raw JS TypeError ("Cannot read
// property 'X' of undefined") instead of returning null per the schema,
// whenever a therapist hasn't created a schedule yet. Per the backend team,
// this is by design ("if there isn't a setting it will throw an error"),
// so it's indistinguishable from "you're a therapist/patient dealing with
// a therapist who has no schedule yet" — a normal empty state, not a
// failure. Matched loosely (V8 phrases this two different ways depending
// on Node version: "Cannot read property 'x' of undefined" vs "Cannot read
// properties of undefined (reading 'x')") so callers can treat it as an
// empty result while still letting every other error (network, auth,
// unexpected server errors) propagate and surface normally.
export const isMissingDataError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /cannot read propert(y|ies)/i.test(message);
};
