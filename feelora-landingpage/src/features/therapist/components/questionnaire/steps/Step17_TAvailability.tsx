import { useMemo } from 'react';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
}

// Step Component
const Step17_Availability = ({ onNext, onBack, data, onDataChange }: AvailabilityStepProps) => {
  const { t, i18n } = useTranslation(); // Brought in i18n to track language changes
  const safeData = data || [];

  // 1. Define validation schema inside component with useMemo
  const step17Schema = useMemo(() => {
    return z.object({
      selection: z
        .array(z.string())
        .min(1, t('q.common.selectAtLeastOne')),
    });
  }, [t, i18n.language]); // i18n.language forces Zod to update the error text on language switch!

  // 2. Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step17Schema,
    onNext,
  });

  const days = [
    { id: 'mo', label: t('q.t.availability.mon') },
    { id: 'di', label: t('q.t.availability.tue') },
    { id: 'mi', label: t('q.t.availability.wed') },
    { id: 'do', label: t('q.t.availability.thu') },
    { id: 'fr', label: t('q.t.availability.fri') },
    { id: 'sa', label: t('q.t.availability.sat') },
    { id: 'so', label: t('q.t.availability.sun') },
  ];

  const handleToggle = (dayId: string) => {
    clearError('selection'); // Clear the error when the user clicks a day

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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.availability.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.availability.subtitle')}</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection 
            ? t('q.common.selectAtLeastOne') 
            : t('q.t.availability.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        {/* Visual error wrapper */}
        <div
          className={`flex flex-wrap justify-center gap-3 p-4 rounded-xl transition-colors ${errors.selection ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {days.map((day) => {
            const isSelected = safeData.includes(day.id);

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleToggle(day.id)}
                className={`w-16 h-16 rounded-xl text-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-accent/90 text-purple border-2 border-accent/90'
                    : errors.selection
                      ? 'bg-muted/90 text-destructive border-2 border-destructive/30 hover:bg-destructive/10' // Red styling for unselected buttons on error
                      : 'bg-muted/90 text-muted-foreground border-2 border-transparent hover:bg-muted'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swap onNext for validateAndNext */}
      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step17_Availability;