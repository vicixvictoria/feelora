import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";

interface ContactInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

const fieldLabels: Record<string, string> = {
  phone: "Handy/Mobil",
  email: "E-Mail",
  city: "Stadt*",
  address: "Adresse",
  postalCode: "Postleitzahl",
  country: "Land*",
};

// Validation Schema 
const step3Schema = z.object({
  city: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  
  // Phone, adress and postalcode is completely optional
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  // Email is optional, BUT if filled, must be valid
  // z.literal("") allows an empty string to pass validation
  email: z.union([
  z.literal(""), 
  z.string().email("Ungültiges E-Mail-Format")
]).optional(), // .optional() so that the email can be empty
});

const Step3_PContactInfo = ({ onNext, onBack, data, onDataChange }: ContactInfoStepProps) => {

  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step3Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    clearError(field);
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
          Gib deine Kontaktdaten an, damit deine Patient:Innen dich erreichen können. Wenn du noch eine weitere E-Mail, neben der email mit der du dich angemeldet hast, oder deine Telefonnummer 
          angeben möchtest gib sie hier ein (optional). Wir können diese Daten nicht validieren oder auf Richtigkeit prüfen!
          Füge butte auch die Adresse deiner Praxis hinzu falls du eine hast. Wenn du nur online Therapis anbietest, gib bitte die Stadt und das Land an, in der du dich befindest.
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">Kontaktinformationen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => (
            <div key={field} className="space-y-2">
              <Label 
                htmlFor={field} 
                className={errors[field] ? "text-destructive" : "text-foreground"}
              >
                {/* Add asterisk only for non-optional fields */}
                {fieldLabels[field]} {(field !== 'phone' && field !== 'email' && field !== 'address' && field !== 'postalCode') && errors[field] && "*"}
              </Label>
              <Input
                id={field}
                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                value={data[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className={`bg-background ${errors[field] ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {/* Only show error message for invalid Email format */}
              {errors[field] && field === 'email' && (
                <p className="text-[0.8rem] text-destructive">Ungültiges E-Mail-Format</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step3_PContactInfo;