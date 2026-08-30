import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, Clock, Loader2, Search, Send, X } from 'lucide-react';
import placeholderAvatar from '@/assets/avatar-Placeholder.png';
import { therapistService } from '../api/therapist-service';
import { homeworkService } from '@/features/homework/api/homework-service';
import { Homework, HomeworkNotes, HomeworkStatus } from '@/features/homework/types/homework';
import TherapistHomeworkDetailDialog from '@/features/homework/components/TherapistHomeworkDetailDialog';
import { S3Avatar } from '@/components/s3/S3Avatar';
import { notificationService, getNotificationId } from '@/features/notifications/api/notification-service';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sentinel value for the "show all patients" option in the filter dropdown —
// same convention as TherapistMoodTrackerPage.tsx (Radix Select doesn't
// allow an empty string as an item value).
const ALL_PATIENTS_VALUE = 'all';

// Therapist's homework tab: lets the therapist assign new homework to a
// matched patient and see the status of everything they've assigned so far.
// The schema has no "all homeworks for all my patients" query, only
// getPatientHomeworks(PatientId) — so the Task Status section is built by
// fetching each matched patient's homeworks separately and merging them
// client-side (see refreshHomeworks below).

// Mirrors SidebarNav's own local shape for websocket notification payloads —
// see notification-service.ts's schema comment for why type stays a loose
// string here rather than NotificationType (the raw WS payload is untyped JSON).
interface IncomingNotification {
  type?: string;
  data?: {
    type?: string;
    homeworkId?: string;
    sk?: string;
  };
}

interface MatchedPatient {
  Id: string;
  Name?: string | null;
  Surname?: string | null;
}

const patientLabel = (patient: MatchedPatient) =>
  [patient.Name, patient.Surname].filter(Boolean).join(' ') || patient.Id;

// Status pill styling/label/icon, shared between the Task Status list rows.
// NEW and IN_PROGRESS render identically ("in Bearbeitung" + clock icon) —
// the therapist doesn't need to distinguish "assigned, untouched" from
// "patient has started it," only whether it's done.
const STATUS_META: Record<HomeworkStatus, { className: string; icon: typeof Check; labelKey: string }> = {
  NEW: { className: 'bg-yellow-100 text-yellow-700', icon: Clock, labelKey: 'app.therapist.homework.inProgress' },
  IN_PROGRESS: { className: 'bg-yellow-100 text-yellow-700', icon: Clock, labelKey: 'app.therapist.homework.inProgress' },
  COMPLETED: { className: 'bg-green-100 text-green-700', icon: Check, labelKey: 'app.therapist.homework.completed' },
};

const TherapistHomeworkPage = () => {
  const { t } = useTranslation();

  const [patients, setPatients] = useState<MatchedPatient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoadingHomeworks, setIsLoadingHomeworks] = useState(true);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [detailHomeworkId, setDetailHomeworkId] = useState<string | null>(null);
  const [detailNotes, setDetailNotes] = useState<HomeworkNotes | null>(null);
  const [isLoadingDetailNotes, setIsLoadingDetailNotes] = useState(false);

  // Task Status filter — narrows the combined list down to one patient;
  // defaults to showing everyone's tasks.
  const [taskFilterPatientId, setTaskFilterPatientId] = useState<string>(ALL_PATIENTS_VALUE);

  const { messages: websocketMessages } = useWebsocket();
  const processedMessageCountRef = useRef(0);

  // One getPatientHomeworks call per patient (no bulk endpoint exists), then
  // flatten + sort newest-first for the combined Task Status list. Takes the
  // patient list explicitly (rather than reading `patients` state) so the
  // mount effect can call it with a freshly-fetched list before that state
  // update has actually landed.
  const refreshHomeworks = async (patientList: MatchedPatient[]) => {
    setIsLoadingHomeworks(true);
    try {
      const perPatient = await Promise.all(
        patientList.map((patient) => homeworkService.getPatientHomeworks(patient.Id)),
      );
      const all = perPatient.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setHomeworks(all);
    } catch (err) {
      console.error('Error refreshing homeworks:', err);
    } finally {
      setIsLoadingHomeworks(false);
    }
  };

  // Notes are a separate entity from Homework (see types/homework.ts), so
  // they're fetched independently the moment the details dialog opens
  // rather than living on the `homeworks` list. Read-only here — the
  // therapist never writes notes, only views what the patient has shared.
  const loadDetailNotes = async (id: string) => {
    setIsLoadingDetailNotes(true);
    try {
      setDetailNotes(await homeworkService.getNotes(id));
    } catch (err) {
      console.error('Error fetching homework notes:', err);
      setDetailNotes(null);
    } finally {
      setIsLoadingDetailNotes(false);
    }
  };

  useEffect(() => {
    if (detailHomeworkId) loadDetailNotes(detailHomeworkId);
    else setDetailNotes(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailHomeworkId]);

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
        await refreshHomeworks(fetched);

        // The therapist only ever receives "updated_homework" (a patient
        // completed/added a note to one of their tasks) — visiting this page
        // is enough acknowledgment, so clear those and let the sidebar badge
        // refresh via the same 'notificationsRead' event other pages use.
        const { notifications } = await notificationService.getNotifications({ notificationType: 'updated_homework' });
        if (notifications.length > 0) {
          await Promise.all(
            notifications
              .filter((n) => getNotificationId(n))
              .map((n) => notificationService.readNotification({ notificationType: 'updated_homework', notificationId: getNotificationId(n) })),
          );
          window.dispatchEvent(new Event('notificationsRead'));
        }
      } catch (err) {
        console.error('Error loading homework page data:', err);
      } finally {
        setIsLoadingPatients(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-updates the Task Status list when a patient completes/adds a note
  // to one of their tasks, instead of requiring a manual reload — SidebarNav
  // handles the unread-badge side of these same events when this page isn't
  // open. Re-fetches with the current `patients` state rather than
  // re-resolving matched patients from scratch.
  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;
    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    const homeworkNotifs = newMessages.filter((msg) => {
      const parsed = msg as IncomingNotification;
      return parsed.type === 'notification' && parsed.data?.type === 'updated_homework';
    });
    if (homeworkNotifs.length === 0) return;

    refreshHomeworks(patients);
    // If the therapist currently has this homework's details open, also
    // live-refresh its notes — the notification is very likely the patient
    // having just added/shared one.
    if (detailHomeworkId) loadDetailNotes(detailHomeworkId);
    homeworkNotifs.forEach((msg) => {
      const parsed = msg as IncomingNotification;
      const notificationId = getNotificationId({ homeworkId: parsed.data?.homeworkId, sk: parsed.data?.sk });
      if (!notificationId) return;
      notificationService
        .readNotification({ notificationType: 'updated_homework', notificationId })
        .then(() => window.dispatchEvent(new Event('notificationsRead')))
        .catch((err) => console.error('Failed to ack homework notification:', err));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocketMessages, patients, detailHomeworkId]);

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

  const handleDeleteDetail = async () => {
    if (!detailHomework) return;
    await homeworkService.deleteHomework(detailHomework.id);
    setHomeworks((prev) => prev.filter((h) => h.id !== detailHomework.id));
    setDetailHomeworkId(null);
  };

  const selectedPatient = patients.find((p) => p.Id === selectedPatientId) ?? null;

  // Task Status list filtered down to the selected patient (or everyone,
  // when ALL_PATIENTS_VALUE is selected).
  const filteredHomeworks = useMemo(() => {
    if (taskFilterPatientId === ALL_PATIENTS_VALUE) return homeworks;
    return homeworks.filter((h) => h.patientId === taskFilterPatientId);
  }, [homeworks, taskFilterPatientId]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
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
                  fallbackSrc={placeholderAvatar}
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          {t('app.therapist.homework.taskStatus')}
        </h2>

        {/* Patient filter: narrows the combined list down to a single patient */}
        {patients.length > 0 && (
          <div className="w-full sm:w-64">
            <Select value={taskFilterPatientId} onValueChange={setTaskFilterPatientId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PATIENTS_VALUE}>
                  {t('app.therapist.homework.allPatients')}
                </SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.Id} value={patient.Id}>
                    {patientLabel(patient)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {isLoadingHomeworks ? (
        <div className="feelora-card flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredHomeworks.length === 0 ? (
        <div className="feelora-card text-center py-8 text-muted-foreground">
          {taskFilterPatientId === ALL_PATIENTS_VALUE
            ? t('app.therapist.homework.noTasks')
            : t('app.therapist.homework.noTasksForPatient')}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredHomeworks.map((task) => (
            <div key={task.id} className="feelora-card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <S3Avatar
                  userId={task.patientId}
                  fallbackSrc={placeholderAvatar}
                  alt={patientName(task.patientId)}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <p className="font-semibold text-foreground min-w-[140px]">{patientName(task.patientId)}</p>
              </div>
              <p className="text-sm text-muted-foreground italic flex-1 truncate">{task.title}</p>
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_META[task.status].className}`}
                >
                  {/* JSX only treats a capitalized identifier as a component,
                      so the lookup has to be assigned to a variable first —
                      can't write `<STATUS_META[task.status].icon />` directly. */}
                  {(() => {
                    const StatusIcon = STATUS_META[task.status].icon;
                    return <StatusIcon className="w-3.5 h-3.5" />;
                  })()}
                  {t(STATUS_META[task.status].labelKey)}
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

      {/* Details pop-up: lets the therapist edit title/description, read
          (read-only) any notes the patient has chosen to share, and delete
          the task. Edit/delete go through updateHomework/deleteHomework and
          patch the matching entry in `homeworks` locally so the list
          doesn't need a full refetch. */}
      {detailHomework && (
        <TherapistHomeworkDetailDialog
          homework={detailHomework}
          patientName={patientName(detailHomework.patientId)}
          notes={detailNotes}
          isLoadingNotes={isLoadingDetailNotes}
          onClose={() => setDetailHomeworkId(null)}
          onUpdate={handleUpdateDetail}
          onDelete={handleDeleteDetail}
        />
      )}
    </div>
  );
};

export default TherapistHomeworkPage;
