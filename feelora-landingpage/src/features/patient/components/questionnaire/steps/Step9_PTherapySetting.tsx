import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface TherapySettingStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// English key for backend instead of German string
const NO_PREFERENCE = 'no_preference';

// Define validation schema expecting an object with a "selection" array
const step9Schema = z.object({
  selection: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Option aus'),
});

const Step9_PTherapySetting = ({ onNext, onBack, data, onDataChange }: TherapySettingStepProps) => {
  const { t } = useTranslation();
  
  // Use id/label pairs to separate the backend key from the UI text
  const settingOptions = useMemo(() => [
    { id: 'in_person', label: t('q.p.therapySetting.options.onSite', 'Vor Ort') },
    { id: 'online', label: t('q.p.therapySetting.options.online', 'Online (Video)') },
    { id: 'phone', label: t('q.p.therapySetting.options.phone', 'Telefonisch') },
  ], [t]);

  // Initialize hook, wrapping the array `data` inside an object key called "selection"
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: data },
    schema: step9Schema,
    onNext,
  });

  const hasNoPreference = data.includes(NO_PREFERENCE);

  const handleToggle = (settingId: string) => {
    clearError('selection');

    // If they click a specific setting, ensure "no preference" is removed
    let currentSelection = data.filter((s) => s !== NO_PREFERENCE);

    if (currentSelection.includes(settingId)) {
      currentSelection = currentSelection.filter((s) => s !== settingId);
    } else {
      currentSelection = [...currentSelection, settingId];
    }
    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError('selection');

    if (hasNoPreference) {
      // Uncheck it -> empty array
      onDataChange([]);
    } else {
      // Check it -> wipe out everything else
      onDataChange([NO_PREFERENCE]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.therapySetting.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.therapySetting.subtitle')}</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? t('q.p.therapySetting.error') : t('q.p.therapySetting.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Add visual error state to the grid container */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {settingOptions.map((setting) => (
            <label
              key={setting.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.includes(setting.id)}
                onCheckedChange={() => handleToggle(setting.id)}
              />
              <span className="text-foreground">{setting.label}</span>
            </label>
          ))}

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive "No Preference" option */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <Checkbox checked={hasNoPreference} onCheckedChange={handleNoPreferenceToggle} />
            <span className="text-foreground font-medium">
              {t('q.p.therapySetting.noPreference', 'Keine Präferenz')}
            </span>
          </label>
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step9_PTherapySetting;