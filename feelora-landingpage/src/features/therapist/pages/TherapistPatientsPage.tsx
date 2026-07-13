import { useEffect, useState } from 'react';
import { ChevronRight, Send, X, Loader2, Users, Check, UserMinus, AlertTriangle } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { therapistService } from '../api/therapist-service';
import { useS3Download } from '@/hooks/use-s3-download';
import { notificationService } from '../../notifications/api/notification-service';

interface MatchedPatient {
  Id: string;
  Name?: string | null;
  Surname?: string | null;
  Gender?: string | null;
  BirthDate?: number | null;
  City?: string | null;
  Languages?: string[] | null;
  sessionStarted?: boolean | null;
}

const S3Avatar = ({
  userId,
  fallbackSrc,
  className,
  alt = '',
}: {
  userId?: string;
  fallbackSrc: string;
  className: string;
  alt?: string;
}) => {
  const { download, imageUrl } = useS3Download();

  useEffect(() => {
    if (userId) download('profile', 'public', userId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

const calcAge = (birthDateSeconds?: number | null): string => {
  if (!birthDateSeconds) return '—';
  return String(Math.floor((Date.now() - birthDateSeconds * 1000) / 31557600000));
};

const translateGender = (g: string | null | undefined, t: ReturnType<typeof useTranslation>['t']) => {
  if (!g) return '—';
  const map: Record<string, string> = {
    male: t('q.p.gender.options.male', 'Männlich'),
    female: t('q.p.gender.options.female', 'Weiblich'),
    diverse: t('q.p.gender.options.diverse', 'Divers'),
  };
  return map[g.toLowerCase()] ?? g;
};

interface PatientProfileModalProps {
  patient: MatchedPatient;
  onClose: () => void;
  onMessage: (patient: MatchedPatient) => void;
  onUnmatch: (patient: MatchedPatient) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

const PatientProfileModal = ({ patient, onClose, onMessage, onUnmatch, t }: PatientProfileModalProps) => {
  const age = calcAge(patient.BirthDate);
  const languages = patient.Languages && patient.Languages.length > 0 ? patient.Languages.join(', ') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border chat-bubble-received">
          <h3 className="text-lg font-semibold text-foreground">
            {t('app.therapist.chat.patientProfile', 'Patientenprofil')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <S3Avatar
              userId={patient.Id}
              fallbackSrc={avatar}
              className="w-16 h-16 rounded-full object-cover border border-border"
              alt={`${patient.Name} ${patient.Surname}`}
            />
            <div>
              <h4 className="text-xl font-bold text-foreground">
                {patient.Name} {patient.Surname}
              </h4>
              <p className="text-muted-foreground">
                {age !== '—' ? `${age} ${t('app.therapist.profile.years', 'Jahre')}` : t('app.therapist.profile.ageUnknown', 'Alter unbekannt')}
              </p>
              {languages && <p className="text-muted-foreground"> {languages}</p>}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t('app.therapist.profile.firstName', 'Vorname')}
              </p>
              <p className="font-medium text-foreground">{patient.Name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t('app.therapist.profile.lastName', 'Nachname')}
              </p>
              <p className="font-medium text-foreground">{patient.Surname || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t('app.therapist.profile.gender', 'Geschlecht')}
              </p>
              <p className="font-medium text-foreground capitalize">
                {translateGender(patient.Gender, t)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t('app.therapist.profile.city', 'Stadt')}
              </p>
              <p className="font-medium text-foreground capitalize">
                {patient.City || '-'}
              </p>
            </div>
          </div>

          <button
            className="feelora-btn-primary w-full flex items-center justify-center gap-2"
            onClick={() => onMessage(patient)}
          >
            <Send className="w-4 h-4" />
            {t('app.therapist.patients.message', 'Nachricht')}
          </button>

          {/* UNMATCH BUTTON */}
          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={() => onUnmatch(patient)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors font-medium"
            >
              <UserMinus className="w-4 h-4" />
              {t('app.therapist.chat.unmatchButton', 'Patienten entfernen')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<MatchedPatient[]>([]);
  const [newPatients, setNewPatients] = useState<MatchedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<MatchedPatient | null>(null);
  const [startingSession, setStartingSession] = useState<string | null>(null);
  const [unreadMatchIds, setUnreadMatchIds] = useState<Set<string>>(new Set());
  const [isConfirmUnmatchOpen, setIsConfirmUnmatchOpen] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const profile = await therapistService.getProfile();
        const ids: string[] = profile.Matches || [];

        if (ids.length === 0) {
          setPatients([]);
          setNewPatients([]);
          return;
        }

        const fetched = await therapistService.getMatchedPatients(ids);
        setPatients(fetched.filter((p: MatchedPatient) => p.sessionStarted));
        setNewPatients(fetched.filter((p: MatchedPatient) => !p.sessionStarted));

        // Figure out which patients have an unread "new match" notification —
        // these get the "new" tag for this visit, then are marked as read below
        // so the tag is gone on the next visit (even though the patient stays
        // in the "new patients" section until the therapist starts a session).
        const { notifications } = await notificationService.getNotifications({ notificationType: 'new_match' });
        const unreadIds = notifications
          .map((n) => n.matchedId)
          .filter((id): id is string => Boolean(id));

        if (unreadIds.length > 0) {
          setUnreadMatchIds(new Set(unreadIds));
          Promise.all(
            unreadIds.map((matchedId) =>
              notificationService.readNotification({ notificationType: 'new_match', notificationId: matchedId })
            )
          )
            .then(() => window.dispatchEvent(new Event('notificationsRead')))
            .catch((err) => console.error('Error marking new match notifications as read:', err));
        }
      } catch (err) {
        console.error('Error loading patients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleOpenPatient = (patient: MatchedPatient) => {
    setSelectedPatient(patient);
  };

  const handleMessage = (patient: MatchedPatient) => {
    setSelectedPatient(null);
    navigate('../', { state: { openChatWith: patient.Id } });
  };

  // --- UNMATCH HANDLER ---
  // Opens the confirmation modal for unmatching a patient
  const handleConfirmUnmatch = async () => {
    if (!selectedPatient) return;
    setIsUnmatching(true);
    try {
      await therapistService.deleteMatch(selectedPatient.Id);
      setPatients((prev) => prev.filter((p) => p.Id !== selectedPatient.Id));
      setNewPatients((prev) => prev.filter((p) => p.Id !== selectedPatient.Id));
      setSelectedPatient(null);
      setIsConfirmUnmatchOpen(false);
    } catch (err) {
      console.error('Unmatch failed', err);
      alert(t('app.therapist.chat.unmatchError', 'Fehler beim Auflösen der Verbindung. Bitte versuche es erneut.'));
    } finally {
      setIsUnmatching(false);
    }
  };

  const handleStartSession = async (patient: MatchedPatient) => {
    setStartingSession(patient.Id);
    try {
      await therapistService.startSession(patient.Id);
      const acknowledged = { ...patient, sessionStarted: true };
      setNewPatients((prev) => prev.filter((p) => p.Id !== patient.Id));
      setPatients((prev) => [...prev, acknowledged]);
    } catch (err) {
      console.error('Error acknowledging session start:', err);
    } finally {
      setStartingSession(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      {/* All matched patients */}
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.patients.title')}
      </h1>

      <div className="feelora-card mb-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Users className="w-10 h-10 opacity-30" />
            <p className="text-sm">{t('app.therapist.patients.noPatients', 'Noch keine Patient*innen zugewiesen.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patients.map((patient) => (
              <button
                key={patient.Id}
                onClick={() => handleOpenPatient(patient)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-background hover:shadow-sm transition-shadow text-left w-full"
              >
                <S3Avatar
                  userId={patient.Id}
                  fallbackSrc={avatar}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  alt={`${patient.Name} ${patient.Surname}`}
                />
                <p className="font-medium text-foreground flex-1">
                  {patient.Name} {patient.Surname}
                </p>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New patients — not yet acknowledged via sessionsManagement */}
      {!isLoading && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t('app.therapist.patients.newPatients')}
            </h2>
            {newPatients.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {newPatients.length}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3 mb-6">
            {t(
              'app.therapist.patients.newPatientsInfo',
              'Here you can see all new patients that you have not actively started therapy with. If you contacted the patients and agreed to a session plan, you can move them to your "Active Patients" section. Note: This is just your own administration tool — the patient\'s app will not be influenced by that.',
            )}
          </p>

          {newPatients.length === 0 ? (
            <div className="feelora-card flex items-center justify-center py-8 text-muted-foreground text-sm">
              {t('app.therapist.patients.noNewPatients', 'Aktuell keine neuen Patient*innen.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {newPatients.map((patient) => (
                <div key={patient.Id} className="feelora-card relative">
                  {unreadMatchIds.has(patient.Id) && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full z-20">
                      {t('app.therapist.patients.newTag', 'New')}
                    </span>
                  )}

                  <div className="flex gap-4 mb-4">
                    <S3Avatar
                      userId={patient.Id}
                      fallbackSrc={avatar}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      alt={`${patient.Name} ${patient.Surname}`}
                    />
                    <div className="flex flex-col justify-center">
                      <p className="font-bold text-primary text-lg">
                        {patient.Name} {patient.Surname}
                      </p>
                      <p className="text-sm text-foreground">
                        {t('app.therapist.patients.age')} {calcAge(patient.BirthDate)}
                      </p>
                      <p className="text-sm text-foreground">
                        {t('app.therapist.patients.city')} {patient.City || '—'}
                      </p>
                      <p className="text-sm text-foreground">
                        {t('app.therapist.profile.gender', 'Geschlecht:')} {translateGender(patient.Gender, t)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="feelora-btn-primary text-sm"
                      onClick={() => handleOpenPatient(patient)}
                    >
                      {t('app.therapist.patients.profile')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      className="feelora-btn-primary text-sm"
                      onClick={() => handleMessage(patient)}
                    >
                      {t('app.therapist.patients.message')}
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      className="border border-primary text-primary px-4 py-2 rounded-full font-medium hover:bg-primary/10 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50"
                      onClick={() => handleStartSession(patient)}
                      disabled={startingSession === patient.Id}
                    >
                      {startingSession === patient.Id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {t('app.therapist.patients.initialSession')}
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedPatient && (
        <PatientProfileModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onMessage={handleMessage}
          onUnmatch={() => setIsConfirmUnmatchOpen(true)}
          t={t}
        />
      )}

      {/* --- CONFIRM UNMATCH OVERLAY --- */}
      {isConfirmUnmatchOpen && selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-destructive/20 shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t('app.therapist.chat.unmatchConfirmTitle', 'Patienten entfernen?')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('app.therapist.chat.unmatchConfirmText', 'Bist du sicher, dass du die Verbindung zu diesem Patienten trennen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden und der gesamte Chatverlauf wird gelöscht.')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmUnmatchOpen(false)}
                disabled={isUnmatching}
                className="flex-1 px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {t('common.cancel', 'Abbrechen')}
              </button>
              <button
                onClick={handleConfirmUnmatch}
                disabled={isUnmatching}
                className="flex-1 px-4 py-2 bg-destructive text-white hover:bg-destructive/90 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUnmatching ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.unmatch', 'Entfernen')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
