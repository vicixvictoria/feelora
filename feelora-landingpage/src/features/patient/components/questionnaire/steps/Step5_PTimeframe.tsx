import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface ExperienceStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[]; // Still an array to match your interface
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

const Step5_PTimeframe = ({ onNext, onBack, data, onDataChange }: ExperienceStepProps) => {
  // Take the first item of the array as the current value for the RadioGroup
  const currentValue = data[0] || "";

  const handleValueChange = (value: string) => {
    // Wrap the single string back into an array for your parent state
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

      <div className="feelora-card">
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
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step5_PTimeframe;