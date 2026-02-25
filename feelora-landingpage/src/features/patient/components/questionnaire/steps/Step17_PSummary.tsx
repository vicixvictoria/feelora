import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionnaireData } from '@/features/patient/types/questionnaire';

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

const formatArray = (arr: string[] | undefined, fallback = '—') => {
  if (!arr || arr.length === 0) return fallback;
  return arr.join(', ');
};

const formatArrayWithOther = (selected: string[] | undefined, other?: string | string[]) => {
  const items = selected || [];
  const otherItems = Array.isArray(other) ? other : other ? [other] : [];
  const combined = [...items, ...otherItems];
  return combined.length > 0 ? combined.join(', ') : '—';
};

// Step Component for final summary and review of all answers before submission
const Step17_PSummary = ({ onNext, onBack, onEdit, data, isLoading }: SummaryStepProps) => {
  const sections: SummarySection[] = [
    {
      step: 1,
      title: 'Persönliche Daten',
      content: (
        <p className="text-foreground/80">
          {data.personalData?.firstName || '—'} {data.personalData?.lastName || ''}
          {data.personalData?.title && ` (${data.personalData.title})`}
          {data.personalData?.age && `, ${data.personalData.age} Jahre`}
          {data.personalData?.profession && `, ${data.personalData.profession}`}
        </p>
      ),
    },
    {
      step: 2,
      title: 'Kontaktinformationen',
      content: (
        <>
          <p className="text-foreground/80">
            Mobil: {data.contactInfo?.phone || '—'}
            {' · '}Mail: {data.contactInfo?.email || '—'}
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
      title: 'Mentale Gesundheit',
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.mentalHealth?.selected, data.mentalHealth?.other)}
        </p>
      ),
    },
    {
      step: 4,
      title: 'Zeitraum der Beschwerden',
      content: <p className="text-foreground/80">{formatArray(data.timeframe)}</p>,
    },
    {
      step: 5,
      title: 'Vorherige Therapieerfahrungen',
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.previousTherapy?.selected, data.previousTherapy?.other)}
        </p>
      ),
    },
    {
      step: 6,
      title: 'Sprachen',
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.languages?.selected, data.languages?.other)}
        </p>
      ),
    },
    {
      step: 7,
      title: 'Therapiepräferenzen',
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.therapySchool?.selected, data.therapySchool?.other)}
        </p>
      ),
    },
    {
      step: 8,
      title: 'Bevorzugter Therapie Setting Modus',
      content: <p className="text-foreground/80">{data.therapySetting || '—'}</p>,
    },
    {
      step: 9,
      title: 'Bevorzugtes Therapie Setting Format',
      content: <p className="text-foreground/80">{formatArray(data.therapyFormat)}</p>,
    },
    {
      step: 10,
      title: 'Therapiedauer',
      content: <p className="text-foreground/80">{data.therapyDuration || '—'}</p>,
    },
    {
      step: 11,
      title: 'Sitzungsfrequenz',
      content: <p className="text-foreground/80">{formatArray(data.sessionFrequency)}</p>,
    },
    {
      step: 12,
      title: 'Therapeut:Innen Geschlecht',
      content: <p className="text-foreground/80">{formatArray(data.therapistGender)}</p>,
    },
    {
      step: 13,
      title: 'Werte und Präferenzen',
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.valuesPreferences?.selected, data.valuesPreferences?.other)}
        </p>
      ),
    },
    {
      step: 14,
      title: 'Zusätzliche Information',
      content: <p className="text-foreground/80">{data.additionalInfo || '—'}</p>,
    },
    {
      step: 15,
      title: 'Verfügbarkeit',
      content: (
        <p className="text-foreground/80">
          {formatArray(data.availability?.map((d) => d.toUpperCase()))}
        </p>
      ),
    },
  ];
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Zusammenfassung</h1>
        <p className="text-muted-foreground">
          Bitte überprüfe alle Daten und deine Antworten, bevor du den Screening-Fragebogen
          absendest.
        </p>
      </div>
      {/* Summary Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.step} className="feelora-card relative">
            <button
              onClick={() => onEdit(section.step)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
              aria-label={`${section.title} bearbeiten`}
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
          ← zurück
        </Button>
        <Button onClick={onNext} className="feelora-btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              Wird gesendet...
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </>
          ) : (
            <>
              Absenden
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
export default Step17_PSummary;
