// The AWSTime scalar is officially "HH:MM:SS[.sss]", but this backend's own
// resolvers assume seconds-less "HH:MM" and choke on anything else — e.g.
// deleteSession's "unconverted data remains: :00" crash when computing the
// cancellation notice period, caused by createSession having sent
// "HH:MM:00". Per the backend dev: send "HH:MM", no seconds. So sending is
// now a pass-through (every local TimeSlot is already "HH:MM"); fromAWSTime
// still trims to 5 chars on the way back in case a response ever includes
// seconds anyway.
export const toAWSTime = (time: string): string => time;
export const fromAWSTime = (time: string): string => time.slice(0, 5);
