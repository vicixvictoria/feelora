//import { ArrowLeft, ArrowRight, Home, House } from 'lucide-react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/questionnaire/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext'; 

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
  const { logout, user } = useAuth(); 

  const resolvedNextLabel = nextLabel ?? t('q.common.next');
  const resolvedBackLabel = backLabel ?? t('q.common.back');

  const handleQuickLogout = async () => {
    localStorage.removeItem('feelora_patient_v2');
    localStorage.removeItem('feelora_patient_v2_step');
    localStorage.removeItem('feelora_therapist_v1');
    localStorage.removeItem('feelora_therapist_v1_step');
    
    const isTherapist = user?.groups?.includes('type:T') || user?.groups?.includes('type:P');
    
    await logout(isTherapist ? 'therapist' : 'user'); 
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {showBack && !isFirstStep && (
        <Button variant="navOutline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {resolvedBackLabel}
        </Button>
      )}
      <Button variant="nav" onClick={handleQuickLogout}>
        {resolvedNextLabel}
        <Home className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
