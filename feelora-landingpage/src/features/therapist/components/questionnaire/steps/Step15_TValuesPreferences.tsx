import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';

interface ValuesPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

// 1. Extract constants for stable logic
const NONE_OPTION = 'none';
const OTHER_VALUE = 'Other';

const Step15_TValuesPreferences = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: ValuesPreferencesStepProps) => {
  const { t } = useTranslation();

  // 2. Define schema inside component with useMemo
  const step15Schema = useMemo(() => {
    return z
      .object({
        selected: z.array(z.string()).min(1, t('q.common.atleastOneError')),
        other: z.string().optional(),
      })
      .refine(
        (valData) => {
          // If "Other" is checked, the input cannot be empty
          if (valData.selected.includes(OTHER_VALUE)) {
            return valData.other && valData.other.trim().length > 0;
          }
          return true;
        },
        {
          message: t('q.common.specifyDetails'),
          path: ['other'],
        },
      );
  }, [t]);

  // 3. Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step15Schema,
    onNext,
  });

  const valueOptions = [
    { id: 'lgbtq', label: t('q.t.valuesPreferences.lgbtq') },
    { id: 'cultural', label: t('q.t.valuesPreferences.cultural') },
    { id: 'executives', label: t('q.t.valuesPreferences.executives') },
    { id: 'relationships', label: t('q.t.valuesPreferences.relationships') },
    { id: 'workplace', label: t('q.t.valuesPreferences.workplace') },
    { id: 'expats', label: t('q.t.valuesPreferences.expats') },
    { id: 'feminist', label: t('q.t.valuesPreferences.feminist') },
    { id: 'lifeChanges', label: t('q.t.valuesPreferences.lifeChanges') },
    { id: 'experience10', label: t('q.t.valuesPreferences.experience10') },
    { id: 'supervision', label: t('q.t.valuesPreferences.supervision') },
    { id: NONE_OPTION, label: t('q.t.valuesPreferences.none') },
  ];

  // 4. Split options for rendering and exclusivity logic
  const standardOptions = valueOptions.filter((opt) => opt.id !== NONE_OPTION);
  const noneOption = valueOptions.find((opt) => opt.id === NONE_OPTION);
  const hasNoneSelected = data.selected.includes(NONE_OPTION);

  const handleToggle = (id: string) => {
    clearError('selected');

    // Remove "none" if a specific value is clicked
    let currentSelection = data.selected.filter((v) => v !== NONE_OPTION);

    if (currentSelection.includes(id)) {
      currentSelection = currentSelection.filter((v) => v !== id);
    } else {
      currentSelection = [...currentSelection, id];
    }

    onDataChange({ ...data, selected: currentSelection });
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other');

    // Remove "none" if other is clicked
    let currentSelection = data.selected.filter((v) => v !== NONE_OPTION);

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

  const handleNoneToggle = () => {
    clearError('selected');
    clearError('other');

    if (hasNoneSelected) {
      // Uncheck it
      onDataChange({ ...data, selected: [] });
    } else {
      // Check it -> wipe out all other selections AND the 'other' text
      onDataChange({ ...data, selected: [NONE_OPTION], other: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.valuesPreferences.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.valuesPreferences.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected
            ? t('q.t.valuesPreferences.error', 'Bitte wähle mindestens eine Option aus')
            : t('q.t.valuesPreferences.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {standardOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoneSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={hasNoneSelected}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="t-values-other"
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoneSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                id="t-values-other"
                checked={data.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
                disabled={hasNoneSelected}
              />
              <span className="text-foreground">{t('q.t.valuesPreferences.other')}</span>
            </label>

            {/* Conditional Input */}
            {data.selected.includes(OTHER_VALUE) && !hasNoneSelected && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder={t('q.t.valuesPreferences.otherPlaceholder')}
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">
                    {t('q.common.specifyDetails', 'Bitte gib Details an')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: None / No further details */}
          {noneOption && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox checked={hasNoneSelected} onCheckedChange={handleNoneToggle} />
              <span className="text-foreground font-medium">{noneOption.label}</span>
            </label>
          )}
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step15_TValuesPreferences;
