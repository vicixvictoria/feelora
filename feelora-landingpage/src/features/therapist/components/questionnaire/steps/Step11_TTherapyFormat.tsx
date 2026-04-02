import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';

interface TherapyFormatStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

const NO_PREFERENCE = 'keine-praeferenz';

// 1. Define schema expecting a "selection" array
const step11Schema = z.object({
  selection: z.array(z.string()).min(1, "Bitte wähle mindestens eine Antwort aus"),
});

// Step Component
const Step11_TTherapyFormat = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: TherapyFormatStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  // 2. Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step11Schema,
    onNext,
  });

  const formatOptions = [
    {
      id: 'einzel',
      label: t('q.t.therapyFormat.individual'),
      description: t('q.t.therapyFormat.individualDesc'),
    },
    {
      id: 'paar',
      label: t('q.t.therapyFormat.couple'),
      description: t('q.t.therapyFormat.coupleDesc'),
    },
    {
      id: 'gruppe',
      label: t('q.t.therapyFormat.group'),
      description: t('q.t.therapyFormat.groupDesc'),
    },
    {
      id: 'familien',
      label: t('q.t.therapyFormat.family'),
      description: t('q.t.therapyFormat.familyDesc'),
    },
    { id: NO_PREFERENCE, label: t('q.t.therapyFormat.noPreference'), description: '' },
  ];

  // 3. Split standard options from the exclusive option for rendering
  const standardOptions = formatOptions.filter(opt => opt.id !== NO_PREFERENCE);
  const noPrefOption = formatOptions.find(opt => opt.id === NO_PREFERENCE);
  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError("selection");

    // Remove "keine Präferenz" if a specific format is clicked
    let currentSelection = safeData.filter((item) => item !== NO_PREFERENCE);

    if (currentSelection.includes(id)) {
      currentSelection = currentSelection.filter((item) => item !== id);
    } else {
      currentSelection = [...currentSelection, id];
    }
    
    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError("selection");
    
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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.therapyFormat.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.therapyFormat.subtitle')}</p>
        <p className={`text-sm ${errors.selection ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {errors.selection ? "Bitte wähle mindestens ein Format aus." : t('q.t.therapyFormat.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* 4. Visual error wrapper */}
        <div className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? "border border-destructive/50 bg-destructive/5" : ""}`}>
          
          {/* Standard Options */}
          {standardOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? "opacity-50 bg-muted/30" : ""
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

      {/* 5. Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step11_TTherapyFormat;