import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";

interface ExperienceStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[]; // An array to match the interface
  onDataChange: (data: string[]) => void;
}

const experienceOptions = [
  {
    id: "weniger3months",
    label: "weniger als 3 Monate",
  },
  {
    id: "3-6months",
    label: "3-6 Monate",
  },
  {
    id: "6-12months",
    label: "6-12 Monate",
  },
  {
    id: "12+months",
    label: "Mehr als 1 Jahr",
  },
];

// Define validation schema expecting an object with a "selection" array
const step5Schema = z.object({
  selection: z.array(z.string()).min(1, "Required"),
});

const Step5_PTimeframe = ({ onNext, onBack, data, onDataChange }: ExperienceStepProps) => {
  // Take the first item of the array as the current value for the RadioGroup
  const currentValue = data[0] || "";

  // Initialize validation hook, wrapping the array `data` inside an object key called "selection"
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: data }, 
    schema: step5Schema,
    onNext,
  });

  const handleValueChange = (value: string) => {
    // Wrap the single string back into an array for your parent state
    clearError("selection"); // Clear error when user interacts
    onDataChange([value]);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Zeitraum</h1>
        <p className="text-muted-foreground">
          Seit wann bestehen die vorher genannten Probleme schon?
        </p>
      </div>

      <div className={`feelora-card transition-colors ${errors.selection ? "border-destructive/50 bg-destructive/5" : ""}`}>
        {/* value and onValueChange handle the state automatically */}
        <RadioGroup value={currentValue} onValueChange={handleValueChange} className="space-y-4">
          {experienceOptions.map((option) => (
            <label
              key={option.id}
              htmlFor={option.id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                currentValue === option.id 
                  ? "border-purple bg-purple/5" 
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <div className="flex flex-col">
                <span className="text-foreground font-medium">{option.label}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
        {/* Optional: text message if error */}
        {errors.selection && (
          <p className="text-sm text-destructive mt-4 text-center font-medium">
            Bitte wähle einen Zeitraum aus.
          </p>
        )}
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step5_PTimeframe;