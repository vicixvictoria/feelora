// Seed data for the portfolio demo (the real backend has been shut down).
//
// Cast:
// - Therapist: Dr. Eva Eddison
// - Her active patients: Nina Newton, Jon Doe, Tom Turbo, Mel Mandela
// - Her new patient (matched, therapy not started yet): Tina Tesla
// - The demo patient login is Nina Newton, matched to Dr. Eva Eddison.
//
// All dates are relative to "today" so the calendar, dashboards and chats
// always look current, whenever the screenshots are taken.
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import type { PatientProfile } from '@/features/patient/types/profiles';
import type { TherapistProfile } from '@/features/therapist/types/profiles';
import type { ChatMessage } from '@/features/chat/api/chatService';
import type { NotificationItem } from '@/features/notifications/api/notification-service';
import type { Homework, HomeworkNote, HomeworkNotes } from '@/features/homework/types/homework';
import type { Policy, Session, TimeSlot } from '@/features/calendar/types/session';
import type { TherapistSchedule } from '@/features/calendar/types/schedule';

// --- IDs --- //
export const EVA_ID = 'demo-therapist-eva-eddison';
export const NINA_ID = 'demo-patient-nina-newton';
export const JON_ID = 'demo-patient-jon-doe';
export const TOM_ID = 'demo-patient-tom-turbo';
export const MEL_ID = 'demo-patient-mel-mandela';
export const TINA_ID = 'demo-patient-tina-tesla';

// --- Shapes stored in the demo database --- //
export type DemoTherapist = TherapistProfile & {
  HasInsurance: boolean;
  PriceRange: string;
  Country: string;
};

export type DemoPatient = PatientProfile & {
  // Whether Dr. Eddison has formally started therapy (TherapistPatientsPage
  // splits "active" vs. "new" patients on this flag).
  sessionStarted: boolean;
};

export interface DemoMoodTracker {
  CreatedAt: string;
  Questionnaire: string;
  QuestionnaireSummary: string;
}

export interface DemoConversation {
  conversationId: string;
  participantIds: string[];
  createdAt: number;
}

export interface DemoDatabase {
  therapist: DemoTherapist;
  therapistDiscoverable: boolean;
  patients: Record<string, DemoPatient>;
  moodTrackers: Record<string, DemoMoodTracker[]>;
  conversations: DemoConversation[];
  messages: Record<string, ChatMessage[]>;
  notifications: Record<string, NotificationItem[]>;
  homeworks: Homework[];
  homeworkNotes: Record<string, HomeworkNotes>;
  sessions: Session[];
  schedule: TherapistSchedule;
  overrides: Record<string, TimeSlot[]>;
}

// --- Date helpers --- //
const now = new Date();
const DATE_KEY = 'yyyy-MM-dd';

const toUnixSeconds = (year: number, month: number, day: number) => Date.UTC(year, month - 1, day) / 1000;

const at = (daysAgo: number, hours: number, minutes = 0): Date => {
  const date = subDays(now, daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const hoursAgo = (hours: number): Date => new Date(now.getTime() - hours * 3_600_000);

// --- Profiles --- //
const therapist: DemoTherapist = {
  Id: EVA_ID,
  Email: 'eva.eddison@example.com',
  Name: 'Eva',
  Surname: 'Eddison',
  Title: 'Dr.',
  JobTitle: 'Psychotherapist',
  Gender: 'female',
  BirthDate: toUnixSeconds(1982, 4, 12),
  Country: 'AT',
  City: 'Vienna',
  Address: 'Praterstraße 42, 1020',
  Languages: ['german', 'english'],
  Availability: ['mo', 'di', 'mi', 'do'],
  Specialties: ['Depression', 'Stress', 'Trauma'],
  LicenseData: JSON.stringify({ licenseId: 'PT-2014-08731', pathToLicenseDocument: '' }),
  LicenseVerified: true,
  Matches: [NINA_ID, JON_ID, TOM_ID, MEL_ID, TINA_ID],
  HasInsurance: true,
  PriceRange: '90-120',
};

const patient = (
  profile: Omit<DemoPatient, 'Plan' | 'Matches' | 'Email'> & { Email?: string },
): DemoPatient => ({
  Plan: 'free',
  Matches: [EVA_ID],
  Email: profile.Email ?? `${profile.Name.toLowerCase()}.${profile.Surname.toLowerCase()}@example.com`,
  ...profile,
});

const patients: Record<string, DemoPatient> = {
  [NINA_ID]: patient({
    Id: NINA_ID,
    Name: 'Nina',
    Surname: 'Newton',
    Gender: 'female',
    BirthDate: toUnixSeconds(1996, 3, 18),
    City: 'Vienna',
    Languages: ['german', 'english'],
    Availability: ['di', 'do'],
    MoodTracker: true,
    sessionStarted: true,
  }),
  [JON_ID]: patient({
    Id: JON_ID,
    Name: 'Jon',
    Surname: 'Doe',
    Gender: 'male',
    BirthDate: toUnixSeconds(1989, 11, 2),
    City: 'Vienna',
    Languages: ['english', 'german'],
    Availability: ['mo'],
    MoodTracker: true,
    sessionStarted: true,
  }),
  [TOM_ID]: patient({
    Id: TOM_ID,
    Name: 'Tom',
    Surname: 'Turbo',
    Gender: 'male',
    BirthDate: toUnixSeconds(2001, 7, 25),
    City: 'Klosterneuburg',
    Languages: ['german'],
    Availability: ['mi'],
    // Tom hasn't consented to sharing his mood tracker — shows the
    // GDPR-locked state on the therapist's mood tracker page.
    MoodTracker: false,
    sessionStarted: true,
  }),
  [MEL_ID]: patient({
    Id: MEL_ID,
    Name: 'Mel',
    Surname: 'Mandela',
    Gender: 'female',
    BirthDate: toUnixSeconds(1993, 5, 9),
    City: 'Vienna',
    Languages: ['english', 'french'],
    Availability: ['do'],
    MoodTracker: true,
    sessionStarted: true,
  }),
  [TINA_ID]: patient({
    Id: TINA_ID,
    Name: 'Tina',
    Surname: 'Tesla',
    Gender: 'female',
    BirthDate: toUnixSeconds(1998, 1, 30),
    City: 'Vienna',
    Languages: ['german', 'croatian'],
    Availability: ['mo', 'mi'],
    MoodTracker: true,
    sessionStarted: false,
  }),
};

// --- Mood trackers --- //
// Answers are listed per question in mood-tracker.ts order (mood, sleep,
// food, exercise, physical, stress, focus, social, self-care, gratitude),
// using the label keys without their 'patient.moodTracker.' prefix.
const moodEntry = (createdAt: Date, answers: string[][]): DemoMoodTracker => {
  const questionnaire: Record<number, string[]> = {};
  answers.forEach((keys, index) => {
    if (keys.length > 0) questionnaire[index] = keys.map((key) => `patient.moodTracker.${key}`);
  });
  return {
    CreatedAt: createdAt.toISOString(),
    Questionnaire: JSON.stringify(questionnaire),
    QuestionnaireSummary: JSON.stringify({
      totalCategoriesAnswered: Object.keys(questionnaire).length,
      primaryMood: questionnaire[0]?.[0] ?? 'Not specified',
    }),
  };
};

const moodTrackers: Record<string, DemoMoodTracker[]> = {
  // Nina's entries show a gentle upward trend over the last three weeks.
  [NINA_ID]: [
    moodEntry(at(0, 8, 15), [['happy'], ['wellRested'], ['ateRegularly'], ['movedOutdoors'], ['energetic'], ['relaxedStress'], ['productive'], ['talkedToSomeone'], ['didSomethingForMe'], ['grateful', 'somethingGoodHappened']]),
    moodEntry(at(2, 21, 40), [['content'], ['somewhatTired'], ['ateRegularly'], ['brieflyOutside'], ['relaxed'], ['somewhatTense'], ['productive'], ['timeWithOthers'], ['relaxedMeditated'], ['grateful']]),
    moodEntry(at(4, 20, 5), [['content'], ['wellRested'], ['ateSmall'], ['movedOutdoors', 'lightMovement'], ['energetic'], ['somewhatTense'], ['distracted'], ['talkedToSomeone'], ['didSomethingNice'], ['somethingGoodHappened']]),
    moodEntry(at(7, 22, 10), [['neutral'], ['restlessSleep'], ['onlySnacked'], ['stayedInside'], ['exhausted'], ['stressedLevel'], ['distracted'], ['wantedAlone'], ['noSelfCare'], ['difficultDay']]),
    moodEntry(at(10, 19, 30), [['anxious'], ['somewhatTired'], ['ateRegularly'], ['brieflyOutside'], ['weak'], ['stressedLevel'], ['unmotivated'], ['talkedToSomeone'], ['relaxedMeditated'], ['grateful']]),
    moodEntry(at(14, 21, 0), [['anxious', 'tired'], ['barelySlept'], ['skippedMeal'], ['stayedInside'], ['exhausted'], ['overwhelmed'], ['unmotivated'], ['feltLonely'], ['noSelfCare'], ['nothingPositive']]),
    moodEntry(at(18, 20, 45), [['stressed'], ['restlessSleep'], ['onlySnacked'], ['noMovement'], ['exhausted'], ['overwhelmed'], ['distracted'], ['wantedAlone'], ['noSelfCare'], ['difficultDay']]),
  ],
  [JON_ID]: [
    moodEntry(at(1, 22, 30), [['tired'], ['barelySlept'], ['ateRegularly'], ['brieflyOutside'], ['exhausted'], ['somewhatTense'], ['distracted'], ['talkedToSomeone'], ['noSelfCare'], ['grateful']]),
    moodEntry(at(5, 21, 15), [['neutral'], ['somewhatTired'], ['ateRegularly'], ['didSports'], ['energetic'], ['somewhatTense'], ['productive'], ['timeWithOthers'], ['didSomethingForMe'], ['somethingGoodHappened']]),
    moodEntry(at(9, 23, 0), [['stressed'], ['restlessSleep'], ['ateTooMuch'], ['stayedInside'], ['weak'], ['stressedLevel'], ['unmotivated'], ['wantedAlone'], ['noSelfCare'], ['difficultDay']]),
  ],
  [TOM_ID]: [
    moodEntry(at(3, 18, 0), [['content'], ['wellRested'], ['ateRegularly'], ['didSports'], ['energetic'], ['relaxedStress'], ['productive'], ['timeWithOthers'], ['didSomethingNice'], ['grateful']]),
  ],
  [MEL_ID]: [
    moodEntry(at(1, 19, 20), [['happy', 'inLove'], ['wellRested'], ['ateRegularly'], ['movedOutdoors'], ['relaxed'], ['relaxedStress'], ['veryFocused'], ['timeWithOthers'], ['didSomethingNice'], ['somethingGoodHappened']]),
    moodEntry(at(6, 20, 0), [['content'], ['somewhatTired'], ['ateSmall'], ['lightMovement'], ['relaxed'], ['somewhatTense'], ['productive'], ['talkedToSomeone'], ['relaxedMeditated'], ['grateful']]),
  ],
  [TINA_ID]: [],
};

// --- Chats --- //
const conversationIdFor = (patientId: string) => `demo-conversation-${patientId.replace('demo-patient-', '')}`;

const chatScript: Record<string, Array<[from: string, sentAt: Date, content: string]>> = {
  [NINA_ID]: [
    [EVA_ID, at(6, 18, 10), "Hi Nina, thank you for today's session. As discussed, I've added the thought diary to your homework. Try to fill it in each evening – even a few lines are enough."],
    [NINA_ID, at(6, 19, 2), 'Thank you! It was really helpful to talk about the situation at work. I will start tonight.'],
    [NINA_ID, at(3, 21, 15), 'Quick question about the thought diary: should I also write down situations where I only felt a little anxious?'],
    [EVA_ID, at(2, 8, 40), 'Good question! Yes, especially those – smaller moments are often easier to look at calmly. Just rate the intensity from 0 to 10 next to each entry.'],
    [NINA_ID, at(2, 9, 5), 'Okay, that makes sense. I noticed the anxiety is a lot lower on days when I go for a walk at lunch.'],
    [EVA_ID, at(2, 9, 30), "That's a great observation. Let's look at it together in our next session."],
    [NINA_ID, hoursAgo(3), 'I finished the grounding exercise and added a few notes to the homework 😊'],
    [NINA_ID, hoursAgo(2), 'Looking forward to our session!'],
  ],
  [JON_ID]: [
    [JON_ID, at(5, 12, 20), 'Hi Dr. Eddison, could we keep our sessions in the afternoon from now on? I have client meetings until 13:30 most Mondays.'],
    [EVA_ID, at(5, 13, 5), "Hi Jon, of course – 14:00 on Mondays works for me. I've kept that slot for you."],
    [JON_ID, at(4, 9, 0), 'Perfect, thanks a lot!'],
    [EVA_ID, at(1, 17, 0), "Just a reminder to keep your sleep log going this week – it'll help us a lot on Monday."],
  ],
  [TOM_ID]: [
    [EVA_ID, at(8, 10, 15), "Hi Tom, here's the values worksheet we talked about. No pressure to finish it all at once."],
    [TOM_ID, at(7, 16, 40), "Thanks, I'll have a look at it over the weekend."],
    [TOM_ID, at(1, 20, 30), 'Started the worksheet – harder than I thought, but in a good way.'],
  ],
  [MEL_ID]: [
    [MEL_ID, at(9, 18, 0), 'Hi Eva, I did two of the three activities from my list this week! The pottery class was my favourite.'],
    [EVA_ID, at(9, 19, 10), "That's wonderful to hear, Mel! How did you feel afterwards?"],
    [MEL_ID, at(8, 8, 30), 'Calmer, and honestly a bit proud. I want to keep it going.'],
  ],
  [TINA_ID]: [
    [TINA_ID, hoursAgo(5), "Hello Dr. Eddison, I was matched with you through Feelora. I've been struggling with stress and sleep for a few months and would love to start therapy. When would you have time for an initial session?"],
  ],
};

const conversations: DemoConversation[] = Object.keys(chatScript).map((patientId) => ({
  conversationId: conversationIdFor(patientId),
  participantIds: [EVA_ID, patientId],
  createdAt: chatScript[patientId]![0]![1].getTime(),
}));

const messages: Record<string, ChatMessage[]> = Object.fromEntries(
  Object.entries(chatScript).map(([patientId, script]) => {
    const conversationId = conversationIdFor(patientId);
    return [
      conversationId,
      script.map(([from, sentAt, content], index) => ({
        messageId: `${conversationId}-message-${index + 1}`,
        conversationId,
        from,
        content,
        type: 'text',
        sentAt: sentAt.getTime(),
      })),
    ];
  }),
);

// --- Homework --- //
const homework = (
  id: string,
  patientId: string,
  status: Homework['status'],
  createdDaysAgo: number,
  updatedDaysAgo: number,
  title: string,
  description: string,
): Homework => ({
  id,
  patientId,
  therapistId: EVA_ID,
  createdAt: at(createdDaysAgo, 18, 0).toISOString(),
  updatedAt: at(updatedDaysAgo, 19, 0).toISOString(),
  status,
  title,
  description,
});

const homeworks: Homework[] = [
  homework('demo-homework-nina-winddown', NINA_ID, 'NEW', 0, 0, 'Evening wind-down routine',
    'Pick a fixed time each evening to put your phone away and do 15 minutes of something calming – reading, stretching or a warm shower. Write down how long it took you to fall asleep.'),
  homework('demo-homework-nina-thoughts', NINA_ID, 'IN_PROGRESS', 6, 1, 'Thought diary',
    'Each evening, note one situation that triggered anxiety, the automatic thought that came up, and a more balanced alternative thought. Rate the intensity from 0 to 10 before and after.'),
  homework('demo-homework-nina-grounding', NINA_ID, 'COMPLETED', 13, 0, '5-4-3-2-1 grounding exercise',
    'When you notice anxiety rising, name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell and 1 you can taste. Practise it at least three times this week.'),
  homework('demo-homework-jon-sleep', JON_ID, 'IN_PROGRESS', 7, 2, 'Two-week sleep log',
    'Track when you go to bed, roughly when you fall asleep, how often you wake up and how rested you feel in the morning (0–10).'),
  homework('demo-homework-jon-pmr', JON_ID, 'COMPLETED', 20, 10, 'Progressive muscle relaxation',
    'Follow the 15-minute progressive muscle relaxation audio once a day, ideally before bed.'),
  homework('demo-homework-tom-values', TOM_ID, 'NEW', 8, 8, 'Values worksheet',
    'Go through the life areas on the worksheet (relationships, work, health, leisure) and write down what matters most to you in each one.'),
  homework('demo-homework-mel-activation', MEL_ID, 'IN_PROGRESS', 10, 8, 'Behavioural activation: three pleasant activities',
    'Plan three small activities for this week that you used to enjoy, schedule them in your calendar, and note your mood before and after each one.'),
  homework('demo-homework-mel-gratitude', MEL_ID, 'COMPLETED', 24, 15, 'Gratitude journal',
    'Write down three things you are grateful for every evening for one week.'),
];

const note = (from: string, createdAt: Date, text: string): HomeworkNote => ({
  from,
  type: 'PATIENT',
  note: text,
  createdAt: createdAt.toISOString(),
});

const notesFor = (
  homeworkId: string,
  patientId: string,
  shareToTherapist: boolean,
  patientNotes: HomeworkNote[],
): HomeworkNotes => ({
  id: homeworkId,
  createdAt: patientNotes[0]!.createdAt,
  updatedAt: patientNotes[patientNotes.length - 1]!.createdAt,
  shareToPatient: false,
  shareToTherapist,
  patientNotes,
  therapistNotes: [],
  therapistId: EVA_ID,
  patientId,
});

const homeworkNotes: Record<string, HomeworkNotes> = {
  'demo-homework-nina-thoughts': notesFor('demo-homework-nina-thoughts', NINA_ID, true, [
    note(NINA_ID, at(5, 21, 30), "Felt anxious before the team meeting (7/10). Thought: \"Everyone will notice I'm unprepared.\" Balanced thought: \"I prepared well and I can ask questions if I need to.\" Afterwards: 4/10."),
    note(NINA_ID, at(3, 21, 0), 'Smaller moment on the tram (3/10). I calmed down quite quickly by focusing on my breathing.'),
    note(NINA_ID, at(1, 22, 5), "Didn't feel very anxious today – walked to work instead of taking the tram (2/10)."),
  ]),
  'demo-homework-nina-grounding': notesFor('demo-homework-nina-grounding', NINA_ID, true, [
    note(NINA_ID, at(9, 8, 10), 'Tried it before work – it was a bit awkward at first but it helped me slow down.'),
    note(NINA_ID, hoursAgo(3), 'Did the exercise three times this week. It works best for me in the morning before work.'),
  ]),
  // Jon writes notes but keeps them private — shows the "not shared" state.
  'demo-homework-jon-sleep': notesFor('demo-homework-jon-sleep', JON_ID, false, [
    note(JON_ID, at(4, 7, 30), 'Bed 23:40, asleep around 1:00, woke up twice. Rested: 4/10.'),
    note(JON_ID, at(2, 7, 15), 'Bed 23:00, asleep ~23:30. Rested: 6/10.'),
  ]),
  'demo-homework-mel-activation': notesFor('demo-homework-mel-activation', MEL_ID, true, [
    note(MEL_ID, at(9, 17, 45), 'Planned: pottery class, calling my sister, a walk in the Prater. Two done so far!'),
  ]),
};

// --- Calendar --- //
const slot = (startTime: string, endTime: string): TimeSlot => ({ startTime, endTime });

const cancellationPolicy: Policy = {
  minimalNoticeHours: 24,
  cancellationPolicy: 'Sessions cancelled less than 24 hours in advance will be charged in full.',
};

// 0 = Sunday .. 6 = Saturday
const schedule: TherapistSchedule = {
  slotsByDay: {
    0: [],
    1: [slot('09:00', '09:50'), slot('11:00', '11:50'), slot('14:00', '14:50'), slot('15:00', '15:50')],
    2: [slot('09:00', '09:50'), slot('10:00', '10:50'), slot('11:00', '11:50'), slot('13:00', '13:50')],
    3: [slot('09:00', '09:50'), slot('10:00', '10:50'), slot('14:00', '14:50')],
    4: [slot('10:00', '10:50'), slot('15:00', '15:50'), slot('16:00', '16:50'), slot('17:00', '17:50')],
    5: [],
    6: [],
  },
  bookingNoticeHours: 24,
  cancellationPolicy,
  lastUpdate: at(30, 12, 0).toISOString(),
};

const PRACTICE_ADDRESS = 'Praterstraße 42, 1020 Vienna';

// Weekly recurring sessions, Monday-based day offset (0 = Monday).
const recurringSessions: Array<{ patientId: string; dayOffset: number; startTime: string; endTime: string; address?: string }> = [
  { patientId: JON_ID, dayOffset: 0, startTime: '14:00', endTime: '14:50', address: PRACTICE_ADDRESS },
  { patientId: NINA_ID, dayOffset: 1, startTime: '10:00', endTime: '10:50', address: 'https://meet.example.com/eddison-newton' },
  { patientId: TOM_ID, dayOffset: 2, startTime: '09:00', endTime: '09:50', address: 'https://meet.example.com/eddison-turbo' },
  { patientId: MEL_ID, dayOffset: 3, startTime: '16:00', endTime: '16:50', address: PRACTICE_ADDRESS },
];

const currentMonday = startOfWeek(now, { weekStartsOn: 1 });

const createSession = (patientId: string, date: Date, startTime: string, endTime: string, address?: string): Session => {
  const dateKey = format(date, DATE_KEY);
  return {
    bookingId: `demo-booking-${patientId.replace('demo-patient-', '')}-${dateKey}`,
    patientId,
    patientEmail: patients[patientId]!.Email,
    therapistId: EVA_ID,
    therapistEmail: therapist.Email,
    date: dateKey,
    startTime,
    endTime,
    status: 'CONFIRMED',
    createdAt: subDays(date, 14).toISOString(),
    lastUpdatedAt: subDays(date, 7).toISOString(),
    cancellationPolicy,
    address,
  };
};

const sessions: Session[] = [];
for (let week = -6; week <= 8; week++) {
  for (const recurring of recurringSessions) {
    const date = addDays(currentMonday, week * 7 + recurring.dayOffset);
    // Leave the address off sessions more than two weeks out, so there's
    // always something for the therapist to fill in via the info dialog.
    const address = week <= 2 ? recurring.address : undefined;
    sessions.push(createSession(recurring.patientId, date, recurring.startTime, recurring.endTime, address));
  }
}
// Tina's first session — booked, but no address/link attached yet.
const tinaInitialSession = createSession(TINA_ID, addDays(currentMonday, 7), '11:00', '11:50');
tinaInitialSession.createdAt = hoursAgo(4).toISOString();
tinaInitialSession.lastUpdatedAt = tinaInitialSession.createdAt;
sessions.push(tinaInitialSession);

const ninaNextSession = sessions
  .filter((session) => session.patientId === NINA_ID && session.date >= format(now, DATE_KEY))
  .sort((a, b) => a.date.localeCompare(b.date))[0]!;

// --- Notifications (keyed by recipient) --- //
const notification = (
  recipientId: string,
  type: NonNullable<NotificationItem['type']>,
  id: string,
  createdAt: Date,
  extra: Partial<NotificationItem> = {},
): NotificationItem => ({
  recipientId,
  sk: `${type}#${id}`,
  type,
  createdAt: createdAt.toISOString(),
  updatedAt: createdAt.toISOString(),
  ...extra,
});

const notifications: Record<string, NotificationItem[]> = {
  [EVA_ID]: [
    notification(EVA_ID, 'new_message', conversationIdFor(NINA_ID), hoursAgo(2), {
      conversationId: conversationIdFor(NINA_ID),
      count: 2,
      senderName: 'Nina Newton',
    }),
    notification(EVA_ID, 'new_message', conversationIdFor(TINA_ID), hoursAgo(5), {
      conversationId: conversationIdFor(TINA_ID),
      count: 1,
      senderName: 'Tina Tesla',
    }),
    notification(EVA_ID, 'new_match', TINA_ID, hoursAgo(6), { matchedId: TINA_ID, senderName: 'Tina Tesla' }),
    notification(EVA_ID, 'new_session', tinaInitialSession.bookingId, hoursAgo(4), {
      bookingId: tinaInitialSession.bookingId,
      senderName: 'Tina Tesla',
    }),
    notification(EVA_ID, 'updated_homework', 'demo-homework-nina-grounding', hoursAgo(3), {
      homeworkId: 'demo-homework-nina-grounding',
      senderName: 'Nina Newton',
    }),
  ],
  [NINA_ID]: [
    notification(NINA_ID, 'new_homework', 'demo-homework-nina-winddown', hoursAgo(1), {
      homeworkId: 'demo-homework-nina-winddown',
      senderName: 'Eva Eddison',
    }),
    notification(NINA_ID, 'updated_session', ninaNextSession.bookingId, at(1, 18, 0), {
      bookingId: ninaNextSession.bookingId,
      senderName: 'Eva Eddison',
    }),
  ],
};

// A completed questionnaire for Dr. Eddison, so the therapist questionnaire
// route lands on its completion step like it would for a real, approved account.
export const EVA_QUESTIONNAIRE = JSON.stringify({
  personalData: { firstName: 'Eva', lastName: 'Eddison', title: 'Dr.', jobTitle: 'Psychotherapist', gender: 'female' },
  contactInfo: { city: 'Vienna', address: 'Praterstraße 42', postalCode: '1020' },
  languages: { selected: ['german', 'english'] },
  specialties: { selected: ['Depression', 'Stress', 'Trauma'] },
  availability: ['mo', 'di', 'mi', 'do'],
  priceRange: { kassenvertrag: true, priceDetails: '90-120' },
});

export const createSeedDatabase = (): DemoDatabase => ({
  therapist,
  therapistDiscoverable: true,
  patients,
  moodTrackers,
  conversations,
  messages,
  notifications,
  homeworks,
  homeworkNotes,
  sessions,
  schedule,
  overrides: {},
});
