import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import placeholderAvatar from '@/assets/avatar-Placeholder.png';
import { therapistService } from '../api/therapist-service';
import { emojiDictionary } from '@/components/ui/moodtracker/mood-tracker';
import { useS3Download } from '@/hooks/use-s3-download';

// --- S3 Avatar Component ---
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
    if (userId) {
      // Pass the userId to fetch that specific patient's profile picture
      download('profile.jpg', 'public', userId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

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

        // Fetch mood trackers for each patient and combine them
        const allTrackers = [];
        for (const patient of patients) {
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

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {t('app.therapist.moodTracker.title', 'Patienten Mood Tracker')}
        </h1>
        <p className="text-primary italic mt-1">
          {t('app.therapist.moodTracker.subtitle', 'Übersicht der aktuellen Stimmungseinträge')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : combinedTrackers.length === 0 ? (
        <div className="feelora-card text-center p-8 border-dashed border-2">
          <p className="text-muted-foreground text-lg">
            {t(
              'app.therapist.moodTracker.noEntries',
              'Noch keine Einträge von Patient:innen vorhanden.',
            )}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {combinedTrackers.map((entry, index) => (
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
