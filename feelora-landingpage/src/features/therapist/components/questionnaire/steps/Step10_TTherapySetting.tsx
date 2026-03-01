import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface TherapySettingStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Define validation schema expecting an object with a "selection" array
const step10Schema = z.object({
  selection: z.array(z.string()).min(1, 'Please select at least one option'),
});

// Step Component
const Step10_TTherapySetting = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: TherapySettingStepProps) => {
  const { t } = useTranslation();

  const NO_PREFERENCE = t('q.common.noPreference');

  const settingOptions = [
    { value: 'Vor Ort', label: t('q.options.onsite') },
    { value: 'Online (Video Call)', label: t('q.options.online') },
    { value: 'Telefon / Anruf', label: t('q.options.phone') },
  ];

  const safeData = data || [];

  // Initialize hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step10Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes('keine Präferenz');

  const handleToggle = (value: string) => {
    clearError('selection');

    // Remove "keine Präferenz" if a specific setting is clicked
    let currentSelection = safeData.filter((s) => s !== 'keine Präferenz');

    if (currentSelection.includes(value)) {
      currentSelection = currentSelection.filter((s) => s !== value);
    } else {
      currentSelection = [...currentSelection, value];
    }

    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError('selection');

    if (hasNoPreference) {
      onDataChange([]);
    } else {
      onDataChange(['keine Präferenz']);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.therapySetting.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.therapySetting.subtitle')}</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? t('q.t.therapySetting.selectError') : t('q.common.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {settingOptions.map((setting) => (
            <label
              key={setting.value}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={safeData.includes(setting.value)}
                onCheckedChange={() => handleToggle(setting.value)}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{setting.label}</span>
            </label>
          ))}

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <Checkbox checked={hasNoPreference} onCheckedChange={handleNoPreferenceToggle} />
            <span className="text-foreground font-medium">{NO_PREFERENCE}</span>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step10_TTherapySetting;
