// src/constants/mood-tracker.ts

export interface MoodOption {
  emoji: string;
  labelKey: string;
}

export interface MoodCategory {
  questionKey: string;
  options: MoodOption[];
}

export const moodCategoryDefs: MoodCategory[] = [
  {
    questionKey: 'patient.moodTracker.howAreYou',
    options: [
      { emoji: '😊', labelKey: 'patient.moodTracker.happy' },
      { emoji: '😌', labelKey: 'patient.moodTracker.content' },
      { emoji: '😐', labelKey: 'patient.moodTracker.neutral' },
      { emoji: '😢', labelKey: 'patient.moodTracker.sad' },
      { emoji: '😰', labelKey: 'patient.moodTracker.anxious' },
      { emoji: '😤', labelKey: 'patient.moodTracker.stressed' },
      { emoji: '😴', labelKey: 'patient.moodTracker.tired' },
      { emoji: '😠', labelKey: 'patient.moodTracker.angry' },
      { emoji: '😕', labelKey: 'patient.moodTracker.confused' },
      { emoji: '🥰', labelKey: 'patient.moodTracker.inLove' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.enoughSleep',
    options: [
      { emoji: '😊', labelKey: 'patient.moodTracker.wellRested' },
      { emoji: '😴', labelKey: 'patient.moodTracker.somewhatTired' },
      { emoji: '💤', labelKey: 'patient.moodTracker.restlessSleep' },
      { emoji: '😩', labelKey: 'patient.moodTracker.barelySlept' },
      { emoji: '😵', labelKey: 'patient.moodTracker.tooMuchSleep' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.haveYouEaten',
    options: [
      { emoji: '🍽️', labelKey: 'patient.moodTracker.ateRegularly' },
      { emoji: '🥗', labelKey: 'patient.moodTracker.ateSmall' },
      { emoji: '🍿', labelKey: 'patient.moodTracker.onlySnacked' },
      { emoji: '❌', labelKey: 'patient.moodTracker.skippedMeal' },
      { emoji: '🤢', labelKey: 'patient.moodTracker.ateTooMuch' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.exercise',
    options: [
      { emoji: '🌳', labelKey: 'patient.moodTracker.movedOutdoors' },
      { emoji: '🚶', labelKey: 'patient.moodTracker.brieflyOutside' },
      { emoji: '🏠', labelKey: 'patient.moodTracker.stayedInside' },
      { emoji: '💪', labelKey: 'patient.moodTracker.didSports' },
      { emoji: '🧘', labelKey: 'patient.moodTracker.lightMovement' },
      { emoji: '💤', labelKey: 'patient.moodTracker.noMovement' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.physicalFeeling',
    options: [
      { emoji: '💚', labelKey: 'patient.moodTracker.energetic' },
      { emoji: '😌', labelKey: 'patient.moodTracker.relaxed' },
      { emoji: '😩', labelKey: 'patient.moodTracker.exhausted' },
      { emoji: '😣', labelKey: 'patient.moodTracker.pain' },
      { emoji: '🤒', labelKey: 'patient.moodTracker.sick' },
      { emoji: '😫', labelKey: 'patient.moodTracker.weak' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.stressLevel',
    options: [
      { emoji: '😌', labelKey: 'patient.moodTracker.relaxedStress' },
      { emoji: '😐', labelKey: 'patient.moodTracker.somewhatTense' },
      { emoji: '😤', labelKey: 'patient.moodTracker.stressedLevel' },
      { emoji: '🤯', labelKey: 'patient.moodTracker.overwhelmed' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.focusProductivity',
    options: [
      { emoji: '🎯', labelKey: 'patient.moodTracker.veryFocused' },
      { emoji: '😊', labelKey: 'patient.moodTracker.productive' },
      { emoji: '😐', labelKey: 'patient.moodTracker.distracted' },
      { emoji: '😞', labelKey: 'patient.moodTracker.unmotivated' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.socialConnection',
    options: [
      { emoji: '❤️', labelKey: 'patient.moodTracker.timeWithOthers' },
      { emoji: '💬', labelKey: 'patient.moodTracker.talkedToSomeone' },
      { emoji: '😔', labelKey: 'patient.moodTracker.feltLonely' },
      { emoji: '🚫', labelKey: 'patient.moodTracker.wantedAlone' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.selfCare',
    options: [
      { emoji: '💚', labelKey: 'patient.moodTracker.didSomethingForMe' },
      { emoji: '🎨', labelKey: 'patient.moodTracker.didSomethingNice' },
      { emoji: '🧘', labelKey: 'patient.moodTracker.relaxedMeditated' },
      { emoji: '🚫', labelKey: 'patient.moodTracker.noSelfCare' },
    ],
  },
  {
    questionKey: 'patient.moodTracker.gratitude',
    options: [
      { emoji: '🌟', labelKey: 'patient.moodTracker.somethingGoodHappened' },
      { emoji: '❤️', labelKey: 'patient.moodTracker.grateful' },
      { emoji: '😔', labelKey: 'patient.moodTracker.difficultDay' },
      { emoji: '❌', labelKey: 'patient.moodTracker.nothingPositive' },
    ],
  },
];

// --- MAGIC HELPER: Automatically generate the Emoji Dictionary! ---
export const emojiDictionary: Record<string, string> = {};

moodCategoryDefs.forEach((category) => {
  category.options.forEach((option) => {
    // This maps every labelKey directly to its emoji (e.g., "patient.moodTracker.happy" -> "😊")
    emojiDictionary[option.labelKey] = option.emoji;
  });
});
