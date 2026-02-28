import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Step Component
const Step17_Availability = ({ onNext, onBack, data, onDataChange }: AvailabilityStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  const days = [
    { id: 'mo', label: t('q.t.availability.mon') },
    { id: 'di', label: t('q.t.availability.tue') },
    { id: 'mi', label: t('q.t.availability.wed') },
    { id: 'do', label: t('q.t.availability.thu') },
    { id: 'fr', label: t('q.t.availability.fri') },
    { id: 'sa', label: t('q.t.availability.sat') },
    { id: 'so', label: t('q.t.availability.sun') },
  ];

  const handleToggle = (dayId: string) => {
    if (safeData.includes(dayId)) {
      onDataChange(safeData.filter((d) => d !== dayId));
    } else {
      onDataChange([...safeData, dayId]);
    }
  };
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.availability.title')}</h1>
        <p className="text-muted-foreground mb-2">
          {t('q.t.availability.subtitle')}
        </p>
        <p className="text-sm text-muted-foreground">{t('q.t.availability.multiSelect')}</p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="flex flex-wrap justify-center gap-3">
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleToggle(day.id)}
              className={`w-16 h-16 rounded-xl text-lg font-medium transition-all duration-200 ${
                safeData.includes(day.id)
                  ? 'bg-accent/90 text-purple border-2 border-accent/90'
                  : 'bg-muted/90 text-muted-foreground border-2 border-transparent hover:bg-muted'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step17_Availability;
