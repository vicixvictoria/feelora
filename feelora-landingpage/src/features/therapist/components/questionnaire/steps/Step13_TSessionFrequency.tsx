import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

// Props Interface
interface SessionFrequencyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// 1. Extract the exclusive option constant
const NO_PREFERENCE = 'keine-praeferenz';

// Step Component
const Step13_TSessionFrequency = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: SessionFrequencyStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  // 2. Define validation schema inside component with useMemo
  const step13Schema = useMemo(() => {
    return z.object({
      selection: z
        .array(z.string())
        .min(1, t('q.common.selectAtLeastOne', 'Bitte wähle mindestens eine Option aus'))
        .max(3, t('q.t.sessionFrequency.errorMax', 'Bitte wähle maximal 3 Optionen aus')),
    });
  }, [t]);

  // 3. Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step13Schema,
    onNext,
  });

  const frequencyOptions = [
    {
      id: 'flexibel',
      label: t('q.t.sessionFrequency.flexible'),
      description: t('q.t.sessionFrequency.flexibleDesc'),
    },
    {
      id: 'woechentlich',
      label: t('q.t.sessionFrequency.weekly'),
      description: t('q.t.sessionFrequency.weeklyDesc'),
    },
    {
      id: 'zweiwoechentlich',
      label: t('q.t.sessionFrequency.biweekly'),
      description: t('q.t.sessionFrequency.biweeklyDesc'),
    },
    { id: NO_PREFERENCE, label: t('q.t.sessionFrequency.noPreference'), description: '' },
  ];

  // 4. Split options for rendering
  const standardOptions = frequencyOptions.filter((opt) => opt.id !== NO_PREFERENCE);
  const noPrefOption = frequencyOptions.find((opt) => opt.id === NO_PREFERENCE);
  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError('selection');

    // Remove "keine Präferenz" if a specific frequency is clicked
    let currentSelection = safeData.filter((item) => item !== NO_PREFERENCE);

    if (currentSelection.includes(id)) {
      currentSelection = currentSelection.filter((item) => item !== id);
    } else {
      currentSelection = [...currentSelection, id];
    }

    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError('selection');

    if (hasNoPreference) {
      // Uncheck it
      onDataChange([]);
    } else {
      // Check it -> wipe out all other selections
      onDataChange([NO_PREFERENCE]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.sessionFrequency.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.sessionFrequency.subtitle')}</p>
        <p className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
          {errors.selection 
            ? t('q.common.selectAtLeastOne') 
            : t('q.t.sessionFrequency.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {standardOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={safeData.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                className="mt-0.5"
                disabled={hasNoPreference}
              />
              <div className="flex flex-col">
                <span className="text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          ))}

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          {noPrefOption && (
            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox
                checked={hasNoPreference}
                onCheckedChange={handleNoPreferenceToggle}
                className="mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-foreground">{noPrefOption.label}</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step13_TSessionFrequency;