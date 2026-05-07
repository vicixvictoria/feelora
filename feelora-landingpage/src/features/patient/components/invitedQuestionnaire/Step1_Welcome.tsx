import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from 'lucide-react';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { patientService } from '../../api/patient-service'; 

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

const Step1_PWelcome = ({ onNext, onBack }: WelcomeStepProps) => {
  const { t } = useTranslation();
  
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextWithConsent = async () => {
    if (!hasConsented) return;
    
    setIsLoading(true);
    // Log the consent in AWS before moving to the next page
    const success = await patientService.submitConsent();
    setIsLoading(false);

    if (success) {
      onNext();
    } else {
      console.error("Failed to save patient consent");
      // Optional: Add a toast notification here if the backend call fails,
      // or fallback to letting them proceed if you want to ensure no drop-offs during MVP.
      // onNext();
    }
  };

  return (
    <div className="animate-slide-up text-center max-w-2xl mx-auto pb-12">
      <h1 className="text-2xl font-semibold text-purple mb-6">{t('q.p.welcome.title')}</h1>

      <p className="text-foreground text-body-large mb-4">{t('q.p.welcome.desc')}</p>
      <p className="text-foreground text-body-large mb-8">{t('q.p.welcome.questionCount')}</p>

      {/* --- Subtle Divider --- */}
      <hr className="border-t border-border mb-8 opacity-70" />

      {/* Reusing the consentData translation key or creating a patient specific one */}
      <h3 className="text-foreground font-semibold text-body-large mb-6">
        {t('q.p.welcome.consentData', 'Wichtige Hinweise vor dem Start')}
      </h3>

      {/* Expandable Legal Info container */}
      <div className="mb-8">
        <ExpandableSection title={t('q.p.welcome.sensibleData.title')}>
          {t('q.p.welcome.sensibleData.text')}
        </ExpandableSection>

        <ExpandableSection title={t('q.p.welcome.ai.title')}>
          {t('q.p.welcome.ai.text')}
        </ExpandableSection>

        <ExpandableSection title={t('q.p.welcome.tac.title')}>
          {t('q.p.welcome.tac.text1')}
          <a href="/termsandconditions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t('q.p.welcome.tac.link')}
          </a>
          {t('q.p.welcome.tac.text2')}
        </ExpandableSection>
      </div>

      {/* The required Checkbox for Patients */}
      <div className="flex items-start gap-4 mb-8 p-4 bg-tertiary/10 rounded-md border border-tertiary/20 text-left">
        <input
          type="checkbox"
          id="patient-consent"
          checked={hasConsented}
          onChange={(e) => setHasConsented(e.target.checked)}
          className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer flex-shrink-0"
        />
        <label htmlFor="patient-consent" className="text-sm text-foreground cursor-pointer mt-0.5">
          {t('q.p.welcome.checkbox')}
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
          {t('q.p.welcome.saving', 'Einwilligung wird gespeichert...')}
        </p>
      )}
    </div>
  );
};

export default Step1_PWelcome;