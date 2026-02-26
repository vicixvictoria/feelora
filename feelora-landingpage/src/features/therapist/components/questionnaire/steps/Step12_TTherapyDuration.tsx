import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
interface TherapyDurationStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}
// List of therapy duration options - add more if needed
const durationOptions = [
  { id: 'kurzzeit', label: 'Kurzzeit', description: '(ca. 10-20 Sitzungen)' },
  { id: 'langzeit', label: 'Langzeit', description: '(>20 Sitzungen)' },
  { id: 'unsicher', label: 'Ich weiß es nicht', description: '' },
  { id: 'keine-praeferenz', label: 'Keine Präferenz', description: '' },
];

// Step Component
const Step12_TTherapyDuration = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: TherapyDurationStepProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Therapiedauer</h1>
        <p className="text-muted-foreground">
          Bietest du eher Kurzzeit oder Langzeit Therapien an?
        </p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <RadioGroup value={data} onValueChange={onDataChange} className="space-y-3">
          {durationOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value={option.id} className="mt-0.5" />
              <div className="flex flex-col">
                <span className="text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step12_TTherapyDuration;
