// Confirmation dialog for cancelling an appointment. The warning text is
// passed in by the caller so patients and therapists can show their own
// policy message (e.g. "consider your therapist's cancellation policy" vs
// "inform your patient before cancelling") from the same component.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface CancelAppointmentDialogProps {
  warningMessage: string;
  onConfirm: () => Promise<void>;
  // See AppointmentInfoDialog's `compact` prop — same idea, used together
  // in the therapist's weekly grid so both buttons fit inside a day cell.
  compact?: boolean;
}

const CancelAppointmentDialog = ({
  warningMessage,
  onConfirm,
  compact = false,
}: CancelAppointmentDialogProps) => {
  const { t } = useTranslation();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    try {
      await onConfirm();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {compact ? (
          <button className="w-full inline-flex items-center justify-center gap-1 text-[10px] font-medium text-destructive border border-destructive/30 rounded-md px-1 py-0.5 hover:bg-destructive/10 transition-colors">
            {t('calendar.cancel.button')}
            <X className="w-3 h-3" />
          </button>
        ) : (
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive border border-destructive/40 rounded-full px-3 py-1.5 hover:bg-destructive/10 transition-colors">
            {t('calendar.cancel.button')}
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('calendar.cancel.title')}</AlertDialogTitle>
          <AlertDialogDescription>{warningMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('calendar.cancel.keep')}</AlertDialogCancel>
          <button
            onClick={handleConfirm}
            disabled={isCancelling}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('calendar.cancel.confirm')}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelAppointmentDialog;
