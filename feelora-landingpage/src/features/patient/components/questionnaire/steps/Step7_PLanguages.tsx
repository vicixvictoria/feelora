import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface LanguagesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

const languageOptions = [
  "Deutsch",
  "Polnisch",
  "Englisch",
  "Arabisch",
  "Türkisch",
  "Italienisch",
  "Serbisch",
  "Koratisch",
  "Ungarisch",
  "Tschechisch",
  "Rumänisch",
];

const otherLanguages = [
  "Albanisch",
  "Spanisch",
  "Französisch",
  "Portugiesisch",
  "Russisch",
  "Chinesisch",
  "Japanisch",
  "Koreanisch",
  "Niederländisch",
  "Schwedisch",
  "Dänisch",
  "Norwegisch",
  "Finnisch",
  "Griechisch",
  "Hebräisch",
];

const Step7_PLanguages = ({ onNext, onBack, data, onDataChange }: LanguagesStepProps) => {
  const handleToggle = (language: string) => {
    if (data.selected.includes(language)) {
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== language) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, language] });
    }
  };

  const handleOtherToggle = () => {
    if (data.selected.includes("Andere")) {
      onDataChange({ ...data, selected: data.selected.filter((l) => l !== "Andere"), other: "" });
    } else {
      onDataChange({ ...data, selected: [...data.selected, "Andere"] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Sprachen
        </h1>
        <p className="text-muted-foreground mb-2">
          Bitte wähle aus in welchen Sprachen du Therapie anbietest. 
          Du kannst die Sprachen jederzeit ändern.
        </p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich.</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-2 gap-3">
          {languageOptions.map((language) => (
            <label
              key={language}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(language)}
                onCheckedChange={() => handleToggle(language)}
              />
              <span className="text-foreground">{language}</span>
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
              <Select
                value={data.other}
                onValueChange={(value) => onDataChange({ ...data, other: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sprache auswählen..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {otherLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step7_PLanguages;
