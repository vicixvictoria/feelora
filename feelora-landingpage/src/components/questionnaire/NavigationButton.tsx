import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/questionnaire/button';
import { useTranslation } from 'react-i18next';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  showBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isFirstStep?: boolean;
}

const NavigationButtons = ({
  onBack,
  onNext,
  showBack = true,
  nextLabel,
  backLabel,
  isFirstStep = false,
}: NavigationButtonsProps) => {
  const { t } = useTranslation();
  const resolvedNextLabel = nextLabel ?? t('q.common.next');
  const resolvedBackLabel = backLabel ?? t('q.common.back');
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {showBack && !isFirstStep && (
        <Button variant="navOutline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {resolvedBackLabel}
        </Button>
      )}
      <Button variant="nav" onClick={onNext}>
        {resolvedNextLabel}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
