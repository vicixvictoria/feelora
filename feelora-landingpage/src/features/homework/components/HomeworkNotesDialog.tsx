import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Loader2, Send, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { HomeworkNotes } from '../types/homework';

interface HomeworkNotesDialogProps {
  homeworkTitle: string;
  homeworkDescription: string;
  // null while loading, or once loaded if nobody has written a note yet
  // (getNotes returns null until the Notes record is created lazily).
  notes: HomeworkNotes | null;
  isLoading: boolean;
  onAddNote: (note: string) => Promise<void>;
  // Fires immediately on flip — Note and Share are independently optional on
  // the backend now, so sharing no longer has to ride along with a note.
  onShareChange: (share: boolean) => Promise<void>;
  onClose: () => void;
}

// Patient-only note thread (see types/homework.ts for why) — combines
// PatientNotes and TherapistNotes into one chronological feed, styled as
// stacked note cards rather than a chat thread (these are journal-style
// notes about a task, not a back-and-forth conversation), plus a share
// toggle that saves the moment it's flipped and a collapsible task
// description for context.
const HomeworkNotesDialog = ({
  homeworkTitle,
  homeworkDescription,
  notes,
  isLoading,
  onAddNote,
  onShareChange,
  onClose,
}: HomeworkNotesDialogProps) => {
  const { t } = useTranslation();
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // Defaults to unshared (matches the schema's own default for a fresh
  // Notes record) and syncs to the real value once `notes` finishes loading
  // — `notes` arrives asynchronously after this dialog mounts, so a plain
  // useState initializer would never see it.
  const [shareWithTherapist, setShareWithTherapist] = useState(false);
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  useEffect(() => {
    if (notes) setShareWithTherapist(notes.shareToTherapist);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes?.id]);

  const allNotes = [...(notes?.patientNotes ?? []), ...(notes?.therapistNotes ?? [])].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  const handleToggleShare = async (next: boolean) => {
    setShareWithTherapist(next); // optimistic
    setIsUpdatingShare(true);
    try {
      await onShareChange(next);
    } catch (err) {
      console.error('Error updating share setting:', err);
      setShareWithTherapist(!next); // revert on failure
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const handleSend = async () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await onAddNote(trimmed);
      setNoteText('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border chat-bubble-received">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground truncate">{homeworkTitle}</h3>
            <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Task description — folded by default so it doesn't push the
              notes feed down; the patient already saw it once from the task
              list, this is just here for context while writing a note. */}
          <button
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mt-1.5"
            onClick={() => setIsDescriptionExpanded((v) => !v)}
          >
            {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {t('homework.notes.taskDescription')}
          </button>
          {isDescriptionExpanded && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{homeworkDescription}</p>
          )}
        </div>

        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : allNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('homework.notes.empty')}
            </p>
          ) : (
            allNotes.map((note, index) => (
              // A note card, not a chat bubble — full-width, left-aligned
              // text, a small author tag instead of side-alignment. No tag
              // for the patient's own notes — they wrote it, no need to say
              // so; the therapist's own notes still get one for clarity
              // since they read otherwise-unattributed in the same list.
              <div key={index} className="rounded-xl border border-border bg-secondary/5 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  {note.type === 'THERAPIST' ? (
                    <span className="text-xs font-semibold text-primary">
                      {t('homework.notes.therapistAuthor')}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          {/* Per-homework sharing choice — saves immediately on flip. */}
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm text-foreground flex items-center gap-2">
              {t('homework.notes.shareWithTherapist')}
              {isUpdatingShare && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            </span>
            <Switch checked={shareWithTherapist} onCheckedChange={handleToggleShare} disabled={isUpdatingShare} />
          </label>

          <div className="flex gap-2">
            <textarea
              className="flex-1 border border-border rounded-xl p-2.5 text-sm text-foreground bg-background resize-none min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={t('homework.notes.placeholder')}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={isSaving}
            />
            <button
              className="feelora-btn-primary self-end px-3"
              onClick={handleSend}
              disabled={isSaving || !noteText.trim()}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkNotesDialog;
