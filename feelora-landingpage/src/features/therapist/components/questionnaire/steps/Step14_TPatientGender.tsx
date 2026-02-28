import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface PatientGenderStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Step Component
const Step14_TPatientGender = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: PatientGenderStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  const genderOptions = [
    { id: 'männlich', label: t('q.t.patientGender.male') },
    { id: 'weiblich', label: t('q.t.patientGender.female') },
    { id: 'non-binary / divers', label: t('q.t.patientGender.nonBinary') },
    { id: 'keine Präferenz', label: t('q.t.patientGender.noPreference') },
  ];

  const handleToggle = (gender: string) => {
    if (safeData.includes(gender)) {
      onDataChange(safeData.filter((item) => item !== gender));
    } else {
      onDataChange([...safeData, gender]);
    }
  };
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.patientGender.title')}</h1>
        <p className="text-muted-foreground">
          {t('q.t.patientGender.subtitle')}
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {genderOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={safeData.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step14_TPatientGender;
