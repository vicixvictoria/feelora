import { useMemo } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';

interface TherapyDurationStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}

// Step Component
const Step12_TTherapyDuration = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: TherapyDurationStepProps) => {
  const { t } = useTranslation();

  // 1. Define schema inside component using useMemo
  const step12Schema = useMemo(() => {
    return z.object({
      selection: z.string().min(1, t('q.t.therapyDuration.error', 'Bitte wähle eine Option aus')),
    });
  }, [t]);

  // 2. Initialize validation hook, wrapping the raw string into an object
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: data || '' },
    schema: step12Schema,
    onNext,
  });

  const durationOptions = [
    {
      id: 'kurzzeit',
      label: t('q.t.therapyDuration.shortTerm'),
      description: t('q.t.therapyDuration.shortTermDesc'),
    },
    {
      id: 'langzeit',
      label: t('q.t.therapyDuration.longTerm'),
      description: t('q.t.therapyDuration.longTermDesc'),
    },
    { id: 'unsicher', label: t('q.t.therapyDuration.unsure'), description: '' },
    { id: 'keine-praeferenz', label: t('q.t.therapyDuration.noPreference'), description: '' },
  ];

  // 3. Custom handler to clear error when an option is clicked
  const handleValueChange = (value: string) => {
    clearError('selection');
    onDataChange(value);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.therapyDuration.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.therapyDuration.subtitle')}</p>
        {/* Dynamic error message */}
        {errors.selection && (
          <p className="text-sm text-destructive font-semibold mt-2">
            {t('q.t.therapyDuration.error', 'Bitte wähle eine Option aus.')}
          </p>
        )}
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* 4. Visual error wrapper for the entire RadioGroup */}
        <div className={`p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}>
          <RadioGroup value={data || ''} onValueChange={handleValueChange} className="space-y-3">
            {durationOptions.map((option) => {
              const isSelected = data === option.id;

              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-purple bg-purple/5' 
                      : errors.selection
                        ? 'border-destructive/50 hover:bg-destructive/10'
                        : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={option.id} className="mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-foreground">{option.label}</span>
                    {option.description && (
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    )}
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      </div>
      
      {/* 5. Swap onNext for validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step12_TTherapyDuration;