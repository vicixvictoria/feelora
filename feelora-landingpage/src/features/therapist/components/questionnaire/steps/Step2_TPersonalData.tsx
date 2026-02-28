import { Input } from '@/components/ui/questionnaire/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface PersonalDataStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Define which fields are optional
const optionalFields = ['title'];

// Define the Validation Schema
const step2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  bday: z.string().min(1, 'Required'),
  gender: z.string().min(1, 'Required'),
  job: z.string().min(1, 'Required'),
  // Title is explicitly optional (no .min(1) required)
  title: z.string().optional(),
});

const Step2_PersonalData = ({ onNext, onBack, data, onDataChange }: PersonalDataStepProps) => {
  const { t } = useTranslation();

  const genderOptions = [
    { value: 'male', label: t('q.t.personal.male') },
    { value: 'female', label: t('q.t.personal.female') },
    { value: 'diverse', label: t('q.t.personal.diverse') },
  ];

  const fieldLabels: Record<string, string> = {
    firstName: t('q.t.personal.firstName'),
    lastName: t('q.t.personal.lastName'),
    bday: t('q.t.personal.birthday'),
    gender: t('q.t.personal.gender'),
    job: t('q.t.personal.job'),
    title: t('q.t.personal.titleField'),
  };

  //  Initialize the validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step2Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    clearError(field); // Clear the error when typing/selecting
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.personal.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.personal.subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {t('q.t.personal.cardTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => {
            const isOptional = optionalFields.includes(field);

            return (
              <div key={field} className="space-y-2">
                {/* Dynamic Label with Error Styling and Optional tag */}
                <Label
                  htmlFor={field}
                  className={errors[field] ? 'text-destructive' : 'text-foreground'}
                >
                  {fieldLabels[field]} {!isOptional && errors[field] && '*'}
                  {isOptional && (
                    <span className="text-muted-foreground font-normal text-xs ml-1">
                      ({t('q.common.optional')})
                    </span>
                  )}
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
                    type={field === 'bday' ? 'date' : 'text'}
                    value={data[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={field === 'title' ? t('q.t.personal.titlePlaceholder') : ''}
                    className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                )}

                {/* Error message for mandatory fields */}
                {errors[field] && !isOptional && (
                  <p className="text-xs text-destructive font-medium">{t('q.common.required')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step2_PersonalData;
