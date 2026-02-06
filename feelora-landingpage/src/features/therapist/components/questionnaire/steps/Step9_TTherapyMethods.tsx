import { Textarea } from "@/components/ui/textarea";
import NavigationButtons from "@/components/questionnaire/NavigationButton";

// Props Interface
interface TherapyMethodsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}

const Step9_TTherapyMethods = ({ onNext, onBack, data, onDataChange }: TherapyMethodsStepProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Genaue Therapiemethode(n)
        </h1>
        <p className="text-muted-foreground">
          Bitte erzähle uns in ein paar Sätzen von deiner/n genauen
          Therapiemethoden die du anwenden möchtest
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <p className="text-foreground/80 mb-4">
          Versuche spezifischen Methoden zu erläutern, die zuvor nicht erwähnt wurden.
        </p>
        <Textarea
          placeholder="hier tippen..."
          value={data}
          onChange={(e) => onDataChange(e.target.value)}
          className="min-h-[120px] resize-y bg-background"
        />
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step9_TTherapyMethods;
