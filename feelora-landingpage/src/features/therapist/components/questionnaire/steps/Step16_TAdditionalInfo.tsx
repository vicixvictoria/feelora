import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface AdditionalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}
const Step16_TAdditionalInfo = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: AdditionalInfoStepProps) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.additionalInfo.title')}</h1>
        <p className="text-muted-foreground">
          {t('q.t.additionalInfo.subtitle')}
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <p className="text-foreground/80 mb-4">
          {t('q.t.additionalInfo.prompt')}
        </p>
        <Textarea
          placeholder={t('q.t.additionalInfo.placeholder')}
          value={data}
          onChange={(e) => onDataChange(e.target.value)}
          className="min-h-[120px] resize-y bg-background"
        />
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step16_TAdditionalInfo;
