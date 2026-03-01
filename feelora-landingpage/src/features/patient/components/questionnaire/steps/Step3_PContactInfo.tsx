import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface ContactInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Validation Schema
const step3Schema = z.object({
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),

  // Phone, adress and postalcode is completely optional
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  // Email is optional, BUT if filled, must be valid
  // z.literal("") allows an empty string to pass validation
  email: z.union([z.literal(''), z.string().email('Invalid email')]).optional(),
});

const Step3_PContactInfo = ({ onNext, onBack, data, onDataChange }: ContactInfoStepProps) => {
  const { t } = useTranslation();

  const fieldLabels: Record<string, string> = {
    phone: t('q.p.contact.phone'),
    email: t('q.p.contact.email'),
    city: t('q.p.contact.city'),
    address: t('q.p.contact.address'),
    postalCode: t('q.p.contact.postalCode'),
    country: t('q.p.contact.country'),
  };
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step3Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    clearError(field);
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.contact.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.contact.subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">{t('q.p.contact.cardTitle')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => (
            <div key={field} className="space-y-2">
              <Label
                htmlFor={field}
                className={errors[field] ? 'text-destructive' : 'text-foreground'}
              >
                {/* Add asterisk only for non-optional fields */}
                {fieldLabels[field]}{' '}
                {field !== 'phone' &&
                  field !== 'email' &&
                  field !== 'address' &&
                  field !== 'postalCode' &&
                  errors[field] &&
                  '*'}
              </Label>
              <Input
                id={field}
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                value={data[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {/* Only show error message for invalid Email format */}
              {errors[field] && field === 'email' && (
                <p className="text-[0.8rem] text-destructive">{t('q.common.invalidEmail')}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step3_PContactInfo;
