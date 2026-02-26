import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
interface AdditionalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}
const Step16_PAdditionalInfo = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: AdditionalInfoStepProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Zusätzliche Information</h1>
        <p className="text-muted-foreground">
          Bitte teile uns alle weiteren wichtigen Informationen oder Anmerkungen mit.
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <p className="text-foreground/80 mb-4">
          Möchtest du uns noch etwas weiteres über deine bevorstehende Therapie oder besondere
          Anforderungen oder Präferenzen bezüglich deines/r Therapeut:in mitteilen? (Optional)
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
export default Step16_PAdditionalInfo;
