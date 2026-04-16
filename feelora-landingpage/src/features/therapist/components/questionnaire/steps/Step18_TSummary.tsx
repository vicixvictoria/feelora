import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// --- Steps ---
interface SummaryStepProps {
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isLoading?: boolean;
  data: {
    personalData: Record<string, string>;
    contactInfo: Record<string, string>;
    qualifications: Record<string, string>;
    experience: string[];
    specialties: { selected: string[]; other: string };
    languages: { selected: string[]; other: string[] };
    therapySchool: { selected: string[]; other: string };
    therapyMethods: string;
    therapySetting: string[];
    therapyFormat: string[];
    therapyDuration: string;
    sessionFrequency: string[];
    patientGender: string[];
    valuesPreferences: { selected: string[]; other: string };
    additionalInfo: string;
    availability: string[];
  };
}

// Define a type for each section in the summary
interface SummarySection {
  step: number;
  title: string;
  content: React.ReactNode;
}

// accept an optional label mapper to translate IDs
const formatArray = (
  arr: string[] | undefined, 
  fallback = '—', 
  labelMapper?: (id: string) => string
) => {
  if (!arr || arr.length === 0) return fallback;
  const mappedArr = labelMapper ? arr.map(labelMapper) : arr;
  return mappedArr.join(', ');
};

//accept an optional label mapper to translate IDs
const formatArrayWithOther = (
  selected: string[] | undefined, 
  other?: string | string[], 
  labelMapper?: (id: string) => string
) => {
  const items = selected || [];
  const mappedItems = labelMapper ? items.map(labelMapper) : items;
  
  const otherItems = Array.isArray(other) ? other : other ? [other] : [];
  const combined = [...mappedItems, ...otherItems];
  
  return combined.length > 0 ? combined.join(', ') : '—';
};


const Step18_TSummary = ({ onNext, onBack, onEdit, data }: SummaryStepProps) => {
  const { t } = useTranslation();

  // --- MAPPING DICTIONARIES ---
  
  // Mapper for Values & Preferences
  const getValueLabel = (id: string) => {
    const map: Record<string, string> = {
      lgbtq: t('q.t.valuesPreferences.lgbtq'),
      cultural: t('q.t.valuesPreferences.cultural'),
      executives: t('q.t.valuesPreferences.executives'),
      relationships: t('q.t.valuesPreferences.relationships'),
      workplace: t('q.t.valuesPreferences.workplace'),
      expats: t('q.t.valuesPreferences.expats'),
      feminist: t('q.t.valuesPreferences.feminist'),
      lifeChanges: t('q.t.valuesPreferences.lifeChanges'),
      experience10: t('q.t.valuesPreferences.experience10'),
      supervision: t('q.t.valuesPreferences.supervision'),
      none: t('q.t.valuesPreferences.none'),
    };
    return map[id] || id; // Fallback to ID if it's missing from the map
  };

  // Mapper for Availability 
  const getAvailabilityLabel = (id: string) => {
    const map: Record<string, string> = {
      mo: t('q.t.availability.mon'),
      di: t('q.t.availability.tue'),
      mi: t('q.t.availability.wed'),
      do: t('q.t.availability.thu'),
      fr: t('q.t.availability.fri'),
      sa: t('q.t.availability.sat'),
      so: t('q.t.availability.sun'),
    };
    return map[id] || id.toUpperCase();
  };



  const sections: SummarySection[] = [
    {
      step: 1,
      title: t('q.t.summary.personalData'),
      content: (
        <p className="text-foreground/80">
          {data.personalData?.firstName || '—'} {data.personalData?.lastName || ''}
          {data.personalData?.title && ` (${data.personalData.title})`}
          {data.personalData?.bday && `, ${data.personalData.bday}`}
          {data.personalData?.job && `, ${data.personalData.job}`}
        </p>
      ),
    },
    {
      step: 2,
      title: t('q.t.summary.contactInfo'),
      content: (
        <>
          <p className="text-foreground/80">
            {t('q.t.summary.mobile')}: {data.contactInfo?.phone || '—'}
            {' · '}
            {t('q.t.summary.mail')}: {data.contactInfo?.email || '—'}
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
      title: t('q.t.summary.qualifications'),
      content: (
        <>
          <p className="text-foreground/80">
            {t('q.t.summary.titleLabel')}: {data.qualifications?.titlePrefix || '—'}
            {data.qualifications?.titleFromPrefix &&
              ` (${t('q.t.summary.from')} ${data.qualifications.titleFromPrefix})`}
            {data.qualifications?.titleSuffix && `, ${data.qualifications.titleSuffix}`}
            {data.qualifications?.titleFromSuffix &&
              ` (${t('q.t.summary.from')} ${data.qualifications.titleFromSuffix})`}
          </p>
          {data.qualifications?.qualifications && (
            <p className="text-foreground/80">
              {t('q.t.summary.qualificationsLabel')}: {data.qualifications.qualifications}
            </p>
          )}
        </>
      ),
    },
    {
      step: 4,
      title: t('q.t.summary.experienceSince'),
      content: <p className="text-foreground/80">{formatArray(data.experience)}</p>,
    },
    {
      step: 5,
      title: t('q.t.summary.specialties'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.specialties?.selected, data.specialties?.other)}
        </p>
      ),
    },
    {
      step: 6,
      title: t('q.t.summary.languages'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.languages?.selected, data.languages?.other)}
        </p>
      ),
    },
    {
      step: 7,
      title: t('q.t.summary.therapySchool'),
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.therapySchool?.selected, data.therapySchool?.other)}
        </p>
      ),
    },
    {
      step: 8,
      title: t('q.t.summary.therapyMethods'),
      content: <p className="text-foreground/80">{data.therapyMethods || '—'}</p>,
    },
    {
      step: 9,
      title: t('q.t.summary.therapySetting'),
      content: <p className="text-foreground/80">{formatArray(data.therapySetting)}</p>,
    },
    {
      step: 10,
      title: t('q.t.summary.therapyFormat'),
      content: <p className="text-foreground/80">{formatArray(data.therapyFormat)}</p>,
    },
    {
      step: 11,
      title: t('q.t.summary.therapyDuration'),
      content: <p className="text-foreground/80">{data.therapyDuration || '—'}</p>,
    },
    {
      step: 12,
      title: t('q.t.summary.sessionFrequency'),
      content: <p className="text-foreground/80">{formatArray(data.sessionFrequency)}</p>,
    },
    {
      step: 13,
      title: t('q.t.summary.patientGender'),
      content: <p className="text-foreground/80">{formatArray(data.patientGender)}</p>,
    },
    {
      step: 14,
      title: t('q.t.summary.values'),
      content: (
        <p className="text-foreground/80">
          {/* Passed the getValueLabel function here! */}
          {formatArrayWithOther(
            data.valuesPreferences?.selected, 
            data.valuesPreferences?.other, 
            getValueLabel
          )}
        </p>
      ),
    },
    {
      step: 15,
      title: t('q.t.summary.additionalInfo'),
      content: <p className="text-foreground/80">{data.additionalInfo || '—'}</p>,
    },
    {
      step: 16,
      title: t('q.t.summary.availability'),
      content: (
        <p className="text-foreground/80">
          {/* Passed the getAvailabilityLabel function here! */}
          {formatArray(data.availability, '—', getAvailabilityLabel)}
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.summary.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.summary.subtitle')}</p>
      </div>

      {/* Summary Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.step} className="feelora-card relative">
            <button
              onClick={() => onEdit(section.step)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
              aria-label={`${section.title} ${t('q.t.summary.edit')}`}
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
        <Button variant="outline" onClick={onBack} className="feelora-btn-outline">
          {t('q.t.summary.back')}
        </Button>
        <Button onClick={onNext} className="feelora-btn-primary">
          {t('q.t.summary.submit')}
          <Check className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step18_TSummary;