import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface TherapySchoolStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

//  Define validation schema with conditional validation for the "Andere" option
const step8Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Please select at least one'),
    other: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.selected.includes('Andere')) {
        return data.other && data.other.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Please specify',
      path: ['other'],
    },
  );

// Step Component
const Step8_TTherapySchool = ({ onNext, onBack, data, onDataChange }: TherapySchoolStepProps) => {
  const { t } = useTranslation();

  const therapySchoolOptions = [
    { value: 'Humanistische Orientierung', label: t('q.options.humanistic') },
    { value: 'Verhaltenstherapeutische Orientierung', label: t('q.options.behavioral') },
    { value: 'Psychoanalytisch-Psychodynamische Orientierung', label: t('q.options.psychoanalytic') },
    { value: 'Systemische Orientierung', label: t('q.options.systemic') },
  ];

  // Initialize the validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step8Schema,
    onNext,
  });

  const handleToggle = (value: string) => {
    clearError('selected');
    if (data.selected.includes(value)) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== value) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, value] });
    }
  };

  // Handle toggle for "Other" option
  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other');

    if (data.selected.includes('Andere')) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== 'Andere'), other: '' });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Andere'] });
    }
  };

  // Render Component
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.therapySchool.title')}</h1>
        <p className="text-muted-foreground mb-2">
          {t('q.t.therapySchool.subtitle')}
        </p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.t.therapySchool.selectError') : t('q.common.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error feedback wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {therapySchoolOptions.map((school) => (
            <label
              key={school.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(school.value)}
                onCheckedChange={() => handleToggle(school.value)}
              />
              <span className="text-foreground">{school.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="t-therapy-school-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="t-therapy-school-other"
                checked={data.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">{t('q.common.other')}</span>
            </label>

            {/* Conditional Input with validation styling */}
            {data.selected.includes('Andere') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder={t('q.common.otherPlaceholder')}
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">{t('q.common.otherPlaceholder')}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step8_TTherapySchool;
