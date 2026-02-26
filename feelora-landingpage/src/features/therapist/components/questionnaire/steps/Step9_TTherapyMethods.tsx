import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';

// Props Interface
interface TherapyMethodsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string;
  onDataChange: (data: string) => void;
}

// 1. Define validationschema for a single text field
const step9Schema = z.object({
  methods: z.string().trim().min(1, 'Bitte beschreibe deine Methoden'),
});

const Step9_TTherapyMethods = ({ onNext, onBack, data, onDataChange }: TherapyMethodsStepProps) => {
  // Initialize validationhook, wrapping the string `data` inside an object
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { methods: data || '' },
    schema: step9Schema,
    onNext,
  });

  const handleChange = (value: string) => {
    clearError('methods'); //Clear error when typing
    onDataChange(value);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Genaue Therapiemethode(n)</h1>
        <p className="text-muted-foreground">
          Bitte erzähle uns in ein paar Sätzen von deiner/n genauen Therapiemethoden die du anwenden
          möchtest
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <p className="text-foreground/80 mb-4">
          Versuche spezifischen Methoden zu erläutern, die zuvor nicht erwähnt wurden.
        </p>

        {/* Validation styling on the Textarea */}
        <div className="space-y-2">
          <Textarea
            placeholder="hier tippen..."
            value={data || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`min-h-[120px] resize-y bg-background ${
              errors.methods ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          {errors.methods && (
            <p className="text-xs text-destructive font-medium">Bitte fülle dieses Feld aus</p>
          )}
        </div>
      </div>

      {/* Navigation with validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step9_TTherapyMethods;
