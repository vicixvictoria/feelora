import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface SpecialtiesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

const specialtyOptions = [
  "Depression",
  "Angst",
  "Stress",
  "Psychosomatik",
  "Trauma",
  "Sucht",
  "Sexuelle Identität",
  "Zwang",
  "Gewalterfahrungen",
  "Chronische Schmerzen",
  "Essverhalten",
];

const Step4_PMentalHealth = ({ onNext, onBack, data, onDataChange }: SpecialtiesStepProps) => {
  const handleToggle = (specialty: string) => {
    if (data.selected.includes(specialty)) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== specialty) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, specialty] });
    }
  };

  const handleOtherToggle = () => {
    if (data.selected.includes("Andere")) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== "Andere"), other: "" });
    } else {
      onDataChange({ ...data, selected: [...data.selected, "Andere"] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Mentale Gesundheit
        </h1>
        <p className="text-muted-foreground mb-2">
          Was sind die Hauptprobleme, für die du Hilfe suchst?
        </p>
        <p className="text-sm text-muted-foreground">Mehrere auswählbar</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-2 gap-3">
          {specialtyOptions.map((specialty) => (
            <label
              key={specialty}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(specialty)}
                onCheckedChange={() => handleToggle(specialty)}
              />
              <span className="text-foreground">{specialty}</span>
            </label>
          ))}
          
          {/* Other option */}
          <div className="col-span-2 space-y-3">
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

export default Step4_PMentalHealth;
