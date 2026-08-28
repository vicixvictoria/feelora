import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import placeholderAvatar from '@/assets/avatar-Placeholder.png';
import { therapistService } from '../api/therapist-service';
import { emojiDictionary } from '@/components/ui/moodtracker/mood-tracker';
import { S3Avatar } from '@/components/s3/S3Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sentinel value for the "show all patients" option in the filter dropdown.
// Radix Select does not allow an empty string as an item value, so we use this instead.
const ALL_PATIENTS_VALUE = 'all';

// helper for date format
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TherapistMoodTrackerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [combinedTrackers, setCombinedTrackers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // List of the therapist's matched patients, used to populate the patient filter dropdown.
  const [patientOptions, setPatientOptions] = useState<{ id: string; name: string }[]>([]);
  // Currently selected patient filter; defaults to showing all patients' entries.
  const [selectedPatientId, setSelectedPatientId] = useState<string>(ALL_PATIENTS_VALUE);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Get the therapist's matches
        const profile = await therapistService.getProfile();
        const patientIds = profile.Matches || [];

        if (patientIds.length === 0) {
          setCombinedTrackers([]);
          setIsLoading(false);
          return;
        }

        // Get the patient profiles to get their names
        const patients = await therapistService.getMatchedPatients(patientIds);

        // if tehrapist has deleted patients that werent unmatched yet -- current bug
        const validPatients = patients.filter((p: any) => p != null && p.Id);

        // Build the options for the patient filter dropdown from the matched patients
        setPatientOptions(
          validPatients.map((patient: any) => ({
            id: patient.Id,
            name: `${patient.Name} ${patient.Surname || ''}`.trim(),
          })),
        );

        // Fetch mood trackers for each patient and combine them
        const allTrackers = [];
        for (const patient of validPatients) {
          const { trackers, hasConsent } = await therapistService.getPatientMoodTrackers(
            patient.Id,
          );
          const patientFullName = `${patient.Name} ${patient.Surname || ''}`.trim();

          // If they denied consent, push a special locked entry
          if (!hasConsent) {
            allTrackers.push({
              isLocked: true,
              patientId: patient.Id,
              patientName: patientFullName,
              date: '---',
              rawDate: 0,
            });
            continue;
          }

          // Otherwise, map their data normally
          const mappedTrackers = trackers.map((item: any) => {
            const questionnaire = JSON.parse(item.Questionnaire);
            return {
              isLocked: false,
              patientId: patient.Id,
              patientName: patientFullName,
              date: formatDate(item.CreatedAt),
              rawDate: new Date(item.CreatedAt).getTime(),
              mood: emojiDictionary[questionnaire[0]?.[0]] || '❓',
              outdoor: emojiDictionary[questionnaire[3]?.[0]] || '❓',
              physical: emojiDictionary[questionnaire[4]?.[0]] || '❓',
              fullQuestionnaire: questionnaire,
            };
          });

          allTrackers.push(...mappedTrackers);
        }

        // Sort everything by newest first
        allTrackers.sort((a, b) => b.rawDate - a.rawDate);
        setCombinedTrackers(allTrackers);
      } catch (error) {
        console.error('Failed to load patient mood trackers', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Derive the list of entries to display based on the selected patient filter.
  // When "all" is selected (the default), every patient's entries are shown.
  const filteredTrackers = useMemo(() => {
    if (selectedPatientId === ALL_PATIENTS_VALUE) {
      return combinedTrackers;
    }
    return combinedTrackers.filter((entry) => entry.patientId === selectedPatientId);
  }, [combinedTrackers, selectedPatientId]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('app.therapist.moodTracker.title', 'Patienten Mood Tracker')}
          </h1>
          <p className="text-primary italic mt-1">
            {t('app.therapist.moodTracker.subtitle', 'Übersicht der aktuellen Stimmungseinträge')}
          </p>
        </div>

        {/* Patient filter dropdown: lets the therapist narrow the list down to a single patient */}
        {patientOptions.length > 0 && (
          <div className="w-full sm:w-64">
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PATIENTS_VALUE}>
                  {t('app.therapist.moodTracker.allPatients', 'Alle Patient:innen')}
                </SelectItem>
                {patientOptions.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTrackers.length === 0 ? (
        <div className="feelora-card text-center p-8 border-dashed border-2">
          <p className="text-muted-foreground text-lg">
            {selectedPatientId === ALL_PATIENTS_VALUE
              ? t(
                  'app.therapist.moodTracker.noEntries',
                  'Noch keine Einträge von Patient:innen vorhanden.',
                )
              : t(
                  'app.therapist.moodTracker.noEntriesForPatient',
                  'Noch keine Einträge für diese:n Patient:in vorhanden.',
                )}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTrackers.map((entry, index) => (
            <div
              key={index}
              className={`feelora-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 ${entry.isLocked ? 'opacity-70 bg-muted/30' : ''}`}
            >
              {/* Patient Info Column */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Replaced standard img tag with S3Avatar component */}
                <S3Avatar
                  userId={entry.patientId}
                  fallbackSrc={placeholderAvatar}
                  alt={entry.patientName}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-[120px]">
                  <p className="font-semibold text-foreground">{entry.patientName}</p>
                  <p
                    className={`text-sm ${entry.isLocked ? 'text-muted-foreground italic' : 'text-primary'}`}
                  >
                    {entry.date}
                  </p>
                </div>
              </div>

              {/* Conditional Rendering: Locked vs Normal */}
              {entry.isLocked ? (
                <div className="flex items-center justify-end flex-1 gap-2 text-muted-foreground pr-4">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm italic">
                    {t(
                      'moodTracker.overview.noConsent',
                      'Patient hat der Freigabe nicht zugestimmt',
                    )}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-8 flex-1">
                    <div className="text-center">
                      <span className="text-2xl">{entry.mood}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('moodTracker.overview.stimmung', 'Mood')}
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl">{entry.outdoor}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('moodTracker.overview.activity', 'Activity')}
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl">{entry.physical}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('moodTracker.overview.physical', 'Physical')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('details', { state: { entry } })}
                    className="text-primary font-medium hover:underline flex items-center gap-1 self-end sm:self-auto"
                  >
                    {t('common.details', 'Details')} <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistMoodTrackerPage;
