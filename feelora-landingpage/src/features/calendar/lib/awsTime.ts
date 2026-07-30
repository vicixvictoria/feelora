// AWSTime is "HH:MM:SS[.sss]" — native <input type="time"> and every local
// TimeSlot only ever deal in "HH:MM", so every service talking to the
// calendar/schedule backend pads/trims on the way in and out rather than
// touching the time-input UI.
export const toAWSTime = (time: string): string => (time.length === 5 ? `${time}:00` : time);
export const fromAWSTime = (time: string): string => time.slice(0, 5);
