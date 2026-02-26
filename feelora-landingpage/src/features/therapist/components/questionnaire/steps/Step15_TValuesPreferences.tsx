import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';

interface ValuesPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

// List of values/preferences options - add more if needed
const valueOptions = [
  'LGBTQ+ affirmative Praxis',
  'Kulturell informierte Therapie',
  'Arbeit mit leistungsorientierten Personen / Führungskräften',
  'Spezialisierung auf Beziehungen / Paare / Familiendynamiken',
  'Erfahrung mit Konflikten am Arbeitsplatz oder Mobbing',
  'Unterstützung von Expats und internationalen Klient:innen',
  'Feministische oder geschlechtersensible Perspektive',
  'Begleitung bei wichtigen Lebensveränderungen (Karriere, Umzug usw.)',
  'Jahre an Erfahrung (+10)',
  'ich befinde mich unter supervision',
  'keine weiteren Angaben',
];

const Step15_TValuesPreferences = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: ValuesPreferencesStepProps) => {
  const handleToggle = (value: string) => {
    if (data.selected.includes(value)) {
      onDataChange({ ...data, selected: data.selected.filter((v) => v !== value) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, value] });
    }
  };

  const handleOtherToggle = () => {
    if (data.selected.includes('Other')) {
      onDataChange({ ...data, selected: data.selected.filter((v) => v !== 'Other'), other: '' });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Other'] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Werte und Präferenzen</h1>
        <p className="text-muted-foreground mb-2">
          Welche Werte, Ansätze oder Patient:Innen-profile beschreiben deine therapeutische Arbeit
          bzw. deinen Schwerpunkt am besten?
        </p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {valueOptions.map((value) => (
            <label
              key={value}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(value)}
                onCheckedChange={() => handleToggle(value)}
              />
              <span className="text-foreground">{value}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="t-values-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="t-values-other"
                checked={data.selected.includes('Other')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">Other</span>
            </label>
            {data.selected.includes('Other') && (
              <Input
                type="text"
                placeholder="Bitte angeben..."
                value={data.other}
                onChange={(e) => onDataChange({ ...data, other: e.target.value })}
                className="bg-background"
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step15_TValuesPreferences;
