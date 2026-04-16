import { useMemo } from 'react';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface AvailabilityStepProps {
  onNext: () => void;
  onBack: () => void;
  data: string[];
  onDataChange: (data: string[]) => void;
  isLoading?: boolean;
}

// Step Component
const Step15_PAvailability = ({ onNext, onBack, data, onDataChange, isLoading = false }: AvailabilityStepProps) => {
  const { t } = useTranslation();
  const safeData = data || [];

  // 1. Define validation schema INSIDE the component using useMemo
  const step15Schema = useMemo(() => {
    return z.object({
      selection: z
        .array(z.string())
        .min(1, t('q.p.availability.error', 'Bitte wähle mindestens einen Tag aus')),
    });
  }, [t]);

  // 2. Define the days inside the component to map translated labels to stable IDs
  const days = [
    { id: 'mo', label: t('q.t.availability.mon', 'Mo') },
    { id: 'di', label: t('q.t.availability.tue', 'Di') },
    { id: 'mi', label: t('q.t.availability.wed', 'Mi') },
    { id: 'do', label: t('q.t.availability.thu', 'Do') },
    { id: 'fr', label: t('q.t.availability.fri', 'Fr') },
    { id: 'sa', label: t('q.t.availability.sat', 'Sa') },
    { id: 'so', label: t('q.t.availability.sun', 'So') },
  ];

  // Initialize validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data: { selection: safeData },
    schema: step15Schema,
    onNext,
  });

  const handleToggle = (dayId: string) => {
    clearError('selection'); // Clear error on interaction

    if (safeData.includes(dayId)) {
      onDataChange(safeData.filter((d) => d !== dayId));
    } else {
      onDataChange([...safeData, dayId]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.availability.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.availability.subtitle')}</p>
        {/* Dynamic error message in header */}
        <p
          className={`text-sm ${errors.selection ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selection ? t('q.p.availability.error') : t('q.p.availability.hint')}
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
                disabled={isLoading}
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

      {/* Fade out buttons slightly and block clicks while loading */}
      <div className={isLoading ? 'pointer-events-none opacity-50' : ''}>
        <NavigationButtons onNext={validateAndNext} onBack={onBack} />
      </div>
    </div>
  );
};

export default Step15_PAvailability;
