import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface ExperienceStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[]; // Still an array to match your interface
  onDataChange: (data: string[]) => void;
}

// Define validation schema expecting an object with a "selection" array
const step5Schema = z.object({
  selection: z.array(z.string()).min(1, 'Please select an option'),
});

const Step5_TExperience = ({ onNext, onBack, data, onDataChange }: ExperienceStepProps) => {
  const { t } = useTranslation();

  const experienceOptions = [
    {
      id: 'supervision',
      label: t('q.t.experience.supervision'),
      description: t('q.t.experience.supervisionDesc'),
    },
    {
      id: '1-3years',
      label: t('q.t.experience.1to3years'),
      description: t('q.t.experience.1to3yearsDesc'),
    },
    {
      id: '3+years',
      label: t('q.t.experience.3plusYears'),
      description: '',
    },
  ];

  const safeData = data || [];
  const currentValue = safeData[0] || '';

  // Initialize validation  hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step5Schema,
    onNext,
  });

  const handleValueChange = (value: string) => {
    clearError('selection'); // Clear error on selection
    onDataChange([value]);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.experience.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.experience.subtitle')}</p>
        {/* Error message in header */}
        {errors.selection && (
          <p className="text-sm text-destructive font-semibold mt-2">
            {t('q.t.experience.selectError')}
          </p>
        )}
      </div>

      <div className="feelora-card">
        {/* Visual error wrapper around the RadioGroup */}
        <div
          className={`p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          <RadioGroup value={currentValue} onValueChange={handleValueChange} className="space-y-4">
            {experienceOptions.map((option) => {
              const isSelected = currentValue === option.id;

              return (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-purple bg-purple/5'
                      : errors.selection
                        ? 'border-destructive/50 hover:bg-destructive/10'
                        : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-muted-foreground text-sm">{option.description}</span>
                    )}
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step5_TExperience;
