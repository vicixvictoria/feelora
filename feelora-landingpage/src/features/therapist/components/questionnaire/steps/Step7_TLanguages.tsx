import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';

interface LanguagesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string[] };
  onDataChange: (data: { selected: string[]; other: string[] }) => void;
}

// 1. Extract stable internal value for the "Other" option
const OTHER_VALUE = 'other';

const Step7_TLanguages = ({ onNext, onBack, data, onDataChange }: LanguagesStepProps) => {
  const { t } = useTranslation();

  // 2. Define schema INSIDE the component using useMemo to access translations
  const step7Schema = useMemo(() => {
    return z
      .object({
        selected: z
          .array(z.string())
          .min(1, t('q.t.languages.selectError', 'Please select at least one language')),
        other: z.array(z.string()).optional(),
      })
      .refine(
        (valData) => {
          if (valData.selected.includes(OTHER_VALUE)) {
            return valData.other && valData.other.length > 0;
          }
          return true;
        },
        {
          message: t('q.t.languages.otherError', 'Please select at least one other language'),
          path: ['other'],
        },
      );
  }, [t]);

  // 3. Define Main Options with stable IDs and translated labels
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

  // 4. Define "Other" Options with stable IDs and translated labels
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

    if (data.selected.includes(OTHER_VALUE)) {
      onDataChange({
        ...data,
        selected: data.selected.filter((l) => l !== OTHER_VALUE),
        other: [],
      });
    } else {
      onDataChange({ ...data, selected: [...data.selected, OTHER_VALUE], other: data.other || [] });
    }
  };

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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.languages.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.languages.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.t.languages.selectError') : t('q.common.multiSelect')}
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
              htmlFor="t-languages-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="t-languages-other"
                checked={data.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground font-medium">{t('q.common.otherLanguages')}</span>
            </label>

            {data.selected.includes(OTHER_VALUE) && (
              <div
                className={`animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-lg border bg-muted/20 ${errors.other ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`}
              >
                <p className="text-sm font-medium mb-3 text-foreground">
                  {t('q.common.selectMoreLanguages')}
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
                  <p className="text-xs text-destructive mt-3">{t('q.t.languages.otherError')}</p>
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
