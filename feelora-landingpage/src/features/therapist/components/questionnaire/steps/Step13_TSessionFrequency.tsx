import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';

// Props Interface
interface SessionFrequencyStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// List of session frequency options - add more if needed
const frequencyOptions = [
  { id: 'flexibel', label: 'Flexibel', description: 'Ganz nach Patient:Innen Wunsch' },
  { id: 'woechentlich', label: 'Wöchentlich', description: 'Wöchentlich wiederholende Termine' },
  {
    id: 'zweiwoechentlich',
    label: 'Zweiwöchentlich',
    description: 'Termine wiederholen alle zwei Wochen',
  },
  { id: 'keine-praeferenz', label: 'Keine Präferenz', description: '' },
];

// Step Component
const Step13_TSessionFrequency = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: SessionFrequencyStepProps) => {
  const safeData = data || [];
  const handleToggle = (id: string) => {
    if (safeData.includes(id)) {
      onDataChange(safeData.filter((item) => item !== id));
    } else {
      onDataChange([...safeData, id]);
    }
  };
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Sitzungsfrequenz</h1>
        <p className="text-muted-foreground mb-2">
          Erzähle uns von deiner bevorzugten Sitzungsfrequenz.
        </p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {frequencyOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={safeData.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                className="mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step13_TSessionFrequency;
