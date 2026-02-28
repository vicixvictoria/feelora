import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

// Props Interface
interface SessionFrequencyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Extract the exclusive option
const NO_PREFERENCE = 'keine-praeferenz';

// List of session frequency options - add more if needed
const getFrequencyOptions = (t: (key: string) => string) => [
  { id: 'flexibel', label: t('q.p.sessionFrequency.options.flexible.label'), description: t('q.p.sessionFrequency.options.flexible.description') },
  { id: 'woechentlich', label: t('q.p.sessionFrequency.options.weekly.label'), description: t('q.p.sessionFrequency.options.weekly.description') },
  {
    id: 'zweiwoechentlich',
    label: t('q.p.sessionFrequency.options.biweekly.label'),
    description: t('q.p.sessionFrequency.options.biweekly.description'),
  },
];

// Define validation schema expecting an object with a "selection" array
const step12Schema = z.object({
  selection: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Frequenz aus'),
});

// Step Component
const Step12_PSessionFrequency = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: SessionFrequencyStepProps) => {
  const { t } = useTranslation();
  const frequencyOptions = getFrequencyOptions(t);
  const safeData = data || [];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step12Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError('selection');

    // Remove "Keine Präferenz" if a specific frequency is clicked
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
      // Uncheck it -> empty array
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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.sessionFrequency.title')}</h1>
        <p className="text-muted-foreground mb-2">
          {t('q.p.sessionFrequency.subtitle')}
        </p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? t('q.p.sessionFrequency.error') : t('q.p.sessionFrequency.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {frequencyOptions.map((option) => (
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
          <label
            htmlFor="no-preference-frequency"
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="no-preference-frequency"
              checked={hasNoPreference}
              onCheckedChange={handleNoPreferenceToggle}
              className="mt-0.5"
            />
            <div className="flex flex-col">
              <span className="text-foreground">{t('q.p.sessionFrequency.noPreference')}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step12_PSessionFrequency;
