import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Send, X } from 'lucide-react';
import { Homework, HomeworkNoteAuthorType } from '../types/homework';

interface HomeworkNotesDialogProps {
  homework: Homework;
  currentUserType: HomeworkNoteAuthorType;
  onAddNote: (note: string) => Promise<void>;
  onClose: () => void;
}

const HomeworkNotesDialog = ({ homework, currentUserType, onAddNote, onClose }: HomeworkNotesDialogProps) => {
  const { t } = useTranslation();
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border chat-bubble-received">
          <h3 className="text-lg font-semibold text-foreground truncate">{homework.title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {homework.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('homework.notes.empty')}
            </p>
          ) : (
            homework.notes.map((note, index) => (
              <div
                key={index}
                className={`flex ${note.type === currentUserType ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    note.type === currentUserType
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary/10 text-foreground rounded-bl-sm'
                  }`}
                >
                  <p>{note.note}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
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
  );
};

export default HomeworkNotesDialog;
