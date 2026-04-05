import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import feeloraLogo from '@/assets/logo.png';
import { patientService } from '../api/patient-service';
import { moodCategoryDefs } from '@/components/ui/moodtracker/mood-tracker';

/*
interface MoodOption {
  emoji: string;
  labelKey: string;
}

interface MoodCategory {
  questionKey: string;
  options: MoodOption[];
}*/

const MoodTrackerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // <-- Initialize navigation

  const [selectedMoods, setSelectedMoods] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- Added loading state

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

  // --- Questionnaire SUBMIT HANDLER ---
  const handleSubmit = async () => {
    // Makes sure they answered at least one question
    if (Object.keys(selectedMoods).length === 0) {
      alert(t('patient.atleastOne'));
      return;
    }

    setIsSubmitting(true);
    try {
      await patientService.saveMoodTrackerQuestionnaire(selectedMoods);

      // Success - Send user back to their dashboard --> should they be send to a specific page ?? UX discussion
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Failed to submit mood tracker:', error);
      alert(t('patient.error.save'));
    } finally {
      setIsSubmitting(false);
    }
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
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="feelora-btn-primary px-8 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('patient.moodTracker.next', 'Weiter')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
