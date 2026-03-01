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

// Define which fields are optional
const optionalFields = ['phone', 'email', 'address', 'postalCode'];

// Define the Validation Schema
const step3Schema = z.object({
  // Required fields
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),

  // Optional fields (strictly remove .min(1))
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),

  // Email: Empty string, undefined, OR valid email
  email: z.union([z.literal(''), z.string().email('Invalid email')]).optional(),
});

const Step3_TContactInfo = ({ onNext, onBack, data, onDataChange }: ContactInfoStepProps) => {
  const { t } = useTranslation();

  const fieldLabels: Record<string, string> = {
    phone: t('q.t.contact.phone'),
    email: t('q.t.contact.email'),
    city: t('q.t.contact.city'),
    address: t('q.t.contact.address'),
    postalCode: t('q.t.contact.postalCode'),
    country: t('q.t.contact.country'),
  };

  // Initialize the validation hook
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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.contact.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.contact.subtitle1')}</p>
        <p className="text-muted-foreground mb-2">{t('q.t.contact.subtitle2')}</p>
        <p className="text-muted-foreground mb-2">{t('q.t.contact.subtitle3')}</p>
        <p className="text-muted-foreground text-sm">{t('q.t.contact.subtitle4')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">{t('q.t.contact.cardTitle')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => {
            // Check if this specific field is optional
            const isOptional = optionalFields.includes(field);

            return (
              <div key={field} className="space-y-2">
                <Label
                  htmlFor={field}
                  className={errors[field] ? 'text-destructive' : 'text-foreground'}
                >
                  {/* Show asterisk if required and errored, show (optional) text if optional */}
                  {fieldLabels[field]} {!isOptional && errors[field] && '*'}
                  {isOptional && (
                    <span className="text-muted-foreground font-normal text-xs ml-1">
                      ({t('q.common.optional')})
                    </span>
                  )}
                </Label>

                <Input
                  id={field}
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  value={data[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />

                {/* Error messages */}
                {errors[field] && field === 'email' && (
                  <p className="text-[0.8rem] text-destructive">{t('q.common.invalidEmail')}</p>
                )}
                {errors[field] && !isOptional && (
                  <p className="text-[0.8rem] text-destructive">{t('q.common.required')}</p>
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

export default Step3_TContactInfo;
