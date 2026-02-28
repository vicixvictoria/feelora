import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface CompletionStepProps {
  onRestart: () => void;
}
const Step19_TCompletion = ({ onRestart }: CompletionStepProps) => {
  const { t } = useTranslation();
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
      {/* Restart Button */}
      <Button onClick={onRestart} className="feelora-btn-outline">
        {t('q.t.completion.restart')}
      </Button>
    </div>
  );
};
export default Step19_TCompletion;
