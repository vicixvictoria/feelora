import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

// Props Interface
interface SessionFrequencyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Step Component
const Step13_TSessionFrequency = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: SessionFrequencyStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  const frequencyOptions = [
    {
      id: 'flexibel',
      label: t('q.t.sessionFrequency.flexible'),
      description: t('q.t.sessionFrequency.flexibleDesc'),
    },
    {
      id: 'woechentlich',
      label: t('q.t.sessionFrequency.weekly'),
      description: t('q.t.sessionFrequency.weeklyDesc'),
    },
    {
      id: 'zweiwoechentlich',
      label: t('q.t.sessionFrequency.biweekly'),
      description: t('q.t.sessionFrequency.biweeklyDesc'),
    },
    { id: 'keine-praeferenz', label: t('q.t.sessionFrequency.noPreference'), description: '' },
  ];

  const handleToggle = (id: string) => {
    if (safeData.includes(id)) {
      onDataChange(safeData.filter((item) => item !== id));
    } else {
      onDataChange([...safeData, id]);
    }
  };
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.sessionFrequency.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.sessionFrequency.subtitle')}</p>
        <p className="text-sm text-muted-foreground">{t('q.t.sessionFrequency.multiSelect')}</p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {frequencyOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={safeData.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                className="mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step13_TSessionFrequency;
