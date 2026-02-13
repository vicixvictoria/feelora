import NavigationButtons from "@/components/questionnaire/NavigationButton";
interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
  isLoading?: boolean;
}

// List of days of the week
const days = [
  { id: "mo", label: "Mo" },
  { id: "di", label: "Di" },
  { id: "mi", label: "Mi" },
  { id: "do", label: "Do" },
  { id: "fr", label: "Fr" },
  { id: "sa", label: "Sa" },
  { id: "so", label: "So" },
];

// Step Component
const Step15_PAvailability = ({ onNext, onBack, data, onDataChange }: AvailabilityStepProps) => {
  const safeData = data || [];
  const handleToggle = (dayId: string) => {
    if (safeData.includes(dayId)) {
      onDataChange(safeData.filter((d) => d !== dayId));
    } else {
      onDataChange([...safeData, dayId]);
    }
  };
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          Verfügbarkeit
        </h1>
        <p className="text-muted-foreground mb-2">
          Bitte teile uns mit, an welchen Tagen pro Woche du für Therapiesitzungen
          zur Verfügung stehen wirst. Du kannst deine Verfügbarkeit später immer anpassen.
        </p>
        <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
      </div>
      {/* Form Card */}
      <div className="feelora-card">
        <div className="flex flex-wrap justify-center gap-3">
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleToggle(day.id)}
              className={`w-16 h-16 rounded-xl text-lg font-medium transition-all duration-200 ${
                safeData.includes(day.id)
                  ? "bg-accent/90 text-purple border-2 border-accent/90"
                  : "bg-muted/90 text-muted-foreground border-2 border-transparent hover:bg-muted"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};
export default Step15_PAvailability;