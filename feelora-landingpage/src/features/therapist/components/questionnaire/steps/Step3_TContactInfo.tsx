import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [countryQuery, setCountryQuery] = useState(() => {
    if (!data.country) return '';
    return Country.getCountryByCode(data.country)?.name || '';
  });
  const [isCountryFocused, setIsCountryFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);

  const availableCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    const allCountries = Country.getAllCountries();
    return allCountries
      .filter((country) => country.name.toLowerCase().startsWith(query))
      .slice(0, 20);
  }, [countryQuery]);

  // Lazily load and filter cities only when the user has typed enough characters.
  const availableCities = useMemo(() => {
    if (!data.country) return [];

    const query = (data.city || '').trim().toLowerCase();
    if (query.length < 2) return [];

    const allCities = City.getCitiesOfCountry(data.country) || [];
    const uniqueCities: string[] = [];
    const seenNames = new Set<string>();

    for (const city of allCities) {
      const name = city.name?.trim();
      if (!name || seenNames.has(name)) continue;

      seenNames.add(name);
      if (name.toLowerCase().startsWith(query)) {
        uniqueCities.push(name);
      }

      // Keep rendering cheap even for very large countries.
      if (uniqueCities.length >= 50) break;
    }

    return uniqueCities;
  }, [data.country, data.city]);

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
    clearError('city');
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
                  <div className="relative">
                    <Input
                      id={field}
                      type="text"
                      value={countryQuery}
                      placeholder={t('q.common.pleaseSelect', 'Bitte auswählen')}
                      onChange={(e) => {
                        const nextQuery = e.target.value;
                        setCountryQuery(nextQuery);

                        // User is typing a new country, so clear selected country and city.
                        clearError('country');
                        clearError('city');
                        onDataChange({ ...data, country: '', city: '' });
                      }}
                      onFocus={() => setIsCountryFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsCountryFocused(false), 100);
                      }}
                      className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />

                    {isCountryFocused && countryQuery.trim().length >= 2 && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-auto">
                        {availableCountries.length > 0 ? (
                          availableCountries.map((country) => (
                            <button
                              key={country.isoCode}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setCountryQuery(country.name);
                                handleCountryChange(country.isoCode);
                                setIsCountryFocused(false);
                              }}
                            >
                              {country.flag} {country.name}
                            </button>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Keine Länder gefunden
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : field === 'city' ? (
                  <div className="relative">
                    <Input
                      id={field}
                      type="text"
                      value={data[field] || ''}
                      disabled={!data.country}
                      placeholder={
                        data.country
                          ? t('q.common.pleaseSelect', 'Bitte auswählen')
                          : t('q.t.contact.selectCountryFirst', 'Zuerst Land wählen')
                      }
                      onChange={(e) => handleChange(field, e.target.value)}
                      onFocus={() => setIsCityFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsCityFocused(false), 100);
                      }}
                      className={`bg-background disabled:opacity-50 ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />

                    {isCityFocused && data.country && (data.city || '').trim().length >= 2 && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-auto">
                        {availableCities.length > 0 ? (
                          availableCities.map((cityName) => (
                            <button
                              key={cityName}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleChange(field, cityName);
                                setIsCityFocused(false);
                              }}
                            >
                              {cityName}
                            </button>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Keine Städte gefunden
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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