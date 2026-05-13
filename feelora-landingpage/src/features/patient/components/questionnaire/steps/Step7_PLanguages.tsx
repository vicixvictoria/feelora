import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface LanguagesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string[] };
  onDataChange: (data: { selected: string[]; other?: string[] }) => void;
}

/*interface LanguageOption {
  id: string;
  label: string;
}*/



// Define Validation Schema with Conditional Logic
const step7Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Sprache'),
    other: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Wenn "Andere" gewählt ist, MUSS das 'other' Array mindestens 1 Element haben
      if (data.selected.includes('other')) {
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

  const languageOptions = useMemo(
    () => [
      { id: 'german', label: t('q.p.languages.options.german', 'Deutsch') },
      { id: 'english', label: t('q.p.languages.options.english', 'Englisch') },
      { id: 'croatian', label: t('q.p.languages.options.croatian', 'Kroatisch') },
      { id: 'arabic', label: t('q.p.languages.options.arabic', 'Arabisch') },
      { id: 'turkish', label: t('q.p.languages.options.turkish', 'Türkisch') },
      { id: 'polish', label: t('q.p.languages.options.polish', 'Polnisch') },
      { id: 'serbian', label: t('q.p.languages.options.serbian', 'Serbisch') },
      { id: 'italian', label: t('q.p.languages.options.italian', 'Italienisch') },
      { id: 'hungarian', label: t('q.p.languages.options.hungarian', 'Ungarisch') },
      { id: 'farsi', label: t('q.p.languages.options.farsi', 'Farsi / Persisch') },
      { id: 'romanian', label: t('q.p.languages.options.romanian', 'Rumänisch') },
      { id: 'spanish', label: t('q.p.languages.options.spanish', 'Spanisch') },
      { id: 'french', label: t('q.p.languages.options.french', 'Französisch') },
      { id: 'ukrainian', label: t('q.p.languages.options.ukrainian', 'Ukrainisch') },
      { id: 'russian', label: t('q.p.languages.options.russian', 'Russisch') },
    ],
    [t],
  );

  const otherLanguages = useMemo(
    () => [
      { id: 'albanian', label: t('q.p.languages.other.albanian', 'Albanisch') },
      { id: 'portuguese', label: t('q.p.languages.other.portuguese', 'Portugiesisch') },
      { id: 'chinese', label: t('q.p.languages.other.chinese', 'Chinesisch') },
      { id: 'japanese', label: t('q.p.languages.other.japanese', 'Japanisch') },
      { id: 'korean', label: t('q.p.languages.other.korean', 'Koreanisch') },
      { id: 'dutch', label: t('q.p.languages.other.dutch', 'Niederländisch') },
      { id: 'swedish', label: t('q.p.languages.other.swedish', 'Schwedisch') },
      { id: 'danish', label: t('q.p.languages.other.danish', 'Dänisch') },
      { id: 'norwegian', label: t('q.p.languages.other.norwegian', 'Norwegisch') },
      { id: 'finnish', label: t('q.p.languages.other.finnish', 'Finnisch') },
      { id: 'greek', label: t('q.p.languages.other.greek', 'Griechisch') },
      { id: 'hebrew', label: t('q.p.languages.other.hebrew', 'Hebräisch') },
      { id: 'czech', label: t('q.p.languages.other.czech', 'Tschechisch') },
      { id: 'slovak', label: t('q.p.languages.other.slovak', 'Slowakisch') },
      { id: 'bulgarian', label: t('q.p.languages.other.bulgarian', 'Bulgarisch') },
      { id: 'slovenian', label: t('q.p.languages.other.slovenian', 'Slowenisch') },
      { id: 'hindi', label: t('q.p.languages.other.hindi', 'Hindi') },
      { id: 'bengali', label: t('q.p.languages.other.bengali', 'Bengalisch') },
      { id: 'vietnamese', label: t('q.p.languages.other.vietnamese', 'Vietnamesisch') },
      { id: 'thai', label: t('q.p.languages.other.thai', 'Thailändisch') },
      { id: 'urdu', label: t('q.p.languages.other.urdu', 'Urdu') },
      { id: 'pashto', label: t('q.p.languages.other.pashto', 'Paschtu') },
      { id: 'kurdish', label: t('q.p.languages.other.kurdish', 'Kurdisch') },
      { id: 'dari', label: t('q.p.languages.other.dari', 'Dari') },
      { id: 'indonesian', label: t('q.p.languages.other.indonesian', 'Indonesisch') },
    ],
    [t],
  );

  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step7Schema,
    onNext,
  });

  const handleToggle = (languageId: string) => {
    clearError('selected');
    if (data.selected.includes(languageId)) {
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== languageId) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, languageId] });
    }
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other');

    if (data.selected.includes('other')) {
      // Wenn abgewählt, leeren wir auch das 'other' Array
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== 'other'), other: [] });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'other'], other: data.other || [] });
    }
  };

  // Functionn to handle toggling of languages in the "other" category
  const handleOtherLanguageToggle = (languageId: string) => {
    clearError('other');
    const currentOther = data.other || [];

    if (currentOther.includes(languageId)) {
      onDataChange({ ...data, other: currentOther.filter((l) => l !== languageId) });
    } else {
      onDataChange({ ...data, other: [...currentOther, languageId] });
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
              key={language.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(language.id)}
                onCheckedChange={() => handleToggle(language.id)}
              />
              <span className="text-foreground">{language.label}</span>
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
                checked={data.selected.includes('other')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground font-medium">
                {t('q.p.languages.otherLanguages')}
              </span>
            </label>

            {/* 4. Scrollbare Checkbox-Liste für weitere Sprachen */}
            {data.selected.includes('other') && (
              <div
                className={`animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-lg border bg-muted/20 ${errors.other ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`}
              >
                <p className="text-sm font-medium mb-3 text-foreground">
                  {t('q.p.languages.selectMore')}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {otherLanguages.map((lang) => (
                    <label
                      key={lang.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-background/50 p-1 rounded"
                    >
                      <Checkbox
                        checked={(data.other || []).includes(lang.id)}
                        onCheckedChange={() => handleOtherLanguageToggle(lang.id)}
                      />
                      <span className="text-sm text-foreground">{lang.label}</span>
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
