import { useMemo } from 'react'; // <-- 1. Import useMemo
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface SpecialtiesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string };
  onDataChange: (data: { selected: string[]; other?: string }) => void;
}

// 2. Define the stable internal value for the "Other" option
const OTHER_VALUE = 'Andere';

const Step4_PMentalHealth = ({ onNext, onBack, data, onDataChange }: SpecialtiesStepProps) => {
  const { t } = useTranslation();

  // 3. Move the schema inside the component and wrap it in useMemo
  const step4Schema = useMemo(() => {
    return z
      .object({
        selected: z.array(z.string()).min(1, t('q.common.selectAtLeastOne', 'Bitte wähle mindestens eine Option')),
        other: z.string().optional(),
      })
      .refine(
        (valData) => {
          // Logic: If "Andere" is in the array, 'other' string cannot be empty
          if (valData.selected.includes(OTHER_VALUE)) {
            return valData.other && valData.other.trim().length > 0;
          }
          return true;
        },
        {
          message: t('q.common.specifyDetails', 'Bitte spezifizieren'), // Translated Zod error
          path: ['other'], 
        },
      );
  }, [t]); // Dependency array ensures it updates if language changes

  const specialtyOptions = [
    { value: 'Depression', label: t('q.options.depression') },
    { value: 'Angst', label: t('q.options.anxiety') },
    { value: 'Stress', label: t('q.options.stress') },
    { value: 'Psychosomatik', label: t('q.options.psychosomatics') },
    { value: 'Trauma', label: t('q.options.trauma') },
    { value: 'Sucht', label: t('q.options.addiction') },
    { value: 'Sexuelle Identität', label: t('q.options.sexualIdentity') },
    { value: 'Zwang', label: t('q.options.compulsion') },
    { value: 'Gewalterfahrungen', label: t('q.options.violence') },
    { value: 'Chronische Schmerzen', label: t('q.options.chronicPain') },
    { value: 'Essverhalten', label: t('q.options.eatingBehavior') },
  ];

  // Initialize Validation Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step4Schema,
    onNext,
  });

  const handleToggle = (specialty: string) => {
    clearError('selected');

    let newSelected: string[];
    if (data.selected.includes(specialty)) {
      newSelected = data.selected.filter((s) => s !== specialty);
    } else {
      newSelected = [...data.selected, specialty];
    }

    onDataChange({ ...data, selected: newSelected });
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other'); 

    if (data.selected.includes(OTHER_VALUE)) {
      // Uncheck "Andere" -> remove it and clear text
      onDataChange({
        ...data,
        selected: data.selected.filter((s) => s !== OTHER_VALUE),
        other: '',
      });
    } else {
      // Check "Andere"
      onDataChange({ ...data, selected: [...data.selected, OTHER_VALUE] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.mentalHealth.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.mentalHealth.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.common.selectAtLeastOne') : t('q.common.multiSelect')}
        </p>
      </div>

      <div className="feelora-card">
        <div
          className={`grid grid-cols-2 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {specialtyOptions.map((specialty) => (
            <label
              key={specialty.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(specialty.value)}
                onCheckedChange={() => handleToggle(specialty.value)}
              />
              <span className="text-foreground">{specialty.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="col-span-2 space-y-3">
            <label
              htmlFor="mental-health-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="mental-health-other"
                checked={data.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
              />
              {/* 4. Display the translated string for "Other" */}
              <span className="text-foreground">{t('q.common.other', 'Andere')}</span>
            </label>

            {data.selected.includes(OTHER_VALUE) && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder={t('q.p.mental.specifyPlaceholder')}
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {/* 5. Render the translated Zod error directly */}
                {errors.other && (
                 <span className="text-xs text-destructive ml-1">
                  {t('q.common.pleaseSpecify', 'Bitte gib Details an')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step4_PMentalHealth;