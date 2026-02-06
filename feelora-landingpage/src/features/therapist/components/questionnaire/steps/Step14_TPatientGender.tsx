import { Checkbox } from "@/components/ui/checkbox";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
interface PatientGenderStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// List of gender options - add more if needed
const genderOptions = [
  "männlich",
  "weiblich",
  "non-binary / divers",
  "keine Präferenz",
];

// Step Component
const Step14_TPatientGender = ({ onNext, onBack, data = [], onDataChange }: PatientGenderStepProps) => {
  const safeData = data || [];
  const handleToggle = (gender: string) => {
    if (safeData.includes(gender)) {
      onDataChange(safeData.filter((item) => item !== gender));
    } else {
      onDataChange([...safeData, gender]);
    }
  };
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Patient:Innen Geschlecht
        </h1>
        <p className="text-muted-foreground">
          Falls relevant, welches Geschlecht bevorzugst du bei deinen Patient:Innen?
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {genderOptions.map((gender) => (
            <label
              key={gender}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={safeData.includes(gender)}
                onCheckedChange={() => handleToggle(gender)}
              />
              <span className="text-foreground">{gender}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step14_TPatientGender;