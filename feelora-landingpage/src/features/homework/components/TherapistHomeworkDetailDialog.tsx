import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { Homework, HomeworkNotes } from '../types/homework';

interface TherapistHomeworkDetailDialogProps {
  homework: Homework;
  patientName: string;
  // null while loading, or once loaded if the patient has never written a
  // note (getNotes returns null until the Notes record is created lazily).
  notes: HomeworkNotes | null;
  isLoadingNotes: boolean;
  onClose: () => void;
  onUpdate: (updates: { title?: string; description?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

const TherapistHomeworkDetailDialog = ({
  homework,
  patientName,
  notes,
  isLoadingNotes,
  onClose,
  onUpdate,
  onDelete,
}: TherapistHomeworkDetailDialogProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(homework.title);
  const [description, setDescription] = useState(homework.description);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await onUpdate({ title, description });
      setIsEditing(false);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  // Read-only by product decision — the therapist never writes notes (see
  // types/homework.ts), and only sees the patient's notes at all once the
  // patient has opted to share them via the toggle in their own dialog.
  const patientNotesShared = notes?.shareToTherapist ?? false;
  const visibleNotes = [
    ...(patientNotesShared ? (notes?.patientNotes ?? []) : []),
    ...(notes?.therapistNotes ?? []),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border chat-bubble-received">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{patientName}</h3>
            {/* Plain-text status label — the colored pill version lives in
                STATUS_META on TherapistHomeworkPage.tsx (the list row this
                dialog opens from); duplicated here as text only since this
                header has no room for a badge. NEW and IN_PROGRESS both read
                as "in Bearbeitung" — see the comment on STATUS_META for why. */}
            <p className="text-xs text-muted-foreground">
              {homework.status === 'COMPLETED'
                ? t('app.therapist.homework.completed')
                : t('app.therapist.homework.inProgress')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Title / Description */}
          {isEditing ? (
            <div className="space-y-3">
              <input
                className="w-full border border-border rounded-xl p-2.5 text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('app.therapist.homework.titlePlaceholder')}
              />
              <textarea
                className="w-full border border-border rounded-xl p-2.5 text-sm text-foreground bg-background resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('app.therapist.homework.taskPlaceholder')}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="feelora-btn-outline text-sm"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(homework.title);
                    setDescription(homework.description);
                  }}
                  disabled={isSavingEdit}
                >
                  {t('app.therapist.homework.cancel')}
                </button>
                <button
                  className="feelora-btn-primary text-sm"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !title.trim() || !description.trim()}
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground mb-1">{homework.title}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{homework.description}</p>
              </div>
              <button
                className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Notes — read-only. The composer that used to live here was
              removed: only the patient can write notes now, and only shares
              them with the therapist when they choose to (ShareToTherapist). */}
          <div className="pt-3 border-t border-border space-y-3">
            <p className="text-sm font-semibold text-foreground">{t('homework.notes.title')}</p>
            {isLoadingNotes ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : !patientNotesShared ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground text-center justify-center py-4">
                <Lock className="w-4 h-4 shrink-0" />
                {t('homework.notes.notShared')}
              </div>
            ) : visibleNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('homework.notes.empty')}</p>
            ) : (
              // A note card, not a chat bubble — matches HomeworkNotesDialog
              // (the patient's own view of the same notes).
              visibleNotes.map((note, index) => (
                <div key={index} className="rounded-xl border border-border bg-secondary/5 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary">
                      {note.type === 'THERAPIST' ? t('homework.notes.you') : t('homework.notes.patientAuthor')}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete */}
        <div className="p-4 border-t border-border">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{t('app.therapist.homework.deleteConfirm')}</p>
              <div className="flex gap-2 shrink-0">
                <button className="feelora-btn-outline text-sm" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
                  {t('app.therapist.homework.cancel')}
                </button>
                <button
                  className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 rounded-full transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-sm text-destructive hover:underline flex items-center gap-1.5"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('app.therapist.homework.deleteTask')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistHomeworkDetailDialog;
