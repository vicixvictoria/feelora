import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";


interface PreviousTherapyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other?: string; neverHadTherapy: boolean };
  onDataChange: (data: { selected: string[]; other?: string; neverHadTherapy: boolean }) => void;
}

const therapyOptions = [
  "Kognitive Verhaltenstherapie (KVT)",
  "Psychoanalyse",
  "Personenzentrierte Therapie",
  "Gestalttherapie",
  "Trauma-informierte Therapie",
];

// Define validation schema with  conditional logic
const step6Schema = z.object({
  selected: z.array(z.string()),
  other: z.string().optional(),
  neverHadTherapy: z.boolean(),
}).superRefine((data, ctx) => {
  // Rule 1: If they haven't checked "Never had therapy", they MUST select at least one therapy.
  if (!data.neverHadTherapy && data.selected.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bitte wähle mindestens eine Option aus",
      path: ["selected"], // Triggers errors.selected
    });
  }

  // Rule 2: If "Andere" is checked, the text area must be filled.
  if (!data.neverHadTherapy && data.selected.includes("Andere")) {
    if (!data.other || data.other.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitte spezifizieren",
        path: ["other"], // Triggers errors.other
      });
    }
  }
});

const Step6_PPreviousTherapy = ({ onNext, onBack, data, onDataChange }: PreviousTherapyStepProps) => {
  const safeData = data || { selected: [], other: "", neverHadTherapy: false };

  // 2. Initialize Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: safeData,
    schema: step6Schema,
    onNext,
  });

  const handleToggle = (option: string) => {
    if (safeData.neverHadTherapy) return;
    clearError("selected"); // Clear main error when user interacts

    if (safeData.selected.includes(option)) {
      onDataChange({ ...safeData, selected: safeData.selected.filter((s) => s !== option) });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, option] });
    }
  };

  const handleOtherToggle = () => {
    if (safeData.neverHadTherapy) return;
    clearError("selected");
    clearError("other");

    if (safeData.selected.includes("Andere")) {
      onDataChange({ ...safeData, selected: safeData.selected.filter((s) => s !== "Andere"), other: "" });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, "Andere"] });
    }
  };

  const handleNeverTherapy = () => {
    clearError("selected");
    clearError("other");

    if (safeData.neverHadTherapy) {
      onDataChange({ ...safeData, neverHadTherapy: false });
    } else {
      onDataChange({ selected: [], other: "", neverHadTherapy: true });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Vorherige Therapie
        </h1>
        <p className="text-muted-foreground mb-2">
          Hast du schon einmal einen Therapeuten aufgesucht? Wenn ja, welche Art von Therapie hast du erhalten?
        </p>
        {/* 3. Show error message in header if nothing is selected */}
        <p className={`text-sm ${errors.selected ? "text-destructive font-semibold" : "text-muted-foreground italic"}`}>
          {errors.selected ? "Bitte wähle eine Option oder 'Ich hatte noch nie Therapie' aus." : "Mehrfachauswahl möglich"}
        </p>
      </div>

      {/* Form Card */}
      <div className={`feelora-card transition-colors ${errors.selected ? "border-destructive/50 bg-destructive/5" : ""}`}>
        <div className="grid grid-cols-1 gap-3">
          {therapyOptions.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                safeData.neverHadTherapy ? "opacity-50 pointer-events-none bg-muted/30" : ""
              }`}
            >
              <Checkbox
                checked={safeData.selected.includes(option)}
                onCheckedChange={() => handleToggle(option)}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">{option}</span>
            </label>
          ))}
          
          {/* Other option */}
          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                safeData.neverHadTherapy ? "opacity-50 pointer-events-none bg-muted/30" : ""
              }`}
            >
              <Checkbox
                checked={safeData.selected.includes("Andere")}
                onCheckedChange={handleOtherToggle}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">Andere</span>
            </label>

            {/* 4. Validate Textarea for "Andere" */}
            {safeData.selected.includes("Andere") && !safeData.neverHadTherapy && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Textarea
                  placeholder="Bitte spezifizieren..."
                  value={safeData.other}
                  onChange={(e) => {
                    clearError("other");
                    onDataChange({ ...safeData, other: e.target.value });
                  }}
                  className={`bg-background resize-none ${errors.other ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.other && (
                  <p className="text-xs text-destructive mt-1 ml-1">Bitte gib Details an</p>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* Never had therapy option */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <Checkbox
              checked={safeData.neverHadTherapy}
              onCheckedChange={handleNeverTherapy}
             />
            <span className="text-foreground font-medium">Ich hatte noch nie Therapie</span>
          </label>
        </div>
      </div>

      {/* 5. Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step6_PPreviousTherapy;