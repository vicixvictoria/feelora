import { Checkbox } from "@/components/ui/checkbox";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface TherapySettingStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// List of therapy setting options - add more if needed
const settingOptions = [
  "Vor Ort",
  "Online (Video Call)",
  "Telefon / Anruf",
  "keine Präferenz",
];

// Step Component
const Step9_PTherapySetting = ({ onNext, onBack, data, onDataChange }: TherapySettingStepProps) => {
  const handleToggle = (setting: string) => {
    if (data.includes(setting)) {
      onDataChange(data.filter((s) => s !== setting));
    } else {
      onDataChange([...data, setting]);
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
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {settingOptions.map((setting) => (
            <label
              key={setting}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.includes(setting)}
                onCheckedChange={() => handleToggle(setting)}
              />
              <span className="text-foreground">{setting}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step9_PTherapySetting;
