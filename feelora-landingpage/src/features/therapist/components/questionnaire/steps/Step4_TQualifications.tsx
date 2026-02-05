import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NavigationButtons from "@/components/questionnaire/NavigationButton";
interface QualificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}
const Step4_TQualifications = ({ onNext, onBack, data, onDataChange }: QualificationsStepProps) => {
  const handleChange = (field: string, value: string) => {
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
          Gib deine (professionellen) Titel an und wo du diese erworben hast,
          sowie weitere relevante Qualifikationen.
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">Titel und Qualifikationen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="titlePrefix" className="text-foreground">
              Titel vorgestellt
            </Label>
            <Input
              id="titlePrefix"
              type="text"
              value={data.titlePrefix || ""}
              onChange={(e) => handleChange("titlePrefix", e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleSuffix" className="text-foreground">
              Titel nachgestellt <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="titleSuffix"
              type="text"
              value={data.titleSuffix || ""}
              onChange={(e) => handleChange("titleSuffix", e.target.value)}
              className="bg-background"
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
        
        <div className="space-y-2">
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
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step4_TQualifications;