import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import feeloraLogo from '@/assets/logo.png';

interface MoodOption {
  emoji: string;
  labelKey: string;
}

interface MoodCategory {
  questionKey: string;
  options: MoodOption[];
}

const moodCategoryDefs: MoodCategory[] = [
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

const MoodTrackerPage = () => {
  const { t } = useTranslation();
  const [selectedMoods, setSelectedMoods] = useState<Record<number, string[]>>({});

  const toggleMood = (categoryIndex: number, labelKey: string) => {
    setSelectedMoods((prev) => {
      const current = prev[categoryIndex] || [];
      if (current.includes(labelKey)) {
        return { ...prev, [categoryIndex]: current.filter((l) => l !== labelKey) };
      }
      return { ...prev, [categoryIndex]: [...current, labelKey] };
    });
  };

  const isMoodSelected = (categoryIndex: number, labelKey: string) => {
    return selectedMoods[categoryIndex]?.includes(labelKey) || false;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <img src={feeloraLogo} alt="Feelora" className="w-12 h-12" />
        <h1 className="text-2xl font-bold text-foreground">{t('patient.moodTracker.title')}</h1>
      </div>

      <hr className="border-border mb-6" />

      {/* Greeting Message */}
      <div className="flex items-start gap-3 mb-8">
        <img src={feeloraLogo} alt="Feelora" className="w-10 h-10" />
        <div className="bg-tertiary rounded-2xl rounded-bl-sm px-4 py-3 max-w-md">
          <p className="text-foreground">{t('patient.moodTracker.greeting')}</p>
        </div>
      </div>

      {/* Mood Categories */}
      <div className="space-y-8">
        {moodCategoryDefs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="feelora-card">
            <h3 className="font-semibold text-foreground mb-4">{t(category.questionKey)}</h3>
            <div className="flex flex-wrap gap-2">
              {category.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => toggleMood(categoryIndex, option.labelKey)}
                  className={`mood-chip ${
                    isMoodSelected(categoryIndex, option.labelKey) ? 'mood-chip-selected' : ''
                  }`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm">{t(option.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <button className="feelora-btn-primary px-8">
          {t('patient.moodTracker.next')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
