import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/useStepValidation';

interface SpecialtiesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

const specialtyOptions = [
  'Depression',
  'Angst',
  'Stress',
  'Psychosomatik',
  'Trauma',
  'Sucht',
  'Sexuelle Identität',
  'Zwang',
  'Gewalterfahrungen',
  'Chronische Schmerzen',
  'Essverhalten',
];

// Define validation schema with conditional logic for "other"
const step6Schema = z
  .object({
    selected: z.array(z.string()).min(1, 'Bitte wähle mindestens ein Fachgebiet aus'),
    other: z.string().optional(),
  })
  .refine(
    (data) => {
      // If "Andere" is selected, the text input cannot be empty
      if (data.selected.includes('Andere')) {
        return data.other && data.other.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Bitte spezifizieren',
      path: ['other'],
    },
  );

const Step6_TSpecialties = ({ onNext, onBack, data, onDataChange }: SpecialtiesStepProps) => {
  // Initialize hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step6Schema,
    onNext,
  });

  const handleToggle = (specialty: string) => {
    clearError('selected'); // Clear main error when user interacts

    if (data.selected.includes(specialty)) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== specialty) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, specialty] });
    }
  };

  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other'); // Clear conditional error

    if (data.selected.includes('Andere')) {
      onDataChange({ ...data, selected: data.selected.filter((s) => s !== 'Andere'), other: '' });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Andere'] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Fachgebiete</h1>
        <p className="text-muted-foreground mb-2">
          Erzähle uns von deinen Fachgebieten in denen du auch Therapie anbieten wirst.
        </p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? 'Bitte wähle mindestens ein Fachgebiet aus.' : 'Mehrere auswählbar'}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper for the whole group */}
        <div
          className={`grid grid-cols-2 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {specialtyOptions.map((specialty) => (
            <label
              key={specialty}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(specialty)}
                onCheckedChange={() => handleToggle(specialty)}
              />
              <span className="text-foreground">{specialty}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="col-span-2 space-y-3">
            <label
              htmlFor="specialties-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="specialties-other"
                checked={data.selected.includes('Andere')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">Andere</span>
            </label>

            {/* Conditional Input with error styling */}
            {data.selected.includes('Andere') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder="Bitte angeben..."
                  value={data.other}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">Bitte gib Details an</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Use validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step6_TSpecialties;
