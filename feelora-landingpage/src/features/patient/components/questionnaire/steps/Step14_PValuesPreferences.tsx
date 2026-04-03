import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface ValuesPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string };
  onDataChange: (data: { selected: string[]; other?: string }) => void;
}

// 1. Extract stable internal values
const NO_PREFERENCE = 'keine Präferenz';
const OTHER_VALUE = 'Andere';

const Step14_PValuesPreferences = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: ValuesPreferencesStepProps) => {
  const { t } = useTranslation();

  // 2. Define validation schema INSIDE component with useMemo
  const step14Schema = useMemo(() => {
    return z
      .object({
        selected: z.array(z.string()).min(1, t('q.p.valuesPreferences.error', 'Bitte wähle mindestens eine Option aus')),
        other: z.string().optional(),
      })
      .refine(
        (valData) => {
          // If "Andere" is checked, the input cannot be empty
          if (valData.selected.includes(OTHER_VALUE)) {
            return valData.other && valData.other.trim().length > 0;
          }
          return true;
        },
        {
          message: t('q.common.other', 'Bitte spezifizieren'),
          path: ['other'],
        },
      );
  }, [t]);

  // 3. Map stable IDs to translated labels
  const valueOptions = [
    { id: 'LGBTQ+ freundlich / affirmativ', label: t('q.p.values.lgbtq', 'LGBTQ+ freundlich / affirmativ') },
    { id: 'Kulturell sensibel', label: t('q.p.values.cultural', 'Kulturell sensibel') },
    { id: 'Erfahrung mit leistungsorientierten Personen / Führungskräften', label: t('q.p.values.performance', 'Erfahrung mit leistungsorientierten Personen / Führungskräften') },
    { id: 'Expertise in Beziehungs- oder Familienthemen', label: t('q.p.values.relationships', 'Expertise in Beziehungs- oder Familienthemen') },
    { id: 'Expertise bei Konflikten am Arbeitsplatz oder Mobbing', label: t('q.p.values.workplace', 'Expertise bei Konflikten am Arbeitsplatz oder Mobbing') },
    { id: 'Erfahrung mit Expatriates oder internationalen Klient:innen', label: t('q.p.values.expats', 'Erfahrung mit Expatriates oder internationalen Klient:innen') },
    { id: 'Geschlechtersensibler oder feministischer Ansatz', label: t('q.p.values.feminist', 'Geschlechtersensibler oder feministischer Ansatz') },
    { id: 'Erfahrung mit Lebensübergängen (Karriere, Umzug usw.)', label: t('q.p.values.lifeChanges', 'Erfahrung mit Lebensübergängen (Karriere, Umzug usw.)') },
    { id: 'Jemand Älteres mit mehr Erfahrung', label: t('q.p.values.older', 'Jemand Älteres mit mehr Erfahrung') },
    { id: 'Jemand Jüngeres', label: t('q.p.values.younger', 'Jemand Jüngeres') },
    { id: 'Ich bin offen für eine/n Therapeut:in in Supervision', label: t('q.p.values.supervision', 'Ich bin offen für eine/n Therapeut:in in Supervision') },
  ];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step14Schema,
    onNext,
  });

  const hasNoPreference = data.selected.includes(NO_PREFERENCE);

  const handleToggle = (optionId: string) => {
    clearError('selected');

    // Remove "keine Präferenz" if a specific value is clicked
    let currentSelection = data.selected.filter((v) => v !== NO_PREFERENCE);

    if (currentSelection.includes(optionId)) {
      currentSelection = currentSelection.filter((v) => v !== optionId);
    } else {
      currentSelection = [...currentSelection, optionId];
    }

    onDataChange({ ...data, selected: currentSelection });
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other');

    let currentSelection = data.selected.filter((v) => v !== NO_PREFERENCE);

    if (currentSelection.includes(OTHER_VALUE)) {
      onDataChange({
        ...data,
        selected: currentSelection.filter((v) => v !== OTHER_VALUE),
        other: '',
      });
    } else {
      onDataChange({ ...data, selected: [...currentSelection, OTHER_VALUE] });
    }
  };

  const handleNoPreferenceToggle = () => {
    clearError('selected');
    clearError('other');

    if (hasNoPreference) {
      // Uncheck it
      onDataChange({ ...data, selected: [] });
    } else {
      // Check it -> wipe out all other selections AND the 'other' text
      onDataChange({ ...data, selected: [NO_PREFERENCE], other: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.valuesPreferences.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.valuesPreferences.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.p.valuesPreferences.error') : t('q.p.valuesPreferences.hint')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {valueOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="p-values-other"
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                id="p-values-other"
                checked={data.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{t('q.p.valuesPreferences.other', 'Andere')}</span>
            </label>

            {/* Conditional Input */}
            {data.selected.includes(OTHER_VALUE) && !hasNoPreference && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder={t('q.p.valuesPreferences.otherPlaceholder')}
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">
                    {t('q.p.valuesPreferences.otherError', 'Bitte gib Details an')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <Checkbox checked={hasNoPreference} onCheckedChange={handleNoPreferenceToggle} />
            <span className="text-foreground font-medium">
              {t('q.common.noPreference', 'keine Präferenz')}
            </span>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step14_PValuesPreferences;