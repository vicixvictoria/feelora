import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
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
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { Country, City } from 'country-state-city';

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

  // Load all countries once
  const countries = useMemo(() => Country.getAllCountries(), []);

  // Dynamically load cities based on the currently selected country ISO code
  const availableCities = useMemo(() => {
    if (!data.country) return [];
    
    const allCities = City.getCitiesOfCountry(data.country) || [];
    
    // Filter out duplicate city names using a Set
    const uniqueCities = [];
    const seenNames = new Set();

    for (const city of allCities) {
      if (!seenNames.has(city.name)) {
        seenNames.add(city.name);
        uniqueCities.push(city);
      }
    }

    return uniqueCities;
  }, [data.country]);

  // Order matters for the layout
  const fieldLabels: Record<string, string> = {
    phone: t('q.t.contact.phone'),
    email: t('q.t.contact.email'),
    country: t('q.t.contact.country'), // Moved up so it sits before City
    city: t('q.t.contact.city'),
    address: t('q.t.contact.address'),
    postalCode: t('q.t.contact.postalCode'),
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

  const handleCountryChange = (isoCode: string) => {
    clearError('country');
    // If the country changes, wipe the previously selected 
    onDataChange({ ...data, country: isoCode, city: '' });
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
                  {fieldLabels[field]} {!isOptional && errors[field] && '*'}
                  {isOptional && (
                    <span className="text-muted-foreground font-normal text-xs ml-1">
                      ({t('q.common.optional')})
                    </span>
                  )}
                </Label>

                {/* Conditional Rendering for Country and City Dropdowns */}
                {field === 'country' ? (
                  <Select
                    value={data[field] || ''}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger
                      className={`bg-background ${errors[field] ? 'border-destructive ring-destructive' : ''}`}
                    >
                      <SelectValue placeholder={t('q.common.pleaseSelect', 'Bitte auswählen')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-64">
                      {countries.map((country) => (
                        <SelectItem key={country.isoCode} value={country.isoCode}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field === 'city' ? (
                  <Select
                    value={data[field] || ''}
                    onValueChange={(val) => handleChange(field, val)}
                    disabled={!data.country} // Disabled until a country is selected
                  >
                    <SelectTrigger
                      className={`bg-background disabled:opacity-50 ${errors[field] ? 'border-destructive ring-destructive' : ''}`}
                    >
                      <SelectValue
                        placeholder={
                          data.country
                            ? t('q.common.pleaseSelect', 'Bitte auswählen')
                            : t('q.t.contact.selectCountryFirst', 'Zuerst Land wählen')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-64">
                      {availableCities.length > 0 ? (
                        availableCities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Keine Städte gefunden
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field}
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    value={data[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                )}

                {/* Error messages */}
                {errors[field] && field === 'email' && (
                  <p className="text-[0.8rem] text-destructive">{t('q.common.invalidEmail')}</p>
                )}
                {errors[field] && !isOptional && field !== 'email' && (
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