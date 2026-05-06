import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from 'lucide-react';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { therapistService } from '../../../api/therapist-service';

interface WelcomeStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Helper component for the expandable sections
const ExpandableSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-md mb-3 text-left overflow-hidden bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex justify-between items-center text-sm font-semibold text-foreground hover:bg-secondary/10 transition-colors"
      >
        {title}
        <ChevronDownIcon
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 text-sm text-muted-foreground bg-secondary/5 border-t border-border leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const Step1_TWelcome = ({ onNext, onBack }: WelcomeStepProps) => {
  const { t } = useTranslation();
  
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextWithConsent = async () => {
    if (!hasConsented) return;
    
    setIsLoading(true);
    // Log the consent in AWS before moving to the next page
    const success = await therapistService.submitConsent();
    setIsLoading(false);

    if (success) {
      onNext();
    } else {
      console.error("Failed to save consent");
    }
  };

  return (
    <div className="animate-slide-up text-center max-w-2xl mx-auto pb-12">
      <h1 className="text-2xl font-semibold text-purple mb-6">{t('q.t.welcome.title')}</h1>

      <p className="text-foreground text-body-large mb-4">{t('q.t.welcome.desc')}</p>
      <p className="text-foreground text-body-large mb-8">{t('q.t.welcome.questionCount')}</p>

      <hr className="border-t border-border mb-8 opacity-70" />

      <h3 className="text-foreground font-semibold text-body-large mb-8">{t('q.t.welcome.consentData')}</h3>

      {/* Expandable Legal Info container */}
      <div className="mb-8">
        <ExpandableSection title={t('q.t.welcome.sensibleData.title')}>
          {t('q.t.welcome.sensibleData.text')}
        </ExpandableSection>

        <ExpandableSection title={t('q.t.welcome.ai.title')}>
          {t('q.t.welcome.ai.text')}
        </ExpandableSection>

        <ExpandableSection title={t('q.t.welcome.tac.title')}>
          {t('q.t.welcome.tac.text1')}
          <a href="/termsandconditions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t('q.t.welcome.tac.link')}
          </a>
          {t('q.t.welcome.tac.text2')}
        </ExpandableSection>
      </div>

      {/* required Checkbox */}
      <div className="flex items-start gap-4 mb-8 p-4 bg-tertiary/10 rounded-md border border-tertiary/20 text-left">
        <input
          type="checkbox"
          id="therapist-consent"
          checked={hasConsented}
          onChange={(e) => setHasConsented(e.target.checked)}
          className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
        />
        <label htmlFor="therapist-consent" className="text-sm text-foreground cursor-pointer">
          {t('q.t.welcome.checkbox')}
        </label>
      </div>

      <div className={!hasConsented || isLoading ? "opacity-50 pointer-events-none" : ""}>
        <NavigationButtons 
          onBack={onBack} 
          onNext={handleNextWithConsent} 
          isFirstStep={true} 
        />
      </div>
      
      {isLoading && (
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">
          {t('q.t.welcome.saving')}
        </p>
      )}
    </div>
  );
};

export default Step1_TWelcome;