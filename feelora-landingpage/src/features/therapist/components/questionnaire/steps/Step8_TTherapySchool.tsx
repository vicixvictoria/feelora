import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface TherapySchoolStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

// List of therapy school options - add more if needed
const therapySchoolOptions = [
  "Humanistische Orientierung",
  "Verhaltenstherapeutische Orientierung",
  "Psychoanalytisch-Psychodynamische Orientierung",
  "Systemische Orientierung",
];

// Step Component
const Step8_TTherapySchool = ({ onNext, onBack, data, onDataChange }: TherapySchoolStepProps) => {
  const handleToggle = (school: string) => {
    if (data.selected.includes(school)) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== school) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, school] });
    }
  };

  // Handle toggle for "Other" option
  const handleOtherToggle = () => {
    if (data.selected.includes("Andere")) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== "Andere"), other: "" });
    } else {
      onDataChange({ ...data, selected: [...data.selected, "Andere"] });
    }
  };

  // Render Component
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Therapieschule
        </h1>
        <p className="text-muted-foreground mb-2">
          Bitte wähle den therapeutischen Ansatz, den du während der Therapie verfolgen wirst.
        </p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {therapySchoolOptions.map((school) => (
            <label
              key={school}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(school)}
                onCheckedChange={() => handleToggle(school)}
              />
              <span className="text-foreground">{school}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox
                checked={data.selected.includes("Andere")}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">Andere</span>
            </label>
            {data.selected.includes("Andere") && (
              <Input
                type="text"
                placeholder="Bitte angeben..."
                value={data.other}
                onChange={(e) => onDataChange({ ...data, other: e.target.value })}
                className="bg-background"
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step8_TTherapySchool;
