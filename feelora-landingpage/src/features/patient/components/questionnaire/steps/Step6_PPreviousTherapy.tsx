import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface PreviousTherapyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string; neverHadTherapy: boolean };
  onDataChange: (data: { selected: string[]; other?: string; neverHadTherapy: boolean }) => void;
}

// 1. Define the stable internal value for the "Other" option
const OTHER_VALUE = 'Andere';

const Step6_PPreviousTherapy = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: PreviousTherapyStepProps) => {
  const { t } = useTranslation();
  const safeData = data || { selected: [], other: '', neverHadTherapy: false };

  // 2. Define schema inside the component using useMemo to access translations
  const step6Schema = useMemo(() => {
    return z
      .object({
        selected: z.array(z.string()),
        other: z.string().optional(),
        neverHadTherapy: z.boolean(),
      })
      .superRefine((valData, ctx) => {
        // Rule 1: If they haven't checked "Never had therapy", they MUST select at least one therapy.
        if (!valData.neverHadTherapy && valData.selected.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('q.p.previousTherapy.error', 'Bitte wähle mindestens eine Option aus'),
            path: ['selected'], // Triggers errors.selected
          });
        }

        // Rule 2: If "Andere" is checked, the text area must be filled.
        if (!valData.neverHadTherapy && valData.selected.includes(OTHER_VALUE)) {
          if (!valData.other || valData.other.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('q.p.previousTherapy.detailsError', 'Bitte spezifizieren'),
              path: ['other'], // Triggers errors.other
            });
          }
        }
      });
  }, [t]);

  // 3. Define options with stable IDs for the backend, but translated labels for the UI
  const therapyOptions = [
    { id: 'cbt', label: t('q.p.previousTherapy.options.cbt') },
    { id: 'psychoanalysis', label: t('q.p.previousTherapy.options.psychoanalysis') },
    { id: 'personCentered', label: t('q.p.previousTherapy.options.personCentered') },
    { id: 'gestalt', label: t('q.p.previousTherapy.options.gestalt') },
    { id: 'traumaInformed', label: t('q.p.previousTherapy.options.traumaInformed') },
  ];

  // Initialize Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: safeData,
    schema: step6Schema,
    onNext,
  });

  const handleToggle = (optionId: string) => {
    if (safeData.neverHadTherapy) return;
    clearError('selected'); // Clear main error when user interacts

    if (safeData.selected.includes(optionId)) {
      onDataChange({ ...safeData, selected: safeData.selected.filter((s) => s !== optionId) });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, optionId] });
    }
  };

  const handleOtherToggle = () => {
    if (safeData.neverHadTherapy) return;
    clearError('selected');
    clearError('other');

    if (safeData.selected.includes(OTHER_VALUE)) {
      onDataChange({
        ...safeData,
        selected: safeData.selected.filter((s) => s !== OTHER_VALUE),
        other: '',
      });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, OTHER_VALUE] });
    }
  };

  const handleNeverTherapy = () => {
    clearError('selected');
    clearError('other');

    if (safeData.neverHadTherapy) {
      onDataChange({ ...safeData, neverHadTherapy: false });
    } else {
      // Wipes out selected array and text if "Never had therapy" is checked
      onDataChange({ selected: [], other: '', neverHadTherapy: true });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.previousTherapy.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.previousTherapy.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground italic'}`}
        >
          {errors.selected ? t('q.p.previousTherapy.error') : t('q.p.previousTherapy.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div
        className={`feelora-card transition-colors ${errors.selected ? 'border-destructive/50 bg-destructive/5' : ''}`}
      >
        <div className="grid grid-cols-1 gap-3">
          
          {/* Map through the newly structured options */}
          {therapyOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                safeData.neverHadTherapy ? 'opacity-50 pointer-events-none bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={safeData.selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="previous-therapy-other"
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                safeData.neverHadTherapy ? 'opacity-50 pointer-events-none bg-muted/30' : ''
              }`}
            >
              <Checkbox
                id="previous-therapy-other"
                checked={safeData.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">{t('q.p.previousTherapy.other', 'Andere')}</span>
            </label>

            {/* Validate Textarea for "Andere" */}
            {safeData.selected.includes(OTHER_VALUE) && !safeData.neverHadTherapy && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Textarea
                  placeholder={t('q.p.previousTherapy.specifyPlaceholder')}
                  value={safeData.other}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...safeData, other: e.target.value });
                  }}
                  className={`bg-background resize-none ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <p className="text-xs text-destructive mt-1 ml-1">
                    {t('q.p.previousTherapy.detailsError', 'Bitte gib Details an')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* Never had therapy option */}
          <label
            htmlFor="never-had-therapy"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="never-had-therapy"
              checked={safeData.neverHadTherapy}
              onCheckedChange={handleNeverTherapy}
            />
            <span className="text-foreground font-medium">
              {t('q.p.previousTherapy.neverHadTherapy')}
            </span>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step6_PPreviousTherapy;