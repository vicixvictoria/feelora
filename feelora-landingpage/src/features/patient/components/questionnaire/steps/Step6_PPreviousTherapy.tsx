import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
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
const Step6_PPreviousTherapy = ({ onNext, onBack, data, onDataChange }: PreviousTherapyStepProps) => {
  const safeData = data || { selected: [], other: "", neverHadTherapy: false };
  const handleToggle = (option: string) => {
    if (safeData.neverHadTherapy) return;
    if (safeData.selected.includes(option)) {
      onDataChange({ ...safeData, selected: safeData.selected.filter((s) => s !== option) });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, option] });
    }
  };
  const handleOtherToggle = () => {
    if (safeData.neverHadTherapy) return;
    if (safeData.selected.includes("Andere")) {
      onDataChange({ ...safeData, selected: safeData.selected.filter((s) => s !== "Andere"), other: "" });
    } else {
      onDataChange({ ...safeData, selected: [...safeData.selected, "Andere"] });
    }
  };
  const handleNeverTherapy = () => {
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
        <p className="text-sm text-muted-foreground italic">Mehrfachauswahl möglich</p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {therapyOptions.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                safeData.neverHadTherapy ? "opacity-50 pointer-events-none" : ""
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
                safeData.neverHadTherapy ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <Checkbox
                checked={safeData.selected.includes("Andere")}
                onCheckedChange={handleOtherToggle}
                disabled={safeData.neverHadTherapy}
              />
              <span className="text-foreground">Andere</span>
            </label>
            {safeData.selected.includes("Andere") && !safeData.neverHadTherapy && (
              <Textarea
                placeholder="hier tippen..."
                value={safeData.other}
                onChange={(e) => onDataChange({ ...safeData, other: e.target.value })}
                className="bg-background"
              />
            )}
          </div>
          {/* Never had therapy option */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors mt-2">
            <Checkbox
              checked={safeData.neverHadTherapy}
              onCheckedChange={handleNeverTherapy} // This will toggle between having therapy experience and never having had therapy
             />
            <span className="text-foreground font-medium">Ich hatte noch nie Therapie</span>
          </label>
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step6_PPreviousTherapy;