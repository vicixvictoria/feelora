import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, Clock, Loader2, Search, Send, X } from 'lucide-react';
import placeholderAvatar from '@/assets/avatar-Placeholder.png';
import { therapistService } from '../api/therapist-service';
import { homeworkService } from '@/features/homework/api/homework-service';
import { Homework } from '@/features/homework/types/homework';
import TherapistHomeworkDetailDialog from '@/features/homework/components/TherapistHomeworkDetailDialog';
import { useS3Download } from '@/hooks/use-s3-download';

// Therapist's homework tab: lets the therapist assign new homework to a
// matched patient and see the status of everything they've assigned so far.
// The schema has no "all homeworks for all my patients" query, only
// getPatientHomeworks(PatientId) — so the Task Status section is built by
// fetching each matched patient's homeworks separately and merging them
// client-side (see the load() effect below).

interface MatchedPatient {
  Id: string;
  Name?: string | null;
  Surname?: string | null;
}

const patientLabel = (patient: MatchedPatient) =>
  [patient.Name, patient.Surname].filter(Boolean).join(' ') || patient.Id;

// Local copy of the S3Avatar pattern from TherapistPatientsPage.tsx (no
// shared component for it yet) — resolves a patient's uploaded profile
// picture from S3, falling back to the placeholder while it loads or if
// the patient has none.
const S3Avatar = ({
  userId,
  className,
  alt = '',
}: {
  userId?: string;
  className: string;
  alt?: string;
}) => {
  const { download, imageUrl } = useS3Download();

  useEffect(() => {
    if (userId) download('profile', 'public', userId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || placeholderAvatar} alt={alt} className={className} />;
};

const TherapistHomeworkPage = () => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(true);

  const [patients, setPatients] = useState<MatchedPatient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoadingHomeworks, setIsLoadingHomeworks] = useState(true);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [detailHomeworkId, setDetailHomeworkId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoadingPatients(true);
      try {
        // Matched patient IDs live on the therapist's own profile, then
        // resolve those IDs to display data (name, etc.) in one batched call.
        const profile = await therapistService.getProfile();
        const ids: string[] = profile.Matches || [];
        const fetched = ids.length > 0 ? await therapistService.getMatchedPatients(ids) : [];
        setPatients(fetched);

        setIsLoadingHomeworks(true);
        // One getPatientHomeworks call per patient (no bulk endpoint exists),
        // then flatten + sort newest-first for the combined Task Status list.
        const perPatient = await Promise.all(
          fetched.map((patient: MatchedPatient) => homeworkService.getPatientHomeworks(patient.Id)),
        );
        const all = perPatient.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setHomeworks(all);
      } catch (err) {
        console.error('Error loading homework page data:', err);
      } finally {
        setIsLoadingPatients(false);
        setIsLoadingHomeworks(false);
      }
    };
    load();
  }, []);

  const patientName = (patientId: string) => {
    const patient = patients.find((p) => p.Id === patientId);
    return patient ? patientLabel(patient) : patientId;
  };

  const handleAssign = (id: string) => {
    setSelectedPatientId(id);
    setTitle('');
    setDescription('');
  };

  const handleCancel = () => {
    setSelectedPatientId(null);
    setTitle('');
    setDescription('');
  };

  const handleSend = async () => {
    if (!selectedPatientId || !title.trim() || !description.trim()) return;
    setIsSending(true);
    try {
      // TherapistId isn't sent — the resolver infers it from the auth token,
      // only the target patient needs to be explicit here.
      const created = await homeworkService.assignHomework({
        patientId: selectedPatientId,
        title: title.trim(),
        description: description.trim(),
      });
      setHomeworks((prev) => [created, ...prev]);
      setSelectedPatientId(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error assigning homework:', err);
    } finally {
      setIsSending(false);
    }
  };

  const detailHomework = homeworks.find((h) => h.id === detailHomeworkId) ?? null;

  const handleUpdateDetail = async (updates: { title?: string; description?: string }) => {
    if (!detailHomework) return;
    const updated = await homeworkService.updateHomework(detailHomework.id, updates);
    setHomeworks((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleAddNoteDetail = async (note: string) => {
    if (!detailHomework) return;
    const updated = await homeworkService.updateHomework(detailHomework.id, { note });
    setHomeworks((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleDeleteDetail = async () => {
    if (!detailHomework) return;
    await homeworkService.deleteHomework(detailHomework.id);
    setHomeworks((prev) => prev.filter((h) => h.id !== detailHomework.id));
    setDetailHomeworkId(null);
  };

  const selectedPatient = patients.find((p) => p.Id === selectedPatientId) ?? null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      {/* Coming Soon Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm rounded-2xl">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-[25vh] px-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {t('app.therapist.homework.comingSoon')}
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {t('app.therapist.homework.comingSoonTitle')}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                {t('app.therapist.homework.comingSoonDesc')}
              </p>
              <button
                onClick={() => setShowOverlay(false)}
                className="mt-2 feelora-btn-outline"
              >
                {t('app.therapist.homework.revealPreview')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Tasks Section */}
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.homework.createTasks')}
      </h1>

      <div className="mb-12">
        {isLoadingPatients ? (
          <div className="feelora-card flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : patients.length === 0 ? (
          <div className="feelora-card text-center py-8 text-muted-foreground">
            {t('app.therapist.patients.noPatients')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patients.map((patient) => (
              <div key={patient.Id} className="feelora-card flex items-center gap-4">
                <S3Avatar
                  userId={patient.Id}
                  alt={patientLabel(patient)}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <p className="font-semibold text-foreground flex-1">{patientLabel(patient)}</p>
                <button className="feelora-btn-primary" onClick={() => handleAssign(patient.Id)}>
                  {t('app.therapist.homework.assignTask')}
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Assignment Pop-up — a centered modal (rather than the inline
          side panel this started as) so it doesn't shift the patient grid
          around when opened */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border chat-bubble-received">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {t('app.therapist.homework.composeTask', {
                  name: patientLabel(selectedPatient),
                })}
              </h3>
              <button
                onClick={handleCancel}
                disabled={isSending}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <input
                className="w-full border border-border rounded-xl p-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t('app.therapist.homework.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full border border-border rounded-xl p-3 text-sm text-foreground bg-background resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t('app.therapist.homework.taskPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button className="feelora-btn-outline" onClick={handleCancel} disabled={isSending}>
                  {t('app.therapist.homework.cancel')}
                  <X className="w-4 h-4" />
                </button>
                <button
                  className="feelora-btn-primary"
                  onClick={handleSend}
                  disabled={isSending || !title.trim() || !description.trim()}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {t('app.therapist.homework.send')}
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Status Section */}
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.homework.taskStatus')}
      </h2>
      {isLoadingHomeworks ? (
        <div className="feelora-card flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : homeworks.length === 0 ? (
        <div className="feelora-card text-center py-8 text-muted-foreground">
          {t('app.therapist.homework.noTasks')}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {homeworks.map((task) => (
            <div key={task.id} className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <S3Avatar
                  userId={task.patientId}
                  alt={patientName(task.patientId)}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <p className="font-semibold text-foreground min-w-[140px]">{patientName(task.patientId)}</p>
              </div>
              <p className="text-sm text-muted-foreground italic flex-1 truncate">{task.title}</p>
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {task.status === 'COMPLETED' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {task.status === 'COMPLETED'
                    ? t('app.therapist.homework.completed')
                    : t('app.therapist.homework.inProgress')}
                </span>
                <button className="feelora-btn-primary" onClick={() => setDetailHomeworkId(task.id)}>
                  {t('app.therapist.homework.details')}
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details pop-up: lets the therapist edit title/description, read and
          add notes, and delete the task — all three actions go through
          updateHomework/deleteHomework and patch the matching entry in
          `homeworks` locally so the list doesn't need a full refetch. */}
      {detailHomework && (
        <TherapistHomeworkDetailDialog
          homework={detailHomework}
          patientName={patientName(detailHomework.patientId)}
          onClose={() => setDetailHomeworkId(null)}
          onUpdate={handleUpdateDetail}
          onAddNote={handleAddNoteDetail}
          onDelete={handleDeleteDetail}
        />
      )}
    </div>
  );
};

export default TherapistHomeworkPage;
