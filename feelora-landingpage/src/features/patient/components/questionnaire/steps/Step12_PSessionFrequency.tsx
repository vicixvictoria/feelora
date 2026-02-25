import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';

// Props Interface
interface SessionFrequencyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Extract the exclusive option
const NO_PREFERENCE = 'keine-praeferenz';

// List of session frequency options - add more if needed
const frequencyOptions = [
  { id: 'flexibel', label: 'Flexibel', description: 'Ganz nach Patient:Innen Wunsch' },
  { id: 'woechentlich', label: 'Wöchentlich', description: 'Wöchentlich wiederholende Termine' },
  {
    id: 'zweiwoechentlich',
    label: 'Zweiwöchentlich',
    description: 'Termine wiederholen alle zwei Wochen',
  },
];

// Define validation schema expecting an object with a "selection" array
const step12Schema = z.object({
  selection: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Frequenz aus'),
});

// Step Component
const Step12_PSessionFrequency = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: SessionFrequencyStepProps) => {
  const safeData = data || [];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step12Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError('selection');

    // Remove "Keine Präferenz" if a specific frequency is clicked
    let currentSelection = safeData.filter((item) => item !== NO_PREFERENCE);

    if (currentSelection.includes(id)) {
      currentSelection = currentSelection.filter((item) => item !== id);
    } else {
      currentSelection = [...currentSelection, id];
    }

    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError('selection');

    if (hasNoPreference) {
      // Uncheck it -> empty array
      onDataChange([]);
    } else {
      // Check it -> wipe out all other selections
      onDataChange([NO_PREFERENCE]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Sitzungsfrequenz</h1>
        <p className="text-muted-foreground mb-2">
          Erzähle uns von deiner bevorzugten Sitzungsfrequenz.
        </p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? 'Bitte wähle mindestens eine Option aus.' : 'Mehrfachauswahl möglich'}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {frequencyOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={safeData.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                className="mt-0.5"
                disabled={hasNoPreference}
              />
              <div className="flex flex-col">
                <span className="text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          ))}

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          <label
            htmlFor="no-preference-frequency"
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="no-preference-frequency"
              checked={hasNoPreference}
              onCheckedChange={handleNoPreferenceToggle}
              className="mt-0.5"
            />
            <div className="flex flex-col">
              <span className="text-foreground">Keine Präferenz</span>
            </div>
          </label>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step12_PSessionFrequency;
