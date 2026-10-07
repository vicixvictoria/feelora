import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useQuery } from '@apollo/client';
import { useMockQuery } from '@/mocks/use-mock-query'; // PORTFOLIO DEMO MODE: backend is offline
import { Check, FileText, Loader2, RefreshCw } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { homeworkService } from '@/features/homework/api/homework-service';
import { Homework, HomeworkNotes } from '@/features/homework/types/homework';
import HomeworkNotesDialog from '@/features/homework/components/HomeworkNotesDialog';
import { useWebsocket } from '@/contexts/WebsocketContext';
import { useS3Download } from '@/hooks/use-s3-download';
import { GET_OWN_USER_PROFILE_QUERY, GET_MATCHED_THERAPISTS_QUERY } from '../api/patient-service';
import {
  notificationService,
  getNotificationId,
  HOMEWORK_NOTIFICATION_TYPES,
  NotificationType,
} from '@/features/notifications/api/notification-service';

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
const isHomeworkNotification = (type?: string) =>
  HOMEWORK_NOTIFICATION_TYPES.includes(type as (typeof HOMEWORK_NOTIFICATION_TYPES)[number]);

// Patient's homework tab: lists the patient's own homeworks (fetched via
// getOwnHomeworks, auth-scoped to the current user — no PatientId needed)
// split into "new" (NEW + IN_PROGRESS — everything not yet completed) and
// "completed" sections, with a notes thread per task shared with the
// assigning therapist.
const HomeworkPage = () => {
  const { t } = useTranslation();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesHomeworkId, setNotesHomeworkId] = useState<string | null>(null);
  const [notesData, setNotesData] = useState<HomeworkNotes | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const { messages: websocketMessages } = useWebsocket();
  const processedMessageCountRef = useRef(0);

  // Same pattern as ProfilePage.tsx: resolve the patient's matched therapist
  // (there's only ever one) so we can show their real profile picture next
  // to each task instead of the generic placeholder.
  // PORTFOLIO DEMO MODE: original API call kept for reference
  // const { data: patientData } = useQuery(GET_OWN_USER_PROFILE_QUERY);
  const { data: patientData } = useMockQuery(GET_OWN_USER_PROFILE_QUERY);
  const patient = patientData?.getOwnUserProfile;
  // PORTFOLIO DEMO MODE: original API call kept for reference
  // const { data: therapistData } = useQuery(GET_MATCHED_THERAPISTS_QUERY, {
  //   variables: { TherapistsIds: patient?.Matches },
  //   skip: !patient?.Matches || patient.Matches.length === 0,
  // });
  const { data: therapistData } = useMockQuery(GET_MATCHED_THERAPISTS_QUERY, {
    variables: { TherapistsIds: patient?.Matches },
    skip: !patient?.Matches || patient.Matches.length === 0,
  });
  const therapist = therapistData?.getMatchedTherapists?.items?.[0];
  const { download: downloadTherapistAvatar, imageUrl: therapistAvatarUrl } = useS3Download();

  useEffect(() => {
    if (therapist?.Id) {
      downloadTherapistAvatar('profile', 'public', therapist.Id).catch((err) => {
        console.error('Could not download therapist profile image:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapist?.Id]);

  // Pulled out of the effect (rather than nested, like most other pages'
  // fetch-on-mount effects) so the websocket listener below can also call it
  // to silently refresh the list when a new/updated/deleted homework
  // notification comes in — no manual reload needed.
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

  useEffect(() => {
    const fetchAndClearNotifications = async () => {
      await fetchHomeworks();

      // Viewing this page is enough acknowledgment for new/updated/deleted
      // homework notifications — clear them and let the sidebar badge
      // refresh via the same 'notificationsRead' event other pages use.
      try {
        const { notifications } = await notificationService.getNotifications({});
        const homeworkNotifs = notifications.filter(
          (n) => n.type && HOMEWORK_NOTIFICATION_TYPES.includes(n.type) && getNotificationId(n),
        );
        if (homeworkNotifs.length > 0) {
          await Promise.all(
            homeworkNotifs.map((n) =>
              notificationService.readNotification({ notificationType: n.type!, notificationId: getNotificationId(n) }),
            ),
          );
          window.dispatchEvent(new Event('notificationsRead'));
        }
      } catch (err) {
        console.error('Error clearing homework notifications:', err);
      }
    };
    fetchAndClearNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-updates the list when the therapist assigns/edits/deletes a
  // homework or leaves a note, instead of requiring a manual reload —
  // SidebarNav handles the unread-badge side of these same events when this
  // page isn't open.
  useEffect(() => {
    if (websocketMessages.length <= processedMessageCountRef.current) return;
    const newMessages = websocketMessages.slice(processedMessageCountRef.current);
    processedMessageCountRef.current = websocketMessages.length;

    const homeworkNotifs = newMessages.filter((msg) => {
      const parsed = msg as IncomingNotification;
      return parsed.type === 'notification' && isHomeworkNotification(parsed.data?.type);
    });
    if (homeworkNotifs.length === 0) return;

    fetchHomeworks();
    homeworkNotifs.forEach((msg) => {
      const parsed = msg as IncomingNotification;
      if (!parsed.data?.type) return;
      const notificationId = getNotificationId({ homeworkId: parsed.data.homeworkId, sk: parsed.data.sk });
      if (!notificationId) return;
      notificationService
        .readNotification({
          notificationType: parsed.data.type as NotificationType,
          notificationId,
        })
        .then(() => window.dispatchEvent(new Event('notificationsRead')))
        .catch((err) => console.error('Failed to ack homework notification:', err));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocketMessages]);

  // Shared by both the "Done" button (new tasks) and "Repeat" button
  // (completed tasks) — the schema only has a Status field to flip, there's
  // no separate "repeat" operation, so both buttons just toggle it.
  const handleToggleStatus = async (homework: Homework) => {
    setUpdatingId(homework.id);
    try {
      const updated = await homeworkService.updateOwnHomework(
        homework.id,
        homework.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED',
      );
      setHomeworks((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    } catch (err) {
      console.error('Error updating homework status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Notes are a separate entity from Homework (see types/homework.ts), so
  // they're fetched independently the moment the notes dialog opens rather
  // than living on the `homeworks` list.
  useEffect(() => {
    if (!notesHomeworkId) {
      setNotesData(null);
      return;
    }
    setIsLoadingNotes(true);
    homeworkService
      .getNotes(notesHomeworkId)
      .then(setNotesData)
      .catch((err) => {
        console.error('Error fetching homework notes:', err);
        setNotesData(null);
      })
      .finally(() => setIsLoadingNotes(false));
  }, [notesHomeworkId]);

  const handleAddNote = async (note: string) => {
    if (!notesHomeworkId) return;
    const updated = await homeworkService.updateNotes(notesHomeworkId, { note });
    setNotesData(updated);

    // Writing a note is the patient's first real interaction with a task —
    // move it out of NEW so the "Neu" badge clears. updateNotes only touches
    // the separate Notes entity (see types/homework.ts), it can't do this
    // itself, so it's a second call here.
    const homework = homeworks.find((h) => h.id === notesHomeworkId);
    if (homework?.status === 'NEW') {
      try {
        const updatedHomework = await homeworkService.updateOwnHomework(notesHomeworkId, 'IN_PROGRESS');
        setHomeworks((prev) => prev.map((h) => (h.id === updatedHomework.id ? updatedHomework : h)));
      } catch (err) {
        console.error('Error moving homework out of NEW after adding a note:', err);
      }
    }
  };

  // Independent of handleAddNote — Note and Share are separately optional
  // now, so the dialog's toggle saves on its own without needing a note.
  const handleShareChange = async (share: boolean) => {
    if (!notesHomeworkId) return;
    const updated = await homeworkService.updateNotes(notesHomeworkId, { share });
    setNotesData(updated);
  };

  // NEW and IN_PROGRESS both render in the "new tasks" section — the UI only
  // has two buckets (new vs completed), so anything not COMPLETED counts as
  // new. The NEW badge below is what distinguishes an untouched task from
  // one the patient has already started.
  const newTasks = homeworks.filter((h) => h.status !== 'COMPLETED');
  const completedTasks = homeworks.filter((h) => h.status === 'COMPLETED');
  const notesHomework = homeworks.find((h) => h.id === notesHomeworkId) ?? null;

  return (
    <div className="max-w-4xl animate-fade-in relative">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="feelora-card text-center py-8 text-muted-foreground">{error}</div>
      ) : (
        <>
          {/* New Tasks */}
          <h1 className="text-2xl font-bold text-foreground mb-6">{t('patient.homework.newTasks')}</h1>
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
                      src={therapistAvatarUrl || avatar}
                      alt={therapist ? `${therapist.Name} ${therapist.Surname}` : 'Therapist'}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 bg-secondary/10 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{task.title}</p>
                        {/* Only NEW tasks get this tag (see HomeworkStatus in
                            types/homework.ts for what moves a task off NEW). */}
                        {task.status === 'NEW' && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-primary/15 text-primary px-1.5 py-0.5 rounded-full leading-none">
                            {t('patient.homework.new')}
                          </span>
                        )}
                      </div>
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
          <h2 className="text-2xl font-bold text-foreground mb-6">
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

      {notesHomework && (
        <HomeworkNotesDialog
          homeworkTitle={notesHomework.title}
          homeworkDescription={notesHomework.description}
          notes={notesData}
          isLoading={isLoadingNotes}
          onAddNote={handleAddNote}
          onShareChange={handleShareChange}
          onClose={() => setNotesHomeworkId(null)}
        />
      )}
    </div>
  );
};

export default HomeworkPage;
