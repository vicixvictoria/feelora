import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FileText, Loader2, RefreshCw } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { homeworkService } from '@/features/homework/api/homework-service';
import { Homework } from '@/features/homework/types/homework';
import HomeworkNotesDialog from '@/features/homework/components/HomeworkNotesDialog';

// Patient's homework tab: lists the patient's own homeworks (fetched via
// getOwnHomeworks, auth-scoped to the current user — no PatientId needed)
// split into "new" (IN_PROGRESS) and "completed" sections, with a notes
// thread per task shared with the assigning therapist.
const HomeworkPage = () => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(true);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesHomeworkId, setNotesHomeworkId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeworks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await homeworkService.getOwnHomeworks();
        setHomeworks(items);
      } catch (err) {
        console.error('Error fetching homeworks:', err);
        setError(t('patient.homework.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared by both the "Done" button (new tasks) and "Repeat" button
  // (completed tasks) — the schema only has a Status field to flip, there's
  // no separate "repeat" operation, so both buttons just toggle it.
  const handleToggleStatus = async (homework: Homework) => {
    setUpdatingId(homework.id);
    try {
      const updated = await homeworkService.updateOwnHomework(homework.id, {
        status: homework.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED',
      });
      setHomeworks((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    } catch (err) {
      console.error('Error updating homework status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async (homeworkId: string, note: string) => {
    const updated = await homeworkService.updateOwnHomework(homeworkId, { note });
    setHomeworks((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const newTasks = homeworks.filter((h) => h.status === 'IN_PROGRESS');
  const completedTasks = homeworks.filter((h) => h.status === 'COMPLETED');
  const notesHomework = homeworks.find((h) => h.id === notesHomeworkId) ?? null;

  return (
    <div className="max-w-4xl animate-fade-in relative">
      {/* Coming Soon Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm rounded-2xl">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-[25vh] px-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {t('patient.homework.comingSoon')}
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {t('patient.homework.comingSoonTitle')}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                {t('patient.homework.comingSoonDesc')}
              </p>
              <button
                onClick={() => setShowOverlay(false)}
                className="mt-2 feelora-btn-outline"
              >
                {t('patient.homework.revealPreview')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="feelora-card text-center py-8 text-muted-foreground">{error}</div>
      ) : (
        <>
          {/* New Tasks */}
          <h1 className="text-2xl font-bold text-purple mb-6">{t('patient.homework.newTasks')}</h1>
          {newTasks.length === 0 ? (
            <div className="feelora-card text-center py-8 text-muted-foreground mb-10">
              {t('patient.homework.noNewTasks')}
            </div>
          ) : (
            <div className="space-y-4 mb-10">
              {newTasks.map((task) => (
                <div
                  key={task.id}
                  className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={avatar}
                      alt="Therapist"
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 bg-secondary/10 rounded-2xl rounded-bl-sm px-4 py-3">
                      <p className="font-semibold text-foreground mb-1">{task.title}</p>
                      <p className="text-foreground">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      className="feelora-btn-outline"
                      onClick={() => setNotesHomeworkId(task.id)}
                    >
                      {t('patient.homework.notes')}
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      className="feelora-btn-primary"
                      onClick={() => handleToggleStatus(task)}
                      disabled={updatingId === task.id}
                    >
                      {updatingId === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {t('patient.homework.done')}
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          <h2 className="text-2xl font-bold text-purple mb-6">
            {t('patient.homework.completedTasks')}
          </h2>
          {completedTasks.length === 0 ? (
            <div className="feelora-card text-center py-8 text-muted-foreground">
              {t('patient.homework.noCompletedTasks')}
            </div>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <div key={task.id} className="feelora-card flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{task.title}</p>
                    <p className="text-foreground">{task.description}</p>
                  </div>
                  <button
                    className="feelora-btn-outline"
                    onClick={() => setNotesHomeworkId(task.id)}
                  >
                    {t('patient.homework.notes')}
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    className="feelora-btn-primary"
                    onClick={() => handleToggleStatus(task)}
                    disabled={updatingId === task.id}
                  >
                    {updatingId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {t('patient.homework.repeat')}
                        <RefreshCw className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* currentUserType is hardcoded here since this page is patient-only —
          it just decides which side a note bubble renders on (own notes vs
          the therapist's), the actual author is set server-side from the
          auth token regardless of what's passed to onAddNote. */}
      {notesHomework && (
        <HomeworkNotesDialog
          homework={notesHomework}
          currentUserType="PATIENT"
          onAddNote={(note) => handleAddNote(notesHomework.id, note)}
          onClose={() => setNotesHomeworkId(null)}
        />
      )}
    </div>
  );
};

export default HomeworkPage;
