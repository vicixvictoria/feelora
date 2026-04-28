import { CheckCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface CompletionStepProps {
  onRestart: () => void;
  onHome?: () => void;
}

const Step19_TCompletion = ({ onHome }: CompletionStepProps) => {
  const { t } = useTranslation();
  const { logout } = useAuth();


  const handleLogout = () => {
    if (onHome) {
      onHome();
    } else {
      logout('therapist');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in text-center py-12">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
      </div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-purple mb-4">{t('q.t.completion.title')}</h1>
      {/* Description */}
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
        {t('q.t.completion.description')}
      </p>
      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="ghost"
        className="text-muted-foreground hover:text-foreground w-full max-w-xs"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {t('common.backToHomepage', 'Zurück zur Homepage')}
      </Button>
    </div>
  );
};
export default Step19_TCompletion;
