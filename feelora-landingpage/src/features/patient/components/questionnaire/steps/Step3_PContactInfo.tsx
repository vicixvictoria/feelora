import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { City } from 'country-state-city';

// --- i18n-iso-countries Imports ---
import countries from 'i18n-iso-countries';
import deLocale from 'i18n-iso-countries/langs/de.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register both languages
countries.registerLocale(deLocale);
countries.registerLocale(enLocale);

interface ContactInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Define which fields are optional for cleaner rendering logic
const optionalFields = ['phone', 'email', 'address', 'postalCode'];

// Validation Schema
const step3Schema = z.object({
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Invalid email')]).optional(),
});

// --- Helper for Country Flags (ISO Code to Emoji) ---
const getFlagEmoji = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

// --- Mapping Dictionary for Major Cities (German) ---
const deCityTranslationMap: Record<string, string> = {
  "Vienna": "Wien",
  "Munich": "München",
  "Cologne": "Köln",
  "Nuremberg": "Nürnberg",
  "Prague": "Prag",
  "Rome": "Rom",
  "Milan": "Mailand",
  "Venice": "Venedig",
  "Florence": "Florenz",
  "Geneva": "Genf",
  "Zurich": "Zürich",
  "Lucerne": "Luzern",
  "Warsaw": "Warschau",
  "Brussels": "Brüssel",
  "Lisbon": "Lissabon",
  "Athens": "Athen",
  "Moscow": "Moskau",
};

// --- Dynamic Translation Function ---
const translateCity = (cityName: string, currentLang: string) => {
  if (currentLang === 'de') {
    return deCityTranslationMap[cityName] || cityName;
  }
  return cityName; 
};

const Step3_PContactInfo = ({ onNext, onBack, data, onDataChange }: ContactInfoStepProps) => {
  const { t, i18n } = useTranslation();
  
  // Determine the current language code ('de' or 'en'). Fallback is 'en'.
  const currentLang = i18n.language?.startsWith('de') ? 'de' : 'en';

  const [countryQuery, setCountryQuery] = useState(() => {
    if (!data.country) return '';
    return countries.getName(data.country, currentLang, { select: 'official' }) || '';
  });

  const [isCountryFocused, setIsCountryFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);

  // Update the search input if the user changes the language on-the-fly
  useEffect(() => {
    if (data.country) {
      setCountryQuery(countries.getName(data.country, currentLang, { select: 'official' }) || '');
    }
  }, [currentLang, data.country]);

  // --- Dynamically load countries based on active language ---
  const availableCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    const countryObj = countries.getNames(currentLang, { select: 'official' });
    
    const allLocalizedCountries = Object.entries(countryObj).map(([code, name]) => ({
      isoCode: code,
      name: name,
      flag: getFlagEmoji(code),
    }));

    return allLocalizedCountries
      .filter((country) => country.name.toLowerCase().startsWith(query))
      .slice(0, 20);
  }, [countryQuery, currentLang]);

  // --- Dynamically load and map cities based on active language ---
  const availableCities = useMemo(() => {
    if (!data.country) return [];

    const query = (data.city || '').trim().toLowerCase();
    if (query.length < 2) return [];

    const allCities = City.getCitiesOfCountry(data.country) || [];
    const uniqueCities: string[] = [];
    const seenNames = new Set<string>();

    for (const city of allCities) {
      const rawName = city.name?.trim();
      if (!rawName) continue;

      const translatedName = translateCity(rawName, currentLang);

      if (seenNames.has(translatedName)) continue;

      if (translatedName.toLowerCase().startsWith(query)) {
        seenNames.add(translatedName);
        uniqueCities.push(translatedName);
      }

      if (uniqueCities.length >= 50) break;
    }

    return uniqueCities;
  }, [data.country, data.city, currentLang]);

  // Country should visually appear before City
  const fieldLabels: Record<string, string> = {
    phone: t('q.p.contact.phone'),
    email: t('q.p.contact.email'),
    country: t('q.p.contact.country'),
    city: t('q.p.contact.city'),
    address: t('q.p.contact.address'),
    postalCode: t('q.p.contact.postalCode'),
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

  const handleCountryChange = (isoCode: string) => {
    clearError('country');
    clearError('city');
    onDataChange({ ...data, country: isoCode, city: '' });
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
          {Object.keys(fieldLabels).map((field) => {
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
                      ({t('q.common.optional', 'Optional')})
                    </span>
                  )}
                </Label>

                {/* Country Dropdown */}
                {field === 'country' ? (
                  <div className="relative">
                    <Input
                      id={field}
                      type="text"
                      value={countryQuery}
                      placeholder={t('q.common.searchPlaceholder', 'Suchen...')}
                      onChange={(e) => {
                        const nextQuery = e.target.value;
                        setCountryQuery(nextQuery);
                        clearError('country');
                        clearError('city');
                        onDataChange({ ...data, country: '', city: '' });
                      }}
                      onFocus={() => setIsCountryFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsCountryFocused(false), 150);
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
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setCountryQuery(country.name);
                                handleCountryChange(country.isoCode);
                                setIsCountryFocused(false);
                              }}
                            >
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            {t('q.common.noResults', 'Keine Ergebnisse gefunden')}
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
                          ? t('q.common.searchPlaceholder', 'Suchen...')
                          : t('q.p.contact.selectCountryFirst', 'Bitte zuerst Land wählen')
                      }
                      onChange={(e) => handleChange(field, e.target.value)}
                      onFocus={() => setIsCityFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsCityFocused(false), 150);
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
                            {t('q.common.noResults', 'Keine Ergebnisse gefunden')}
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

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step3_PContactInfo;