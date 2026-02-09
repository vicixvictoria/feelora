import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

interface ContactInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

const fieldLabels: Record<string, string> = {
  phone: "Handy/Mobil",
  email: "E-Mail",
  city: "Stadt",
  address: "Adresse",
  postalCode: "Postleitzahl",
  country: "Land",
};

const Step3_PContactInfo = ({ onNext, onBack, data, onDataChange }: ContactInfoStepProps) => {
  const handleChange = (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Kontaktinformationen
        </h1>
        <p className="text-muted-foreground mb-2">
          Gib deine Kontaktdaten an, damit deine Patient:Innen dich erreichen können.
          Füge auch die Adresse deiner Praxis hinzu.
        </p>
        <p className="text-muted-foreground mb-2">
          Diese Informationen werden öffentlich in deinem Profil angezeigt.
        </p>
        <p className="text-muted-foreground text-sm">
          Du kannst diese Angaben jederzeit ändern.
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">Kontaktinformationen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-foreground">
                {fieldLabels[field]}
              </Label>
              <Input
                id={field}
                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                value={data[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="bg-background"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step3_PContactInfo;
