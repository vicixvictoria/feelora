import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface LanguagesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string[] };
  onDataChange: (data: { selected: string[]; other: string[] }) => void;
}

const languageOptions = [
  'Deutsch',
  'Kroatisch',
  'Englisch',
  'Arabisch',
  'Türkisch',
  'Polnisch',
  'Serbisch',
  'Italienisch',
  'Ungarisch',
  'Farsi / Persisch',
  'Rumänisch',
  'Spanisch',
  'Französisch',
  'Ukrainisch',
  'Russisch',
];

const otherLanguages = [
  'Albanisch',
  'Portugiesisch',
  'Chinesisch', // Mandarin/Cantonese
  'Japanisch',
  'Koreanisch',
  'Niederländisch',
  'Schwedisch',
  'Dänisch',
  'Norwegisch',
  'Finnisch',
  'Griechisch',
  'Hebräisch',
  'Tschechisch', // Czech
  'Slowakisch', // Slovak
  'Bulgarisch', // Bulgarian
  'Slowenisch', // Slovenian
  'Hindi', // Significant global population
  'Bengalisch', // Bengali
  'Vietnamesisch', // Large community in DE/AT/Europe
  'Thailändisch', // Thai
  'Urdu', // Pakistan/India
  'Paschtu', // Pashto (Afghanistan)
  'Kurdisch', // Kurdish
  'Dari', // Afghanistan
  'Indonesisch', // Indonesian
];

// Define Validation Schema with Conditional Logic
const step7Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Please select at least one language'),
    other: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.selected.includes('Andere')) {
        return data.other && data.other.length > 0;
      }
      return true;
    },
    {
      message: 'Please select at least one other language',
      path: ['other'],
    },
  );

const Step7_TLanguages = ({ onNext, onBack, data, onDataChange }: LanguagesStepProps) => {
  const { t } = useTranslation();

  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step7Schema,
    onNext,
  });

  const handleToggle = (language: string) => {
    clearError('selected');
    if (data.selected.includes(language)) {
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== language) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, language] });
    }
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other');

    if (data.selected.includes('Andere')) {
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== 'Andere'), other: [] });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Andere'], other: data.other || [] });
    }
  };

  const handleOtherLanguageToggle = (language: string) => {
    clearError('other');
    const currentOther = data.other || [];

    if (currentOther.includes(language)) {
      onDataChange({ ...data, other: currentOther.filter((l) => l !== language) });
    } else {
      onDataChange({ ...data, other: [...currentOther, language] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.languages.title')}</h1>
        <p className="text-muted-foreground mb-2">
          {t('q.t.languages.subtitle')}
        </p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected
            ? t('q.t.languages.selectError')
            : t('q.common.multiSelect')}
        </p>
      </div>

      <div className="feelora-card">
        <div
          className={`grid grid-cols-2 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {languageOptions.map((language) => (
            <label
              key={language}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(language)}
                onCheckedChange={() => handleToggle(language)}
              />
              <span className="text-foreground">{language}</span>
            </label>
          ))}

          {/* "Andere" Option */}
          <div className="col-span-2 space-y-3">
            <label
              htmlFor="t-languages-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="t-languages-other"
                checked={data.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground font-medium">{t('q.common.otherLanguages')}</span>
            </label>

            {data.selected.includes('Andere') && (
              <div
                className={`animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-lg border bg-muted/20 ${errors.other ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`}
              >
                <p className="text-sm font-medium mb-3 text-foreground">
                  {t('q.common.selectMoreLanguages')}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {otherLanguages.map((lang) => (
                    <label
                      key={lang}
                      className="flex items-center gap-2 cursor-pointer hover:bg-background/50 p-1 rounded"
                    >
                      <Checkbox
                        checked={(data.other || []).includes(lang)}
                        onCheckedChange={() => handleOtherLanguageToggle(lang)}
                      />
                      <span className="text-sm text-foreground">{lang}</span>
                    </label>
                  ))}
                </div>

                {errors.other && (
                  <p className="text-xs text-destructive mt-3">
                    {t('q.t.languages.otherError')}
                  </p>
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

export default Step7_TLanguages;
