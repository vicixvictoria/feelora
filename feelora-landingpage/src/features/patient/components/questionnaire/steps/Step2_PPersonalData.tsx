import { Input } from '@/components/ui/questionnaire/input';
import { Label } from '@/components/ui/label';
import { useStepValidation } from '@/hooks/use-step-validation';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface PersonalDataStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Define Rules specifically for THIS step
const step2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  bday: z.string().min(1, 'Required'),
  gender: z.string().min(1, 'Required'),
});

const Step2_PersonalData = ({ onNext, onBack, data, onDataChange }: PersonalDataStepProps) => {
  const { t } = useTranslation();

  const genderOptions = [
    { value: 'male', label: t('q.p.personal.male') },
    { value: 'female', label: t('q.p.personal.female') },
    { value: 'diverse', label: t('q.p.personal.diverse') },
  ];

  const fieldLabels: Record<string, string> = {
    firstName: t('q.p.personal.firstName'),
    lastName: t('q.p.personal.lastName'),
    bday: t('q.p.personal.birthday'),
    gender: t('q.p.personal.gender'),
  };

  // Use the hook (One line of logic!)
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step2Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    clearError(field); // Clears red border from error immediately
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.personal.title')}</h1>
        <p className="text-muted-foreground">{t('q.p.personal.subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {t('q.p.personal.cardTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => (
            <div key={field} className="space-y-2">
              <Label
                htmlFor={field}
                className={errors[field] ? 'text-destructive' : 'text-foreground'}
              >
                {fieldLabels[field]}
              </Label>
              {field === 'gender' ? (
                <Select
                  value={data[field] || ''}
                  onValueChange={(value) => handleChange(field, value)}
                >
                  <SelectTrigger
                    className={`bg-background ${errors[field] ? 'border-destructive ring-destructive' : ''}`}
                  >
                    <SelectValue placeholder={t('q.common.pleaseSelect')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field}
                  name={field}
                  type={field === 'bday' ? 'date' : 'text'}
                  value={data[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step2_PersonalData;
