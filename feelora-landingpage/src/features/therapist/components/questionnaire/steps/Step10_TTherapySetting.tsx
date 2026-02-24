import { Checkbox } from "@/components/ui/checkbox";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";

interface TherapySettingStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Extract "keine Präferenz" as a constant
const NO_PREFERENCE = "keine Präferenz";

// List of therapy setting options - add more if needed
const settingOptions = [
  "Vor Ort",
  "Online (Video Call)",
  "Telefon / Anruf",
];

// Define validation schema expecting an object with a "selection" array
const step10Schema = z.object({
  selection: z.array(z.string()).min(1, "Bitte wähle mindestens eine Option aus"),
});

// Step Component
const Step10_TTherapySetting = ({ onNext, onBack, data, onDataChange }: TherapySettingStepProps) => {
  const safeData = data || [];

  // Initialize hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step10Schema,
    onNext,
  });

  const hasNoPreference = safeData.includes(NO_PREFERENCE);

  const handleToggle = (setting: string) => {
    clearError("selection");

    // Remove "keine Präferenz" if a specific setting is clicked
    let currentSelection = safeData.filter((s) => s !== NO_PREFERENCE);

    if (currentSelection.includes(setting)) {
      currentSelection = currentSelection.filter((s) => s !== setting);
    } else {
      currentSelection = [...currentSelection, setting];
    }
    
    onDataChange(currentSelection);
  };

  const handleNoPreferenceToggle = () => {
    clearError("selection");
    
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
        <h1 className="text-3xl font-bold text-purple mb-2">
          Bevorzugter Therapie Setting Modus
        </h1>
        <p className="text-muted-foreground mb-2">
          Welches Setting bevorzugst du für den Therapie-Sitzungstyp?
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
          {settingOptions.map((setting) => (
            <label
              key={setting}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                hasNoPreference ? "opacity-50 bg-muted/30" : ""
              }`}
            >
              <Checkbox
                checked={safeData.includes(setting)}
                onCheckedChange={() => handleToggle(setting)}
                disabled={hasNoPreference}
              />
              <span className="text-foreground">{setting}</span>
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

export default Step10_TTherapySetting;
