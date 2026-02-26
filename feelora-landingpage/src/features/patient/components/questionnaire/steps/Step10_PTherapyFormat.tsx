import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';

interface TherapyFormatStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// no preference always const
const NO_PREFERENCE = 'keine-praeferenz';

// List of therapy format options - add more if needed
const formatOptions = [
  { id: 'einzel', label: 'Einzel', description: 'One-on-one Sessions' },
  { id: 'paar', label: 'Paar', description: 'Paartherapie' },
  { id: 'gruppe', label: 'Gruppe', description: 'Gruppentherapie Sessions' },
  { id: 'familien', label: 'Familien', description: 'Therapie mit Familien' },
];

// Define validation schema expecting an object with a "selection" array
const step10Schema = z.object({
  selection: z.array(z.string()).min(1, 'Bitte wähle mindestens ein Format aus'),
});

// Step Component
const Step10_PTherapyFormat = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: TherapyFormatStepProps) => {
  const safeData = data || [];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step10Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (id: string) => {
    clearError('selection');

    // If they click a specific format, ensure "Keine Präferenz" is removed
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
      // Uncheck it
      onDataChange([]);
    } else {
      // Check it and wipe out all other selections
      onDataChange([NO_PREFERENCE]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Bevorzugtes Therapie Setting Format</h1>
        <p className="text-muted-foreground mb-2">Welche Therapieformate würdest du bevorzugen?</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? 'Bitte wähle mindestens ein Format aus.' : 'Mehrfachauswahl möglich'}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Standard Options */}
          {formatOptions.map((option) => (
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
                disabled={hasNoPreference} // Optional: physically disables the checkbox
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
            htmlFor="no-preference-format"
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="no-preference-format"
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

export default Step10_PTherapyFormat;
