import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface TherapySchoolStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string };
  onDataChange: (data: { selected: string[]; other?: string }) => void;
}

// 1. Define stable internal values for exclusive/conditional options
const OTHER_VALUE = 'Andere';
const IDK_OPTION = 'Ich weiß es nicht';

// Step Component
const Step8_PTherapySchool = ({ onNext, onBack, data, onDataChange }: TherapySchoolStepProps) => {
  const { t } = useTranslation();

  // 2. Define schema INSIDE the component using useMemo
  const step8Schema = useMemo(() => {
    return z
      .object({
        selected: z.array(z.string()).min(1, t('q.p.therapySchool.error', 'Bitte wähle mindestens eine Option')),
        other: z.string().optional(),
      })
      .refine(
        (valData) => {
          if (valData.selected.includes(OTHER_VALUE)) {
            return valData.other && valData.other.trim().length > 0;
          }
          return true;
        },
        {
          message: t('q.p.therapySchool.detailsError', 'Bitte spezifizieren'),
          path: ['other'],
        }
      );
  }, [t]);

  // 3. Define options with stable IDs for the backend, and translated labels for the UI
  const therapySchoolOptions = [
    { id: 'humanistic', label: t('q.p.therapySchool.options.humanistic') },
    { id: 'behavioral', label: t('q.p.therapySchool.options.behavioral') },
    { id: 'psychodynamic', label: t('q.p.therapySchool.options.psychodynamic') },
    { id: 'systemic', label: t('q.p.therapySchool.options.systemic') },
  ];

  // Initialize Validation Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step8Schema,
    onNext,
  });

  const isIdkSelected = data.selected.includes(IDK_OPTION);

  const handleToggle = (optionId: string) => {
    clearError('selected'); // Clear main error when user interacts

    // If user clicks a specific school, make sure "Ich weiß es nicht" is removed
    let currentSelection = data.selected.filter((s) => s !== IDK_OPTION);

    if (currentSelection.includes(optionId)) {
      currentSelection = currentSelection.filter((s) => s !== optionId);
    } else {
      currentSelection = [...currentSelection, optionId];
    }

    onDataChange({ ...data, selected: currentSelection });
  };

  // Handle toggle for "Other" option
  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other'); // Clear specific error

    let currentSelection = data.selected.filter((s) => s !== IDK_OPTION);

    if (currentSelection.includes(OTHER_VALUE)) {
      onDataChange({ ...data, selected: currentSelection.filter((s) => s !== OTHER_VALUE), other: '' });
    } else {
      onDataChange({ ...data, selected: [...currentSelection, OTHER_VALUE] });
    }
  };

  // Special handler for idk option
  const handleIdkToggle = () => {
    clearError('selected');
    clearError('other');

    if (isIdkSelected) {
      // Uncheck it
      onDataChange({ ...data, selected: [] });
    } else {
      // Check it, and wipe out everything else (including 'other' text)
      onDataChange({ ...data, selected: [IDK_OPTION], other: '' });
    }
  };

  // Render Component
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.therapySchool.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.therapySchool.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.p.therapySchool.error') : t('q.p.therapySchool.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Map through structured options */}
          {therapySchoolOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                isIdkSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={isIdkSelected}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="p-therapy-school-other"
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                isIdkSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                id="p-therapy-school-other"
                checked={data.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
                disabled={isIdkSelected}
              />
              <span className="text-foreground">{t('q.p.therapySchool.other', 'Andere')}</span>
            </label>

            {data.selected.includes(OTHER_VALUE) && !isIdkSelected && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder={t('q.p.therapySchool.specifyPlaceholder')}
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">
                    {t('q.p.therapySchool.detailsError', 'Bitte gib Details an')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* I don't know option */}
          <label
            htmlFor="p-therapy-school-idk"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="p-therapy-school-idk"
              checked={isIdkSelected}
              onCheckedChange={handleIdkToggle}
            />
            <span className="text-foreground font-medium">{t('q.p.therapySchool.idk')}</span>
          </label>
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step8_PTherapySchool;