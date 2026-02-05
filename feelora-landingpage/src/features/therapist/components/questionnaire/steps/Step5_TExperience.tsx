import { Checkbox } from "@/components/ui/checkbox";
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
    id: "supervision",
    label: "Unter Supervision",
    description: "Frisch/e Absolvent:Innen und Therapeut:Innen unter Supervision",
  },
  {
    id: "1-3years",
    label: "1-3 Jahre Erfahung",
    description: "Solo Therapeut:In",
  },
  {
    id: "3+years",
    label: "3+ Jahre",
    description: "",
  },
];

const Step5_TExperience = ({ onNext, onBack, data, onDataChange }: ExperienceStepProps) => {
  // Take the first item of the array as the current value for the RadioGroup
  const currentValue = data[0] || "";

  const handleValueChange = (value: string) => {
    // Wrap the single string back into an array for your parent state
    onDataChange([value]);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Erfahrung seit</h1>
        <p className="text-muted-foreground">
          Erzähle uns von deiner Erfahrung als Therapeut:In.
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
                {option.description && (
                  <span className="text-muted-foreground text-sm">{option.description}</span>
                )}
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step5_TExperience;