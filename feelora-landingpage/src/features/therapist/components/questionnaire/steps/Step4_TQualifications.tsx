import { Upload, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
import { z } from "zod";
import { useStepValidation } from "@/hooks/useStepValidation";

interface QualificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Define Vaidation Schema
const step4Schema = z.object({
  titlePrefix: z.string().optional(),
  titleSuffix: z.string().optional(),
  titleFromPrefix: z.string().optional(),
  titleFromSuffix: z.string().optional(),
  
  // Mandatory fields
  licenseNumber: z.string().min(1, "Lizenznummer erforderlich"),
  idFileName: z.string().min(1, "Ausweis erforderlich"),
  
  // Optional field
  qualifications: z.string().optional(),
}).superRefine((data, ctx) => {
  // Custom Logic: At least one title must be filled out
  const hasPrefix = data.titlePrefix && data.titlePrefix.trim().length > 0;
  const hasSuffix = data.titleSuffix && data.titleSuffix.trim().length > 0;

  if (!hasPrefix && !hasSuffix) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Mindestens ein Titel erforderlich",
      path: ["titlePrefix"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Mindestens ein Titel erforderlich",
      path: ["titleSuffix"],
    });
  }
});

const Step4_TQualifications = ({ onNext, onBack, data, onDataChange }: QualificationsStepProps) => {
 // Initialize Validation Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step4Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    // If user types in either title, clear errors for BOTH titles since the condition is met
    if (field === "titlePrefix" || field === "titleSuffix") {
      clearError("titlePrefix");
      clearError("titleSuffix");
    } else {
      clearError(field);
    }
    
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Titel und Qualifikationen
        </h1>
        <p className="text-muted-foreground">
          Gib deine (professionellen) Titel an und wo du diese erworben hast, deine offizielle Lizenznummer,
          sowie weitere relevante Qualifikationen.
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">Titel und Qualifikationen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="titlePrefix" className={errors.titlePrefix ? "text-destructive" : "text-foreground"}>
              Titel vorgestellt {errors.titlePrefix && "*"}
            </Label>
            <Input
              id="titlePrefix"
              type="text"
              value={data.titlePrefix || ""}
              onChange={(e) => handleChange("titlePrefix", e.target.value)}
              className={`bg-background ${errors.titlePrefix ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.titlePrefix && (
               <p className="text-xs text-destructive">Bitte fülle mind. einen Titel aus</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleSuffix" className={errors.titleSuffix ? "text-destructive" : "text-foreground"}>
              Titel nachgestellt <span className={errors.titleSuffix ? "text-destructive" : "text-muted-foreground"}>(optional)</span>
            </Label>
            <Input
              id="titleSuffix"
              type="text"
              value={data.titleSuffix || ""}
              onChange={(e) => handleChange("titleSuffix", e.target.value)}
              className={`bg-background ${errors.titleSuffix ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleFromPrefix" className="text-foreground">
              von
            </Label>
            <Input
              id="titleFromPrefix"
              type="text"
              value={data.titleFromPrefix || ""}
              onChange={(e) => handleChange("titleFromPrefix", e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleFromSuffix" className="text-foreground">
              von
            </Label>
            <Input
              id="titleFromSuffix"
              type="text"
              value={data.titleFromSuffix || ""}
              onChange={(e) => handleChange("titleFromSuffix", e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          <Label htmlFor="licenseNumber" className={errors.licenseNumber ? "text-destructive" : "text-foreground"}>
            Lizenznummer {errors.licenseNumber && "*"}
          </Label>
          <Input
            id="licenseNumber"
            type="text"
            value={data.licenseNumber || ""}
            onChange={(e) => handleChange("licenseNumber", e.target.value)}
            placeholder="z.B. PSY-12345"
            className={`bg-background ${errors.licenseNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {errors.licenseNumber && (
            <p className="text-xs text-destructive">Lizenznummer ist erforderlich</p>
          )}
        </div>

        <div className="space-y-2 mb-6">
          <Label htmlFor="qualifications" className="text-foreground">
            Qualifikationen <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="qualifications"
            value={data.qualifications || ""}
            onChange={(e) => handleChange("qualifications", e.target.value)}
            className="bg-background min-h-[100px] resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idUpload" className={errors.idFileName ? "text-destructive font-medium" : "text-foreground"}>
            Ausweis hochladen {errors.idFileName && "*"} <br/>
            <span className="text-muted-foreground text-sm font-normal">
              (wird benötigt, um die Identität und Lizenznummer zu verifizieren)
            </span>
          </Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="idUpload"
              // Added dynamic error styling to the dropzone border
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-background ${
                errors.idFileName 
                  ? "border-destructive/50 hover:border-destructive bg-destructive/5" 
                  : "border-muted-foreground/30 hover:border-primary/50"
              }`}
            >
              {data.idFileName ? (
                <div className="flex flex-col items-center gap-1 text-foreground/80">
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-sm">{data.idFileName}</span>
                  <span className="text-xs text-muted-foreground">Klicke um zu ändern</span>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-1 ${errors.idFileName ? "text-destructive" : "text-muted-foreground"}`}>
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Bild auswählen</span>
                  <span className="text-xs">JPG, PNG oder PDF</span>
                </div>
              )}
              <input
                id="idUpload"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    clearError("idFileName"); // Clear error when file is uploaded
                    handleChange("idFileName", file.name); 
                  }
                }}
              />
            </label>
          </div>
          {errors.idFileName && (
            <p className="text-xs text-destructive">Bitte lade ein Dokument zur Verifizierung hoch</p>
          )}
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step4_TQualifications;
