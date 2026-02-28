import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

// Props Interface
interface TherapyMethodsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}

// 1. Define validationschema for a single text field
const step9Schema = z.object({
  methods: z.string().trim().min(1, 'Please describe your methods'),
});

const Step9_TTherapyMethods = ({ onNext, onBack, data, onDataChange }: TherapyMethodsStepProps) => {
  const { t } = useTranslation();

  // Initialize validationhook, wrapping the string `data` inside an object
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { methods: data || '' },
    schema: step9Schema,
    onNext,
  });

  const handleChange = (value: string) => {
    clearError('methods');
    onDataChange(value);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.therapyMethods.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.therapyMethods.subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <p className="text-foreground/80 mb-4">{t('q.t.therapyMethods.hint')}</p>

        {/* Validation styling on the Textarea */}
        <div className="space-y-2">
          <Textarea
            placeholder={t('q.common.typePlaceholder')}
            value={data || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`min-h-[120px] resize-y bg-background ${
              errors.methods ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          {errors.methods && (
            <p className="text-xs text-destructive font-medium">
              {t('q.t.therapyMethods.required')}
            </p>
          )}
        </div>
      </div>

      {/* Navigation with validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step9_TTherapyMethods;
