import { useMemo } from 'react';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { Loader2 } from 'lucide-react';

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
  isLoading?: boolean;
}

// Step Component
const Step17_Availability = ({ onNext, onBack, data, onDataChange, isLoading = false }: AvailabilityStepProps) => {
  const { t, i18n } = useTranslation(); // Brought in i18n to track language changes
  const safeData = data || [];

  // 1. Define validation schema inside component with useMemo
  const step17Schema = useMemo(() => {
    return z.object({
      selection: z.array(z.string()).min(1, t('q.common.selectAtLeastOne')),
    });
  }, [t, i18n.language]); // i18n.language forces Zod to update the error text on language switch

  // Initialize validation hook
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
    <div className="max-w-2xl mx-auto animate-fade-in relative">
     
      {/* --- LOADING OVERLAY --- */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl animate-in fade-in duration-200">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-foreground font-medium text-lg">
            {t('q.common.creatingProfile', 'Profil wird erstellt...')}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.availability.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.t.availability.subtitle')}</p>
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? t('q.common.selectAtLeastOne') : t('q.t.availability.multiSelect')}
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
                disabled={isLoading} // Prevent toggling while loading
                className={`w-16 h-16 rounded-xl text-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-purple-100 text-purple border-2 border-purple-600 shadow-md' // Brighter bg, purple border
                    : errors.selection
                      ? 'bg-muted/90 text-destructive border-2 border-destructive/30 hover:bg-destructive/10'
                      : 'bg-muted/90 text-muted-foreground border-2 border-transparent hover:bg-muted'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

     {/* Fade out buttons slightly and block clicks while loading */}
      <div className={isLoading ? 'pointer-events-none opacity-50' : ''}>
        <NavigationButtons onNext={validateAndNext} onBack={onBack} />
      </div>
    </div>
  );
};

export default Step17_Availability;
