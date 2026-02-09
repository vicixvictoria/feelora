import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface ValuesPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

// List of values/preferences options - add more if needed
const valueOptions = [
  "LGBTQ+ affirmative practice",
  "Culturally informed therapy",
  "Trauma-informed approach",
  "Working with high-performing individuals / executives",
  "Focus on self-development and identity formation",
  "Informal / Friendship base",
  "Evidence-based / scientific orientation",
  "Support for major life transitions (career, relocation, etc.)",
  "Openness to spiritual or existential topics",
  "Integrative or holistic approach",
  "Specialization in relationships / couples / family dynamics",
  "Experience addressing workplace conflicts or bullying",
  "Support for expats and international populations",
  "Feminist or gender-aware perspective",
  "Hypnosis",
  "Mind body connection (physiology)",
];

const Step14_PValuesPreferences = ({ onNext, onBack, data, onDataChange }: ValuesPreferencesStepProps) => {
  const handleToggle = (value: string) => {
    if (data.selected.includes(value)) {
      onDataChange({ ...data, selected: data.selected.filter((v) => v !== value) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, value] });
    }
  };

  const handleOtherToggle = () => {
    if (data.selected.includes("Other")) {
      onDataChange({ ...data, selected: data.selected.filter((v) => v !== "Other"), other: "" });
    } else {
      onDataChange({ ...data, selected: [...data.selected, "Other"] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Werte und Präferenzen
        </h1>
        <p className="text-muted-foreground mb-2">
          Welche Werte, Ansätze oder Therapeut:Innen-profile beschreiben deine
          bevorzugten Arbeit bzw. deine Werte am besten?
        </p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {valueOptions.map((value) => (
            <label
              key={value}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(value)}
                onCheckedChange={() => handleToggle(value)}
              />
              <span className="text-foreground">{value}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox
                checked={data.selected.includes("Other")}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">Other</span>
            </label>
            {data.selected.includes("Other") && (
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

export default Step14_PValuesPreferences;
