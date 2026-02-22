import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";

interface TherapyDurationStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}
// List of therapy duration options - add more if needed
const durationOptions = [
  { id: "kurzzeit", label: "Kurzzeit", description: "(ca. 10-20 Sitzungen)" },
  { id: "langzeit", label: "Langzeit", description: "(>20 Sitzungen)" },
  { id: "unsicher", label: "Ich weiß es nicht", description: "" },
  { id: "keine-praeferenz", label: "Keine Präferenz", description: "" },
];

// 1. Define validation schema for a single string
const step11Schema = z.object({
  duration: z.string().min(1, "Bitte wähle eine Option aus"),
});

// Step Component
const Step11_PTherapyDuration = ({ onNext, onBack, data, onDataChange }: TherapyDurationStepProps) => {
  // Initialize hook, wrapping the string `data` inside an object
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { duration: data || "" },
    schema: step11Schema,
    onNext,
  });

  const handleValueChange = (value: string) => {
    clearError("duration"); // Clear error on selection
    onDataChange(value);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Therapiedauer
        </h1>
        <p className="text-muted-foreground">
          Bevorzugst du Kurzzeit oder Langzeit Therapie?
        </p>
        {/* Error message in header */}
        {errors.duration && (
           <p className="text-sm text-destructive font-semibold mt-2">
             Bitte wähle eine Option aus.
           </p>
        )}
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper around the RadioGroup */}
        <div className={`p-1 rounded-xl ${errors.duration ? "border border-destructive/50 bg-destructive/5" : ""}`}>
          <RadioGroup value={data || ""} onValueChange={handleValueChange} className="space-y-3">
            {durationOptions.map((option) => {
              
              // Add a visual highlight if the option is selected
              const isSelected = data === option.id;
              
              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? "border-purple bg-purple/5" 
                      : errors.duration 
                        ? "border-destructive/50 hover:bg-destructive/10" 
                        : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={option.id} className="mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-foreground">{option.label}</span>
                    {option.description && (
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    )}
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};
export default Step11_PTherapyDuration;