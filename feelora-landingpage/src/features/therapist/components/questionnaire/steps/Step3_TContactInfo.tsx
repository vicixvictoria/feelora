import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';

interface ContactInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

const fieldLabels: Record<string, string> = {
  phone: 'Handy/Mobil',
  email: 'E-Mail',
  city: 'Stadt',
  address: 'Adresse',
  postalCode: 'Postleitzahl',
  country: 'Land',
};

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
  email: z.union([z.literal(''), z.string().email('Ungültiges E-Mail-Format')]).optional(), // in case its undefined
});

const Step3_TContactInfo = ({ onNext, onBack, data, onDataChange }: ContactInfoStepProps) => {
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
        <h1 className="text-3xl font-bold text-purple mb-2">Kontaktinformationen</h1>
        <p className="text-muted-foreground mb-2">
          Gib deine Kontaktdaten an, damit deine Patient:Innen dich erreichen können. Wir können
          diese nicht validieren, bitte überprüfe die Eingabe genau. Bei keiner Angabe wird die
          Email von deinem Feelora Login verwendet.
        </p>
        <p className="text-muted-foreground mb-2">
          Füge auch die Adresse deiner Praxis hinzu wenn du eine hast. Andernfalls, gib bitte dein
          Land und deine Stadt an.
        </p>
        <p className="text-muted-foreground mb-2">
          Diese Informationen werden öffentlich in deinem Profil angezeigt.
        </p>
        <p className="text-muted-foreground text-sm">Du kannst diese Angaben jederzeit ändern.</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">Kontaktinformationen</h2>

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
                      (optional)
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
                  <p className="text-[0.8rem] text-destructive">Ungültiges E-Mail-Format</p>
                )}
                {errors[field] && !isOptional && (
                  <p className="text-[0.8rem] text-destructive">Pflichtfeld</p>
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
