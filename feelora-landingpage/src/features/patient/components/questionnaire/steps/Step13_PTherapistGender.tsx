import { Checkbox } from "@/components/ui/checkbox";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";

interface PatientGenderStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Extract "keine Präferenz" as a constant
const NO_PREFERENCE = "keine Präferenz";

// List of gender options - add more if needed
const genderOptions = [
  "männlich",
  "weiblich",
  "non-binary / divers",
];

// Define validation schema expecting a "selection" array
const step13Schema = z.object({
  selection: z.array(z.string()).min(1, "Bitte wähle mindestens eine Option aus"),
});

// Step Component
const Step13_PTherapistGender = ({ onNext, onBack, data = [], onDataChange }: PatientGenderStepProps) => {
  const safeData = data || [];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step13Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (gender: string) => {
    clearError("selection");

    // Remove "keine Präferenz" if a specific gender is clicked
    let currentSelection = safeData.filter((item) => item !== NO_PREFERENCE);

    if (currentSelection.includes(gender)) {
      currentSelection = currentSelection.filter((item) => item !== gender);
    } else {
      currentSelection = [...currentSelection, gender];
    }
    
    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError("selection");
    
    if (hasNoPreference) {
      // Uncheck it
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
        <h1 className="text-3xl font-bold text-purple mb-2">
          Patient:Innen Geschlecht
        </h1>
        <p className="text-muted-foreground mb-2">
          Falls relevant, welches Geschlecht bevorzugst du bei deinem/r Therapeut:In?
        </p>
        <p className={`text-sm ${errors.selection ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {errors.selection ? "Bitte wähle mindestens eine Option aus." : "Mehrfachauswahl möglich"}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selection ? "border border-destructive/50 bg-destructive/5" : ""}`}>
          
          {/* Standard Options */}
          {genderOptions.map((gender) => (
            <label
              key={gender}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? "opacity-50 bg-muted/30" : ""
              }`}
            >
              <Checkbox
                checked={safeData.includes(gender)}
                onCheckedChange={() => handleToggle(gender)}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{gender}</span>
            </label>
          ))}

          <div className="my-2 border-t border-border"></div>

          {/* Exclusive Option: Keine Präferenz */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <Checkbox
              checked={hasNoPreference}
              onCheckedChange={handleNoPreferenceToggle}
            />
            <span className="text-foreground font-medium">{NO_PREFERENCE}</span>
          </label>
          
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step13_PTherapistGender;