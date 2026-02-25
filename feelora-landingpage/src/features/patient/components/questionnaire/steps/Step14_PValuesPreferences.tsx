import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';

interface ValuesPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string };
  onDataChange: (data: { selected: string[]; other?: string }) => void;
}

// Extract the exclusive option
const NO_PREFERENCE = 'keine Präferenz';

// List of values/preferences options - add more if needed
const valueOptions = [
  'LGBTQ+ freundlich / affirmativ',
  'Kulturell sensibel',
  'Erfahrung mit leistungsorientierten Personen / Führungskräften',
  'Expertise in Beziehungs- oder Familienthemen',
  'Expertise bei Konflikten am Arbeitsplatz oder Mobbing',
  'Erfahrung mit Expatriates oder internationalen Klient:innen',
  'Geschlechtersensibler oder feministischer Ansatz',
  'Erfahrung mit Lebensübergängen (Karriere, Umzug usw.)',
  'Jemand Älteres mit mehr Erfahrung',
  'Jemand Jüngeres',
  'Ich bin offen für eine/n Therapeut:in in Supervision',
];

// 2. Define validation schema with complex conditional logic
const step14Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Option aus'),
    other: z.string().optional(),
  })
  .refine(
    (data) => {
      // If "Andere" is checked, the input cannot be empty
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

const Step14_PValuesPreferences = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: ValuesPreferencesStepProps) => {
  // Initialize validationhook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step14Schema,
    onNext,
  });

  const hasNoPreference = data.selected.includes(NO_PREFERENCE);

  const handleToggle = (value: string) => {
    clearError('selected');

    // Remove "keine Präferenz" if a specific value is clicked
    let currentSelection = data.selected.filter((v) => v !== NO_PREFERENCE);

    if (currentSelection.includes(value)) {
      currentSelection = currentSelection.filter((v) => v !== value);
    } else {
      currentSelection = [...currentSelection, value];
    }

    onDataChange({ ...data, selected: currentSelection });
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other');

    let currentSelection = data.selected.filter((v) => v !== NO_PREFERENCE);

    if (currentSelection.includes('Andere')) {
      onDataChange({
        ...data,
        selected: currentSelection.filter((v) => v !== 'Andere'),
        other: '',
      });
    } else {
      onDataChange({ ...data, selected: [...currentSelection, 'Andere'] });
    }
  };

  const handleNoPreferenceToggle = () => {
    clearError('selected');
    clearError('other');

    if (hasNoPreference) {
      // Uncheck it
      onDataChange({ ...data, selected: [] });
    } else {
      // Check it -> wipe out all other selections AND the 'other' text
      onDataChange({ ...data, selected: [NO_PREFERENCE], other: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Werte und Präferenzen</h1>
        <p className="text-muted-foreground mb-2">
          Welche Eigenschaften, Werte oder Fachgebiete sind dir bei einer Therapeutin oder einem
          Therapeuten besonders wichtig?
        </p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? 'Bitte wähle mindestens eine Option aus.' : 'Mehrfachauswahl möglich'}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {valueOptions.map((value) => (
            <label
              key={value}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.selected.includes(value)}
                onCheckedChange={() => handleToggle(value)}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{value}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="p-values-other"
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                id="p-values-other"
                checked={data.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">Andere</span>
            </label>

            {/* Conditional Input */}
            {data.selected.includes('Andere') && !hasNoPreference && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder="Bitte angeben..."
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">Bitte gib Details an</span>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <Checkbox checked={hasNoPreference} onCheckedChange={handleNoPreferenceToggle} />
            <span className="text-foreground font-medium">{NO_PREFERENCE}</span>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step14_PValuesPreferences;
