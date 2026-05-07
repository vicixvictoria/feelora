import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Send, Loader2, UserMinus, AlertTriangle } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { GET_OWN_USER_PROFILE_QUERY, GET_MATCHED_THERAPISTS_QUERY, patientService } from '../api/patient-service';
import { useS3Download } from '@/hooks/use-s3-download';

// Helper to convert Unix timestamp (in seconds) to Age
const calculateAge = (birthDateUnix: number | null | undefined) => {
  if (!birthDateUnix) return 'Unbekannt';
  const birthDate = new Date(birthDateUnix * 1000);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for the unmatch modal
  const [isConfirmUnmatchOpen, setIsConfirmUnmatchOpen] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);

  // 1. Fetch Patient Profile
  const {
    data: patientData,
    loading: patientLoading,
    error: patientError,
  } = useQuery(GET_OWN_USER_PROFILE_QUERY);

  const patient = patientData?.getOwnUserProfile;

  // 2. Fetch Therapist only if we have match IDs
  const { data: therapistData } = useQuery(GET_MATCHED_THERAPISTS_QUERY, {
    variables: { TherapistsIds: patient?.Matches },
    skip: !patient?.Matches || patient.Matches.length === 0,
  });
  const therapist = therapistData?.getMatchedTherapists?.items?.[0];

  const { download, imageUrl } = useS3Download();
  const { download: downloadTherapist, imageUrl: therapistImageUrl } = useS3Download();

  useEffect(() => {
    if (patient) {
      download('profile', 'public').catch((err) => {
        console.error('Could not download profile image:', err);
      });
    }
  }, [patient]);

  useEffect(() => {
    if (therapist?.Id) {
      downloadTherapist('profile', 'public', therapist.Id).catch((err) => {
        console.error('Could not download therapist profile image:', err);
      });
    }
  }, [therapist?.Id]);

  // Handle Unmatching Therapist
  const handleConfirmUnmatch = async () => {
    if (!therapist?.Id) return;
    setIsUnmatching(true);
    try {
      await patientService.deleteMatch(therapist.Id);
      setIsConfirmUnmatchOpen(false);
      // Because we used refetchQueries in the service, the UI will automatically 
      // re-render and remove the therapist card once the cache updates.
    } catch (error) {
      console.error('Unmatch failed', error);
      alert(t('patient.profile.unmatchError', 'Fehler beim Auflösen der Verbindung. Bitte versuche es erneut.'));
    } finally {
      setIsUnmatching(false);
    }
  };

  // Loading state
  if (patientLoading && !patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (patientError) {
    return <div className="text-red-500 text-center">{t('patient.profile.loadError')}</div>;
  }

  if (!patient) return null;

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8 animate-fade-in relative">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('patient.profile.yourProfile')}
      </h1>

      {/* User Profile Card */}
      <div className="feelora-card mb-10">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <img
            src={imageUrl || avatar}
            alt={`${patient.Name} ${patient.Surname}`}
            className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              {patient.Name} {patient.Surname}
            </h2>
            <div className="space-y-1 text-foreground">
              <p>
                <strong>{t('patient.profile.age')}</strong>: {calculateAge(patient.BirthDate)}
              </p>
              <p>
                <strong>{t('patient.profile.city')}</strong>:{' '}
                {patient.City || t('patient.profile.notSpecified')}
              </p>
              <p className="mt-3">
                <strong>{t('patient.profile.role')}</strong>: {t('patient.profile.rolePatient')}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <p>
                  <strong>{t('patient.profile.therapistMatch')}</strong>:{' '}
                  {therapist ? therapist.Name : t('patient.profile.noMatch')} {therapist ? therapist.Surname : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="right-0 bottom-0 mt-4 sm:mt-0">
            <button
              onClick={() => navigate('edit')}
              className="feelora-btn-primary flex items-center gap-2"
            >
              {t('patient.profile.edit')}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Therapist Section */}
      <h2 className="text-xl font-bold text-foreground mb-4">
        {t('patient.profile.assignedTherapist')}
      </h2>

      {therapist ? (
        <div className="feelora-card">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <img
              src={therapistImageUrl || avatar}
              alt={therapist.Name || t('patient.profile.therapistAvatar')}
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-primary mb-2">
                {therapist.Title ? `${therapist.Title} ` : ''}{therapist.Name} {therapist.Surname}
              </h2>
              <div className="space-y-1 text-foreground">
                <p>
                  <strong>{t('patient.profile.age')}</strong>: {calculateAge(therapist.BirthDate)}
                </p>
                <p>
                  <strong>{t('patient.profile.city')}</strong>:{' '}
                  {therapist.City || t('patient.profile.notSpecified')}
                </p>
                <p className="mt-3">
                  <strong>{t('patient.profile.role')}</strong>: {t('patient.profile.roleTherapist')}
                </p>
                <p>
                  <strong>{t('patient.profile.specialization')}</strong>:{' '}
                  {therapist?.Specialties?.join(', ') || t('patient.profile.noSpecialization')}
                </p>
                <p>
                  <strong>{t('patient.profile.priceRange')}</strong>:{' '}
                  {therapist?.PriceRange || t('patient.profile.noPriceRange')}
                </p>
                <p>
                  <strong>{t('patient.profile.hasInsurance')}</strong>:{' '}
                  {therapist?.HasInsurance
                    ? t('patient.profile.insuranceYes')
                    : t('patient.profile.insuranceNo')}
                </p>
                <p className="mt-1">
                  <strong>{t('patient.profile.availability')}</strong>:{' '}
                  {therapist.Availability && therapist.Availability.length > 0
                    ? therapist.Availability.map((day: string) => {
                        const dayMap: Record<string, string> = {
                          mo: t('q.t.availability.mon'),
                          di: t('q.t.availability.tue'),
                          mi: t('q.t.availability.wed'),
                          do: t('q.t.availability.thu'),
                          fr: t('q.t.availability.fri'),
                          sa: t('q.t.availability.sat'),
                          so: t('q.t.availability.sun'),
                        };
                        return dayMap[day] || day.toUpperCase();
                      }).join(', ')
                    : t('patient.profile.notSpecified')}
                </p>
                {therapist.Address && (
                  <p className="mt-3">
                    <strong>{t('patient.profile.practice')}</strong>:{' '}
                    {therapist.Address || t('patient.profile.noPractice')}
                  </p>
                )}
              </div>
            </div>
            
            {/* Therapist Action Buttons */}
            <div className="flex flex-row sm:flex-col gap-3 self-start mt-4 sm:mt-0 w-full sm:w-auto">
              <button
                className="feelora-btn-primary flex items-center gap-2 justify-center w-full"
                onClick={() => {
                  if (therapist?.Id) {
                    navigate(`/patient?chatWith=${therapist.Id}`);
                  }
                }}
              >
                {t('patient.profile.message')}
                <Send className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsConfirmUnmatchOpen(true)}
                className="px-4 py-2 flex items-center justify-center gap-2 rounded-xl font-medium transition-colors border border-destructive/50 text-destructive bg-destructive/5 hover:bg-destructive/10 w-full"
              >
                {t('patient.profile.unmatchButton', 'Therapeut:in entmatchen')}
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="feelora-card p-6 text-center text-foreground">
          <p>{t('patient.profile.noTherapistAssigned')}</p>
        </div>
      )}

      {/* --- CONFIRM UNMATCH OVERLAY --- */}
      {isConfirmUnmatchOpen && therapist && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-destructive/20 shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t('patient.profile.unmatchConfirmTitle', 'Verbindung trennen?')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('patient.profile.unmatchConfirmText', 'Bist du sicher, dass du die Verbindung zu diesem Therapeuten trennen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden und der gesamte Chatverlauf wird gelöscht.')}
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
                {isUnmatching ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.unmatch', 'Trennen')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;