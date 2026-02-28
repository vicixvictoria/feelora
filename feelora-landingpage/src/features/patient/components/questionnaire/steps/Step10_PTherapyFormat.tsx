import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface TherapyFormatStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// no preference always const
const NO_PREFERENCE = 'keine-praeferenz';

// List of therapy format options - add more if needed
const getFormatOptions = (t: (key: string) => string) => [
  { id: 'einzel', label: t('q.p.therapyFormat.options.individual.label'), description: t('q.p.therapyFormat.options.individual.description') },
  { id: 'paar', label: t('q.p.therapyFormat.options.couple.label'), description: t('q.p.therapyFormat.options.couple.description') },
  { id: 'gruppe', label: t('q.p.therapyFormat.options.group.label'), description: t('q.p.therapyFormat.options.group.description') },
  { id: 'familien', label: t('q.p.therapyFormat.options.family.label'), description: t('q.p.therapyFormat.options.family.description') },
];

// Define validation schema expecting an object with a "selection" array
const step10Schema = z.object({
  selection: z.array(z.string()).min(1, 'Bitte wähle mindestens ein Format aus'),
});

// Step Component
const Step10_PTherapyFormat = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: TherapyFormatStepProps) => {
  const { t } = useTranslation();
  const formatOptions = getFormatOptions(t);
  const safeData = data || [];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step10Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError('selection');

    // If they click a specific format, ensure "Keine Präferenz" is removed
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
      // Check it and wipe out all other selections
      onDataChange([NO_PREFERENCE]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.therapyFormat.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.therapyFormat.subtitle')}</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? t('q.p.therapyFormat.error') : t('q.p.therapyFormat.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {formatOptions.map((option) => (
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
                disabled={hasNoPreference} // Optional: physically disables the checkbox
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
            htmlFor="no-preference-format"
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="no-preference-format"
              checked={hasNoPreference}
              onCheckedChange={handleNoPreferenceToggle}
              className="mt-0.5"
            />
            <div className="flex flex-col">
              <span className="text-foreground">{t('q.p.therapyFormat.noPreference')}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step10_PTherapyFormat;
