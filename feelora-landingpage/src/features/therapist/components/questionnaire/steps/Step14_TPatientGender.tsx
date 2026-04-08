import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';

interface PatientGenderStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// 1. Extract constant for stable logic
const NO_PREFERENCE = 'keine Präferenz';

// Step Component
const Step14_TPatientGender = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: PatientGenderStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  // 2. Define schema inside component with useMemo
  const step14Schema = useMemo(() => {
    return z.object({
      selection: z.array(z.string()).min(1, t('q.common.atleastOneError')),
    });
  }, [t]);

  // 3. Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step14Schema,
    onNext,
  });

  const genderOptions = [
    { id: 'männlich', label: t('q.t.patientGender.male') },
    { id: 'weiblich', label: t('q.t.patientGender.female') },
    { id: 'non-binary / divers', label: t('q.t.patientGender.nonBinary') },
    { id: NO_PREFERENCE, label: t('q.t.patientGender.noPreference') },
  ];

  // 4. Split options for rendering and exclusivity logic
  const standardOptions = genderOptions.filter((opt) => opt.id !== NO_PREFERENCE);
  const noPrefOption = genderOptions.find((opt) => opt.id === NO_PREFERENCE);
  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError('selection');

    // Remove "keine Präferenz" if a specific gender is clicked
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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.patientGender.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.patientGender.subtitle')}</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection
            ? t('q.t.patientGender.error', 'Bitte wähle mindestens eine Option aus')
            : t('q.common.multiSelect', 'Mehrfachauswahl möglich')}
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
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={safeData.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          {noPrefOption && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox checked={hasNoPreference} onCheckedChange={handleNoPreferenceToggle} />
              <span className="text-foreground font-medium">{noPrefOption.label}</span>
            </label>
          )}
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step14_TPatientGender;
