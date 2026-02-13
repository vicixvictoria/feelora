import { Input } from "@/components/ui/questionnaire/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface PersonalDataStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

const genderOptions = [
  { value: "male", label: "Männlich" },
  { value: "female", label: "Weiblich" },
  { value: "diverse", label: "Divers" },
];

const fieldLabels: Record<string, string> = {
  firstName: "Vorname",
  lastName: "Nachname",
  bday: "Geburtstag",
  gender: "Geschlecht",
};

const Step2_PersonalData = ({ onNext, onBack, data, onDataChange }: PersonalDataStepProps) => {
  const handleChange = (field: string, value: string) => {
    
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Persönliche Daten
        </h1>
        <p className="text-muted-foreground">
          Bitte teile uns deine persönlichen Daten für dein Profil mit.
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">Deine Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-foreground">
                {fieldLabels[field]}
              </Label>
                {field === "gender" ? (
                <Select
                  value={data[field] || ""}
                  onValueChange={(value) => handleChange(field, value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
              <Input
                id={field}
                type={field === "bday" ? "date" : "text"}
                value={data[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="bg-background"
               />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step2_PersonalData;
