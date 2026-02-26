import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from '@/components/questionnaire/NavigationButton';

interface TherapyFormatStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}
// List of therapy format options - add more if needed
const formatOptions = [
  { id: 'einzel', label: 'Einzel', description: 'One-on-one Sessions' },
  { id: 'paar', label: 'Paar', description: 'Paartherapie' },
  { id: 'gruppe', label: 'Gruppe', description: 'Gruppentherapie Sessions' },
  { id: 'familien', label: 'Familien', description: 'Therapie mit Familien' },
  { id: 'keine-praeferenz', label: 'Keine Präferenz', description: '' },
];

// Step Component
const Step11_TTherapyFormat = ({
  onNext,
  onBack,
  data = [],
  onDataChange,
}: TherapyFormatStepProps) => {
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
        <h1 className="text-3xl font-bold text-purple mb-2">Bevorzugtes Therapie Setting Format</h1>
        <p className="text-muted-foreground mb-2">Welche Therapieformate bietest du an?</p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {formatOptions.map((option) => (
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

export default Step11_TTherapyFormat;
