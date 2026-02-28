import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface TherapySchoolStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string };
  onDataChange: (data: { selected: string[]; other?: string }) => void;
}

// List of therapy school options - add more if needed
const getTherapySchoolOptions = (t: (key: string) => string) => [
  t('q.p.therapySchool.options.humanistic'),
  t('q.p.therapySchool.options.behavioral'),
  t('q.p.therapySchool.options.psychodynamic'),
  t('q.p.therapySchool.options.systemic'),
];

const IDK_OPTION = 'Ich weiß es nicht';

// Define Validation Schema with Conditional Logic
const step8Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Option'),
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
      message: 'Bitte spezifizieren',
      path: ['other'],
    },
  );

// Step Component
const Step8_PTherapySchool = ({ onNext, onBack, data, onDataChange }: TherapySchoolStepProps) => {
  const { t } = useTranslation();
  const therapySchoolOptions = getTherapySchoolOptions(t);
  // 2. Initialize Validation Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step8Schema,
    onNext,
  });

  const isIdkSelected = data.selected.includes(IDK_OPTION);

  const handleToggle = (school: string) => {
    clearError('selected'); // Clear main error when user interacts

    // If user clicks a specific school, make sure "Ich weiß es nicht" is removed
    let currentSelection = data.selected.filter((s) => s !== IDK_OPTION);

    if (currentSelection.includes(school)) {
      currentSelection = currentSelection.filter((s) => s !== school);
    } else {
      currentSelection = [...currentSelection, school];
    }

    onDataChange({ ...data, selected: currentSelection });
  };

  // Handle toggle for "Other" option
  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other'); // Clear specific error

    if (data.selected.includes('Andere')) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== 'Andere'), other: '' });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Andere'] });
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
        <p className="text-muted-foreground mb-2">
          {t('q.p.therapySchool.subtitle')}
        </p>
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
          {therapySchoolOptions.map((school) => (
            <label
              key={school}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                isIdkSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.selected.includes(school)}
                onCheckedChange={() => handleToggle(school)}
              />
              <span className="text-foreground">{school}</span>
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
                checked={data.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">{t('q.p.therapySchool.other')}</span>
            </label>

            {data.selected.includes('Andere') && !isIdkSelected && (
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
                  <span className="text-xs text-destructive mt-1 ml-1">{t('q.p.therapySchool.detailsError')}</span>
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
