import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onNext: () => void;
  onBack: () => void;
}

const Step1_TWelcome = ({ onNext, onBack }: WelcomeStepProps) => {
  const { t } = useTranslation();

  return (
    <div className="animate-slide-up text-center max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-purple mb-6">{t('q.t.welcome.title')}</h1>

      <p className="text-foreground text-body-large mb-8">{t('q.t.welcome.desc')}</p>

      <p className="text-foreground text-body-large mb-12">{t('q.t.welcome.questionCount')}</p>

      <NavigationButtons onBack={onBack} onNext={onNext} isFirstStep={true} />
    </div>
  );
};

export default Step1_TWelcome;
