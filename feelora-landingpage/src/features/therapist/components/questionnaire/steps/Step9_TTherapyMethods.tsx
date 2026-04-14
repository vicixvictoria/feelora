import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

// Props Interface
interface TherapyMethodsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}

const Step9_TTherapyMethods = ({ onNext, onBack, data, onDataChange }: TherapyMethodsStepProps) => {
  const { t } = useTranslation();

  const handleChange = (value: string) => {
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
        {/* Added a small text hint that this is optional, depending on your translation keys */}
        <p className="text-foreground/80 mb-4">
          {t('q.t.therapyMethods.hint')} <span className="text-muted-foreground text-sm">(Optional)</span>
        </p>

        <div className="space-y-2">
          <Textarea
            placeholder={t('q.common.typePlaceholder')}
            value={data || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-[120px] resize-y bg-background"
          />
        </div>
      </div>

      {/* Directly pass onNext without validation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step9_TTherapyMethods;