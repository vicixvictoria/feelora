// Shows (or, for therapists, edits) the "how to join/find this appointment"
// detail — a meeting link, a phone number, or an address, depending on
// appointment.type. This replaces a "start call" button since there's no
// video integration yet: the therapist provides a link/number/address here
// and the patient just opens it.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Info, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Appointment } from '../types/appointment';

interface AppointmentInfoDialogProps {
  appointment: Appointment;
  // Therapist views pass editable=true to let them fill in/change the link
  // or address. Patient views omit it and just see a read-only value.
  editable?: boolean;
  // Renders a smaller, full-width trigger button for tight spaces like the
  // therapist's weekly grid cells, instead of the normal pill button.
  compact?: boolean;
  onSave?: (details: { meetingLink?: string; location?: string }) => Promise<void>;
}

const AppointmentInfoDialog = ({
  appointment,
  editable = false,
  compact = false,
  onSave,
}: AppointmentInfoDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState(appointment.meetingLink ?? '');
  const [location, setLocation] = useState(appointment.location ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const fieldLabel =
    appointment.type === 'online'
      ? t('calendar.info.meetingLinkLabel')
      : appointment.type === 'phone'
        ? t('calendar.info.phoneNumberLabel')
        : t('calendar.info.locationLabel');

  const value = appointment.type === 'online' ? meetingLink : location;
  const setValue = appointment.type === 'online' ? setMeetingLink : setLocation;

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(
        appointment.type === 'online' ? { meetingLink } : { location },
      );
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <button className="w-full inline-flex items-center justify-center gap-1 text-[10px] font-medium text-primary border border-primary/30 rounded-md px-1 py-0.5 hover:bg-primary/10 transition-colors">
            {t('calendar.info.button')}
            <Info className="w-3 h-3" />
          </button>
        ) : (
          <button className="feelora-btn-outline text-sm">
            {t('calendar.info.button')}
            <Info className="w-4 h-4" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment.patientName || appointment.therapistName}</DialogTitle>
          <DialogDescription>
            {appointment.date} · {appointment.startTime}–{appointment.endTime}
          </DialogDescription>
        </DialogHeader>

        {editable ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{fieldLabel}</label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={fieldLabel}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{fieldLabel}</p>
            {value ? (
              appointment.type === 'online' ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline break-all"
                >
                  {value}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <p className="text-foreground">{value}</p>
              )
            ) : (
              <p className="text-muted-foreground">{t('calendar.info.noneProvided')}</p>
            )}
          </div>
        )}

        {editable && (
          <DialogFooter>
            <button onClick={handleSave} disabled={isSaving} className="feelora-btn-primary">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('calendar.info.save')}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentInfoDialog;
