import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface PreviousTherapyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string; neverHadTherapy: boolean };
  onDataChange: (data: { selected: string[]; other?: string; neverHadTherapy: boolean }) => void;
}

const getTherapyOptions = (t: (key: string) => string) => [
  t('q.p.previousTherapy.options.cbt'),
  t('q.p.previousTherapy.options.psychoanalysis'),
  t('q.p.previousTherapy.options.personCentered'),
  t('q.p.previousTherapy.options.gestalt'),
  t('q.p.previousTherapy.options.traumaInformed'),
];

// Define validation schema with  conditional logic
const step6Schema = z
  .object({
    selected: z.array(z.string()),
    other: z.string().optional(),
    neverHadTherapy: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // Rule 1: If they haven't checked "Never had therapy", they MUST select at least one therapy.
    if (!data.neverHadTherapy && data.selected.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bitte wähle mindestens eine Option aus',
        path: ['selected'], // Triggers errors.selected
      });
    }

    // Rule 2: If "Andere" is checked, the text area must be filled.
    if (!data.neverHadTherapy && data.selected.includes('Andere')) {
      if (!data.other || data.other.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bitte spezifizieren',
          path: ['other'], // Triggers errors.other
        });
      }
    }
  });

const Step6_PPreviousTherapy = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: PreviousTherapyStepProps) => {
  const { t } = useTranslation();
  const therapyOptions = getTherapyOptions(t);
  const safeData = data || { selected: [], other: '', neverHadTherapy: false };

  // 2. Initialize Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: safeData,
    schema: step6Schema,
    onNext,
  });

  const handleToggle = (option: string) => {
    if (safeData.neverHadTherapy) return;
    clearError('selected'); // Clear main error when user interacts

    if (safeData.selected.includes(option)) {
      onDataChange({ ...safeData, selected: safeData.selected.filter((s) => s !== option) });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, option] });
    }
  };

  const handleOtherToggle = () => {
    if (safeData.neverHadTherapy) return;
    clearError('selected');
    clearError('other');

    if (safeData.selected.includes('Andere')) {
      onDataChange({
        ...safeData,
        selected: safeData.selected.filter((s) => s !== 'Andere'),
        other: '',
      });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, 'Andere'] });
    }
  };

  const handleNeverTherapy = () => {
    clearError('selected');
    clearError('other');

    if (safeData.neverHadTherapy) {
      onDataChange({ ...safeData, neverHadTherapy: false });
    } else {
      onDataChange({ selected: [], other: '', neverHadTherapy: true });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.previousTherapy.title')}</h1>
        <p className="text-muted-foreground mb-2">
          {t('q.p.previousTherapy.subtitle')}
        </p>
        {/* 3. Show error message in header if nothing is selected */}
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground italic'}`}
        >
          {errors.selected
            ? t('q.p.previousTherapy.error')
            : t('q.p.previousTherapy.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div
        className={`feelora-card transition-colors ${errors.selected ? 'border-destructive/50 bg-destructive/5' : ''}`}
      >
        <div className="grid grid-cols-1 gap-3">
          {therapyOptions.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                safeData.neverHadTherapy ? 'opacity-50 pointer-events-none bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={safeData.selected.includes(option)}
                onCheckedChange={() => handleToggle(option)}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">{option}</span>
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
                checked={safeData.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">{t('q.p.previousTherapy.other')}</span>
            </label>

            {/* 4. Validate Textarea for "Andere" */}
            {safeData.selected.includes('Andere') && !safeData.neverHadTherapy && (
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
                  <p className="text-xs text-destructive mt-1 ml-1">{t('q.p.previousTherapy.detailsError')}</p>
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
            <span className="text-foreground font-medium">{t('q.p.previousTherapy.neverHadTherapy')}</span>
          </label>
        </div>
      </div>

      {/* 5. Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step6_PPreviousTherapy;
