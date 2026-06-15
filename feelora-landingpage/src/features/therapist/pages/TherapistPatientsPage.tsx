import { useEffect, useState } from 'react';
import { ChevronRight, Send, X, Loader2, Users } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { therapistService } from '../api/therapist-service';
import { useS3Download } from '@/hooks/use-s3-download';

// Shape of a patient returned by the getMatchedUsers GraphQL query
interface MatchedPatient {
  Id: string;
  Name?: string | null;
  Surname?: string | null;
  Gender?: string | null;
  BirthDate?: number | null; // Unix timestamp in seconds
  City?: string | null;
  Languages?: string[] | null;
}

// localStorage key used to remember which patients the therapist has already opened
const SEEN_PATIENTS_KEY = 'feelora:seen_patients';

// Returns the set of patient IDs the therapist has already viewed
const getSeenPatients = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_PATIENTS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

// Persists a patient ID as "seen" so it no longer appears in the "new patients" section
const markPatientSeen = (id: string) => {
  const seen = getSeenPatients();
  seen.add(id);
  localStorage.setItem(SEEN_PATIENTS_KEY, JSON.stringify([...seen]));
};

// Reusable avatar component that fetches the patient's profile picture from S3.
// Falls back to the placeholder image if no picture is available.
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

// Converts a Unix birth date (seconds) to a human-readable age string
const calcAge = (birthDateSeconds?: number | null): string => {
  if (!birthDateSeconds) return '—';
  return String(Math.floor((Date.now() - birthDateSeconds * 1000) / 31557600000));
};

// Maps the raw gender string stored in the DB to a translated display label
const translateGender = (g: string | null | undefined, t: ReturnType<typeof useTranslation>['t']) => {
  if (!g) return '—';
  const map: Record<string, string> = {
    male: t('q.p.gender.options.male', 'Männlich'),
    female: t('q.p.gender.options.female', 'Weiblich'),
    diverse: t('q.p.gender.options.diverse', 'Divers'),
  };
  // Fall back to the raw value if it's not in the map
  return map[g.toLowerCase()] ?? g;
};

interface PatientProfileModalProps {
  patient: MatchedPatient;
  onClose: () => void;
  onMessage: (patient: MatchedPatient) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

// Full-screen overlay modal showing a patient's profile details.
// Clicking the backdrop or the X button closes it.
const PatientProfileModal = ({ patient, onClose, onMessage, t }: PatientProfileModalProps) => {
  return (
    // Semi-transparent backdrop — clicking it closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal card — stopPropagation prevents backdrop click from firing */}
      <div
        className="bg-background rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: avatar + name + city */}
        <div className="flex items-center gap-4 mb-6">
          <S3Avatar
            userId={patient.Id}
            fallbackSrc={avatar}
            className="w-20 h-20 rounded-xl object-cover"
            alt={`${patient.Name} ${patient.Surname}`}
          />
          <div>
            <h2 className="text-xl font-bold text-primary">
              {patient.Name} {patient.Surname}
            </h2>
            <p className="text-sm text-muted-foreground">{patient.City || '—'}</p>
          </div>
        </div>

        {/* Patient details — only the fields the API actually returns */}
        <div className="space-y-2 text-sm text-foreground mb-6">
          <p>
            <span className="font-semibold">{t('app.therapist.patients.age')} </span>
            {calcAge(patient.BirthDate)}
          </p>
          <p>
            <span className="font-semibold">{t('app.therapist.patients.city')} </span>
            {patient.City || '—'}
          </p>
          <p>
            <span className="font-semibold">{t('app.therapist.profile.gender', 'Geschlecht:')} </span>
            {translateGender(patient.Gender, t)}
          </p>
          {/* Only render languages row when the patient has at least one entry */}
          {patient.Languages && patient.Languages.length > 0 && (
            <p>
              <span className="font-semibold">{t('app.therapist.profile.languages', 'Sprachen:')} </span>
              {patient.Languages.join(', ')}
            </p>
          )}
        </div>

        <button
          className="feelora-btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => onMessage(patient)}
        >
          <Send className="w-4 h-4" />
          {t('app.therapist.patients.message', 'Nachricht')}
        </button>
      </div>
    </div>
  );
};

const PatientsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // All matched patients (shown in the top list)
  const [patients, setPatients] = useState<MatchedPatient[]>([]);
  // Subset of patients not yet opened by the therapist (shown in the "new" section)
  const [newPatients, setNewPatients] = useState<MatchedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // The patient whose profile modal is currently open, or null when closed
  const [selectedPatient, setSelectedPatient] = useState<MatchedPatient | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        // Step 1: Get the therapist's own profile to read the Matches array (list of patient IDs)
        const profile = await therapistService.getProfile();
        const ids: string[] = profile.Matches || [];

        if (ids.length === 0) {
          setPatients([]);
          setNewPatients([]);
          return;
        }

        // Step 2: Fetch the actual patient profiles for those IDs
        const fetched = await therapistService.getMatchedPatients(ids);
        setPatients(fetched);

        // Step 3: Filter to only patients the therapist hasn't opened yet
        const seen = getSeenPatients();
        setNewPatients(fetched.filter((p) => !seen.has(p.Id)));
      } catch (err) {
        console.error('Error loading patients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Opens the profile modal and removes the patient from the "new" section
  const handleOpenPatient = (patient: MatchedPatient) => {
    markPatientSeen(patient.Id);
    setNewPatients((prev) => prev.filter((p) => p.Id !== patient.Id));
    setSelectedPatient(patient);
  };

  // Closes any open modal and navigates to the chat page, passing the patient ID via router state
  const handleMessage = (patient: MatchedPatient) => {
    setSelectedPatient(null);
    navigate('../', { state: { openChatWith: patient.Id } });
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.patients.title')}
      </h1>

      {/* All matched patients — compact list with avatar, name, and chevron */}
      <div className="feelora-card mb-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : patients.length === 0 ? (
          // Empty state shown when the therapist has no matches yet
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

      {/* New patients section — heading is always visible; content switches between cards and empty state */}
      {!isLoading && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t('app.therapist.patients.newPatients')}
            </h2>
            {/* Badge only shown when there are unseen patients */}
            {newPatients.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {newPatients.length}
              </span>
            )}
          </div>

          {newPatients.length === 0 ? (
            // Empty state when all matched patients have already been viewed
            <div className="feelora-card flex items-center justify-center py-8 text-muted-foreground text-sm">
              {t('app.therapist.patients.noNewPatients', 'Aktuell keine neuen Patient*innen.')}
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {newPatients.map((patient) => (
              <div key={patient.Id} className="feelora-card relative">
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full z-20">
                  new
                </span>

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
                  {/* Opens the full profile modal and marks the patient as seen */}
                  <button
                    className="feelora-btn-primary text-sm"
                    onClick={() => handleOpenPatient(patient)}
                  >
                    {t('app.therapist.patients.profile')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {/* Goes directly to chat without opening the profile modal */}
                  <button
                    className="feelora-btn-primary text-sm"
                    onClick={() => handleMessage(patient)}
                  >
                    {t('app.therapist.patients.message')}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile modal — rendered at the page root so it sits above everything */}
      {selectedPatient && (
        <PatientProfileModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onMessage={handleMessage}
          t={t}
        />
      )}
    </div>
  );
};

export default PatientsPage;
