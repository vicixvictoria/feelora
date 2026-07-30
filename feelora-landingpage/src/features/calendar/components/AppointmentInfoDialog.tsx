// Shows (or, for therapists, edits) the "how to join/find this session"
// detail — the backend only has a single free-text `address` field for
// this (no separate meeting-link/phone/location fields, no session
// "type"), so a URL is detected and rendered as a link while anything else
// is shown as plain text (phone number or physical address).
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
import { Session } from '../types/session';

const isUrl = (value: string): boolean => /^https?:\/\//i.test(value.trim());

interface AppointmentInfoDialogProps {
  session: Session;
  // The name of the other party in this session (the therapist for a
  // patient view, the patient for a therapist view) — the backend only
  // returns emails on Session, so callers resolve a display name themselves
  // from profile data they already have and pass it in.
  counterpartName: string;
  // Therapist views pass editable=true to let them fill in/change the
  // address. Patient views omit it and just see a read-only value.
  editable?: boolean;
  // Renders a smaller, full-width trigger button for tight spaces like the
  // therapist's weekly grid cells, instead of the normal pill button.
  compact?: boolean;
  onSave?: (address: string) => Promise<void>;
}

const AppointmentInfoDialog = ({
  session,
  counterpartName,
  editable = false,
  compact = false,
  onSave,
}: AppointmentInfoDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(session.address ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(address);
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
          <DialogTitle>{counterpartName}</DialogTitle>
          <DialogDescription>
            {session.date} · {session.startTime}–{session.endTime}
          </DialogDescription>
        </DialogHeader>

        {editable ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('calendar.info.addressLabel')}</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('calendar.info.addressLabel')}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t('calendar.info.addressLabel')}</p>
            {address ? (
              isUrl(address) ? (
                <a
                  href={address}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline break-all"
                >
                  {address}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <p className="text-foreground">{address}</p>
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
