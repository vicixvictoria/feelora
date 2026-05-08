import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface PreregistrationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const Step_Preregistration = ({ onNext, onBack }: PreregistrationStepProps) => {
  const { t } = useTranslation();

  return (
    <div className="animate-slide-up text-center max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-purple mb-6">{t('q.p.prereg.title')}</h1>

      <p className="text-foreground text-body-large mb-8">{t('q.p.prereg.desc')}</p>

      <p className="text-foreground text-body-large mb-12">{t('q.p.prereg.questionCount')}</p>

      <NavigationButtons onBack={onBack} onNext={onNext} isFirstStep={true} />
    </div>
  );
};

export default Step_Preregistration;