import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionnaireData } from '@/features/patient/types/questionnaire';
import { useTranslation } from 'react-i18next';

// --- Steps ---
interface SummaryStepProps {
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  data: QuestionnaireData;
  isLoading?: boolean;
}

// Define a type for each section in the summary
interface SummarySection {
  step: number;
  title: string;
  content: React.ReactNode;
}

// Accept an optional label mapper to translate IDs
const formatArray = (
  arr: string[] | undefined,
  fallback = '—',
  labelMapper?: (id: string) => string
) => {
  if (!arr || arr.length === 0) return fallback;
  const mappedArr = labelMapper ? arr.map(labelMapper) : arr;
  return mappedArr.join(', ');
};

// Accept an optional label mapper to translate IDs
const formatArrayWithOther = (
  selected: string[] | undefined,
  other?: string | string[],
  labelMapper?: (id: string) => string
) => {
  const items = selected || [];
  const otherItems = Array.isArray(other) ? other : other ? [other] : [];
  const combined = [...items, ...otherItems];
  
  const mappedItems = labelMapper ? combined.map(labelMapper) : combined;
  return mappedItems.length > 0 ? mappedItems.join(', ') : '—';
};

// Step Component for final summary and review of all answers before submission
const Step17_PSummary = ({ onNext, onBack, onEdit, data, isLoading }: SummaryStepProps) => {
  const { t } = useTranslation();

  // --- MAPPING DICTIONARIES & HELPERS ---

  // Generic mapper for basic options (add more keys here as needed)
  const getGenericLabel = (id: string) => {
    if (!id) return '';
    if (id === 'no_preference' || id === 'keine-praeferenz' || id === 'keine Präferenz') {
      return t('q.p.therapySetting.noPreference', 'Keine Präferenz');
    }
    
    // Add any other simple mappings here (e.g., gender, therapy format)
    const genericMap: Record<string, string> = {
      male: t('q.p.personal.male', 'Männlich'),
      female: t('q.p.personal.female', 'Weiblich'),
      diverse: t('q.p.personal.diverse', 'Divers'),
    };

    return genericMap[id] || id.charAt(0).toUpperCase() + id.slice(1); // Fallback to capitalized ID
  };

  // Mapper for Therapy Settings
  const getSettingLabel = (id: string) => {
    if (id === 'no_preference') return t('q.p.therapySetting.noPreference', 'Keine Präferenz');
    const map: Record<string, string> = {
      in_person: t('q.p.therapySetting.options.onSite', 'Vor Ort'),
      online: t('q.p.therapySetting.options.online', 'Online (Video)'),
      phone: t('q.p.therapySetting.options.phone', 'Telefonisch'),
    };
    return map[id] || id;
  };

  // Mapper for Languages
  const getLanguageLabel = (id: string) => {
    const langMap: Record<string, string> = {
      german: t('q.p.languages.options.german', 'Deutsch'),
      english: t('q.p.languages.options.english', 'Englisch'),
      croatian: t('q.p.languages.options.croatian', 'Kroatisch'),
      arabic: t('q.p.languages.options.arabic', 'Arabisch'),
      turkish: t('q.p.languages.options.turkish', 'Türkisch'),
      polish: t('q.p.languages.options.polish', 'Polnisch'),
      serbian: t('q.p.languages.options.serbian', 'Serbisch'),
      italian: t('q.p.languages.options.italian', 'Italienisch'),
      hungarian: t('q.p.languages.options.hungarian', 'Ungarisch'),
      farsi: t('q.p.languages.options.farsi', 'Farsi / Persisch'),
      romanian: t('q.p.languages.options.romanian', 'Rumänisch'),
      spanish: t('q.p.languages.options.spanish', 'Spanisch'),
      french: t('q.p.languages.options.french', 'Französisch'),
      ukrainian: t('q.p.languages.options.ukrainian', 'Ukrainisch'),
      russian: t('q.p.languages.options.russian', 'Russisch'),
      albanian: t('q.p.languages.other.albanian', 'Albanisch'),
      portuguese: t('q.p.languages.other.portuguese', 'Portugiesisch'),
      chinese: t('q.p.languages.other.chinese', 'Chinesisch'),
      japanese: t('q.p.languages.other.japanese', 'Japanisch'),
      korean: t('q.p.languages.other.korean', 'Koreanisch'),
      dutch: t('q.p.languages.other.dutch', 'Niederländisch'),
      swedish: t('q.p.languages.other.swedish', 'Schwedisch'),
      danish: t('q.p.languages.other.danish', 'Dänisch'),
      norwegian: t('q.p.languages.other.norwegian', 'Norwegisch'),
      finnish: t('q.p.languages.other.finnish', 'Finnisch'),
      greek: t('q.p.languages.other.greek', 'Griechisch'),
      hebrew: t('q.p.languages.other.hebrew', 'Hebräisch'),
      czech: t('q.p.languages.other.czech', 'Tschechisch'),
      slovak: t('q.p.languages.other.slovak', 'Slowakisch'),
      bulgarian: t('q.p.languages.other.bulgarian', 'Bulgarisch'),
      slovenian: t('q.p.languages.other.slovenian', 'Slowenisch'),
      hindi: t('q.p.languages.other.hindi', 'Hindi'),
      bengali: t('q.p.languages.other.bengali', 'Bengalisch'),
      vietnamese: t('q.p.languages.other.vietnamese', 'Vietnamesisch'),
      thai: t('q.p.languages.other.thai', 'Thailändisch'),
      urdu: t('q.p.languages.other.urdu', 'Urdu'),
      pashto: t('q.p.languages.other.pashto', 'Paschtu'),
      kurdish: t('q.p.languages.other.kurdish', 'Kurdisch'),
      dari: t('q.p.languages.other.dari', 'Dari'),
      indonesian: t('q.p.languages.other.indonesian', 'Indonesisch'),
    };
    return langMap[id.toLowerCase()] || id.charAt(0).toUpperCase() + id.slice(1);
  };

  // Mapper for Availability
  const getAvailabilityLabel = (id: string) => {
    const map: Record<string, string> = {
      mo: t('q.t.availability.mon', 'Montag'),
      di: t('q.t.availability.tue', 'Dienstag'),
      mi: t('q.t.availability.wed', 'Mittwoch'),
      do: t('q.t.availability.thu', 'Donnerstag'),
      fr: t('q.t.availability.fri', 'Freitag'),
      sa: t('q.t.availability.sat', 'Samstag'),
      so: t('q.t.availability.sun', 'Sonntag'),
    };
    return map[id] || id.toUpperCase();
  };

  const sections: SummarySection[] = [
    {
      step: 1,
      title: t('q.p.summary.personalData'),
      content: (
        <p className="text-foreground/80">
          {data.personalData?.firstName || '—'} {data.personalData?.lastName || ''}
          {data.personalData?.title && ` (${data.personalData.title})`}
          {data.personalData?.age && `, ${data.personalData.age} ${t('q.p.summary.years')}`}
          {data.personalData?.profession && `, ${data.personalData.profession}`}
        </p>
      ),
    },
    {
      step: 2,
      title: t('q.p.summary.contactInfo'),
      content: (
        <>
          <p className="text-foreground/80">
            {t('q.p.summary.phone')}: {data.contactInfo?.phone || '—'}
            {' · '}
            {t('q.p.summary.email')}: {data.contactInfo?.email || '—'}
          </p>
          <p className="text-foreground/80">
            {data.contactInfo?.address || '—'}, {data.contactInfo?.postalCode || ''}{' '}
            {data.contactInfo?.city || ''}, {data.contactInfo?.country || '—'}
          </p>
        </>
      ),
    },
    {
      step: 3,
      title: t('q.p.summary.mentalHealth'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.mentalHealth?.selected, data.mentalHealth?.other, getGenericLabel)}
        </p>
      ),
    },
    {
      step: 4,
      title: t('q.p.summary.timeframe'),
      content: <p className="text-foreground/80">{formatArray(data.timeframe, '—', getGenericLabel)}</p>,
    },
    {
      step: 5,
      title: t('q.p.summary.previousTherapy'),
      content: (
        <p className="text-foreground/80">
          {data.previousTherapy?.neverHadTherapy 
            ? t('q.p.previousTherapy.never', 'Noch nie in Therapie gewesen')
            : formatArrayWithOther(data.previousTherapy?.selected, data.previousTherapy?.other, getGenericLabel)}
        </p>
      ),
    },
    {
      step: 6,
      title: t('q.p.summary.languages'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.languages?.selected, data.languages?.other, getLanguageLabel)}
        </p>
      ),
    },
    {
      step: 7,
      title: t('q.p.summary.therapySchool'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.therapySchool?.selected, data.therapySchool?.other, getGenericLabel)}
        </p>
      ),
    },
    {
      step: 8,
      title: t('q.p.summary.therapySetting'),
      content: <p className="text-foreground/80">{formatArray(data.therapySetting, '—', getSettingLabel)}</p>,
    },
    {
      step: 9,
      title: t('q.p.summary.therapyFormat'),
      content: <p className="text-foreground/80">{formatArray(data.therapyFormat, '—', getGenericLabel)}</p>,
    },
    {
      step: 10,
      title: t('q.p.summary.therapyDuration'),
      content: <p className="text-foreground/80">{getGenericLabel(data.therapyDuration) || '—'}</p>,
    },
    {
      step: 11,
      title: t('q.p.summary.sessionFrequency'),
      content: <p className="text-foreground/80">{formatArray(data.sessionFrequency, '—', getGenericLabel)}</p>,
    },
    {
      step: 12,
      title: t('q.p.summary.therapistGender'),
      content: <p className="text-foreground/80">{formatArray(data.therapistGender, '—', getGenericLabel)}</p>,
    },
    {
      step: 13,
      title: t('q.p.summary.values'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.valuesPreferences?.selected, data.valuesPreferences?.other, getGenericLabel)}
        </p>
      ),
    },
    {
      step: 14,
      title: t('q.p.summary.additionalInfo'),
      content: <p className="text-foreground/80">{data.additionalInfo || '—'}</p>,
    },
    {
      step: 15,
      title: t('q.p.summary.availability'),
      content: (
        <p className="text-foreground/80">
          {formatArray(data.availability, '—', getAvailabilityLabel)}
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.summary.title')}</h1>
        <p className="text-muted-foreground">{t('q.p.summary.subtitle')}</p>
      </div>
      {/* Summary Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.step} className="feelora-card relative">
            <button
              onClick={() => onEdit(section.step)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
              aria-label={`${section.title} ${t('q.p.summary.edit')}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-purple mb-2">{section.title}</h3>
            <div className="pr-10">{section.content}</div>
          </div>
        ))}
      </div>
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="feelora-btn-outline"
          disabled={isLoading}
        >
          {t('q.p.summary.back')}
        </Button>
        <Button onClick={onNext} className="feelora-btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              {t('q.p.summary.submitting')}
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </>
          ) : (
            <>
              {t('q.p.summary.submit')}
              <Check className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step17_PSummary;