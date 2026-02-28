import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

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

  const durationOptions = [
    { id: 'kurzzeit', label: t('q.t.therapyDuration.shortTerm'), description: t('q.t.therapyDuration.shortTermDesc') },
    { id: 'langzeit', label: t('q.t.therapyDuration.longTerm'), description: t('q.t.therapyDuration.longTermDesc') },
    { id: 'unsicher', label: t('q.t.therapyDuration.unsure'), description: '' },
    { id: 'keine-praeferenz', label: t('q.t.therapyDuration.noPreference'), description: '' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.therapyDuration.title')}</h1>
        <p className="text-muted-foreground">
          {t('q.t.therapyDuration.subtitle')}
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <RadioGroup value={data} onValueChange={onDataChange} className="space-y-3">
          {durationOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value={option.id} className="mt-0.5" />
              <div className="flex flex-col">
                <span className="text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step12_TTherapyDuration;
