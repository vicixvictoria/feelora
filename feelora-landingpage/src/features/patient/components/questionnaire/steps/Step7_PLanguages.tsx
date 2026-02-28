import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';
import { useTranslation } from 'react-i18next';

interface LanguagesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string[] };
  onDataChange: (data: { selected: string[]; other?: string[] }) => void;
}

const getLanguageOptions = (t: (key: string) => string) => [
  t('q.p.languages.options.german'),
  t('q.p.languages.options.croatian'),
  t('q.p.languages.options.english'),
  t('q.p.languages.options.arabic'),
  t('q.p.languages.options.turkish'),
  t('q.p.languages.options.polish'),
  t('q.p.languages.options.serbian'),
  t('q.p.languages.options.italian'),
  t('q.p.languages.options.hungarian'),
  t('q.p.languages.options.farsi'),
  t('q.p.languages.options.romanian'),
  t('q.p.languages.options.spanish'),
  t('q.p.languages.options.french'),
  t('q.p.languages.options.ukrainian'),
  t('q.p.languages.options.russian'),
];

const getOtherLanguages = (t: (key: string) => string) => [
  t('q.p.languages.other.albanian'),
  t('q.p.languages.other.portuguese'),
  t('q.p.languages.other.chinese'),
  t('q.p.languages.other.japanese'),
  t('q.p.languages.other.korean'),
  t('q.p.languages.other.dutch'),
  t('q.p.languages.other.swedish'),
  t('q.p.languages.other.danish'),
  t('q.p.languages.other.norwegian'),
  t('q.p.languages.other.finnish'),
  t('q.p.languages.other.greek'),
  t('q.p.languages.other.hebrew'),
  t('q.p.languages.other.czech'),
  t('q.p.languages.other.slovak'),
  t('q.p.languages.other.bulgarian'),
  t('q.p.languages.other.slovenian'),
  t('q.p.languages.other.hindi'),
  t('q.p.languages.other.bengali'),
  t('q.p.languages.other.vietnamese'),
  t('q.p.languages.other.thai'),
  t('q.p.languages.other.urdu'),
  t('q.p.languages.other.pashto'),
  t('q.p.languages.other.kurdish'),
  t('q.p.languages.other.dari'),
  t('q.p.languages.other.indonesian'),
];

// Define Validation Schema with Conditional Logic
const step7Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Sprache'),
    other: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Wenn "Andere" gewählt ist, MUSS das 'other' Array mindestens 1 Element haben
      if (data.selected.includes('Andere')) {
        return data.other && data.other.length > 0;
      }
      return true;
    },
    {
      message: 'Bitte wähle mindestens eine weitere Sprache aus',
      path: ['other'],
    },
  );

const Step7_PLanguages = ({ onNext, onBack, data, onDataChange }: LanguagesStepProps) => {
  const { t } = useTranslation();
  const languageOptions = getLanguageOptions(t);
  const otherLanguages = getOtherLanguages(t);
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
      // Wenn abgewählt, leeren wir auch das 'other' Array
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== 'Andere'), other: [] });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Andere'], other: data.other || [] });
    }
  };

  // Functionn to handle toggling of languages in the "other" category
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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.languages.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.languages.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.p.languages.error') : t('q.p.languages.multiSelect')}
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
              htmlFor="p-languages-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="p-languages-other"
                checked={data.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground font-medium">
                {t('q.p.languages.otherLanguages')}
              </span>
            </label>

            {/* 4. Scrollbare Checkbox-Liste für weitere Sprachen */}
            {data.selected.includes('Andere') && (
              <div
                className={`animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-lg border bg-muted/20 ${errors.other ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`}
              >
                <p className="text-sm font-medium mb-3 text-foreground">
                  {t('q.p.languages.selectMore')}
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
                  <p className="text-xs text-destructive mt-3">{t('q.p.languages.otherError')}</p>
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

export default Step7_PLanguages;
