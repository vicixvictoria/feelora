import { useTranslation } from 'react-i18next';
import { ExternalLink, Search, Send, Loader2 } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useQuery } from '@apollo/client';
import { GET_OWN_USER_PROFILE_QUERY, GET_MATCHED_THERAPISTS_QUERY } from '../api/patient-service';

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

  // 1. Fetch Patient Profile
  // Apollo uses 'cache-first' by default, so it won't hit the network if data exists.
  const {
    data: patientData,
    loading: patientLoading,
    error: patientError,
  } = useQuery(GET_OWN_USER_PROFILE_QUERY);

  const patient = patientData?.getOwnUserProfile;

  // 2. Fetch Therapist only if we have match IDs
  // 'skip' prevents the query from running until the patient data is ready.
  const { data: therapistData } = useQuery(
    GET_MATCHED_THERAPISTS_QUERY,
    {
      variables: { TherapistsIds: patient?.Matches },
      skip: !patient?.Matches || patient.Matches.length === 0,
    },
  );
  const therapist = therapistData?.getMatchedTherapists?.items?.[0];

  // Loading state (only show spinner if we don't have patient data yet)
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
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('patient.profile.yourProfile')}
      </h1>

      {/* User Profile Card */}
      <div className="feelora-card mb-10">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <img
            src={avatar}
            alt={`${patient.Name} ${patient.Surname}`}
            className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              {patient.Name} {patient.Surname}
            </h2>
            <div className="space-y-1 text-foreground">
              <p>
                {t('patient.profile.age')}: {calculateAge(patient.BirthDate)}
              </p>
              <p>
                {t('patient.profile.city')}: {patient.City || t('patient.profile.notSpecified')}
              </p>
              <p className="mt-3">
                {t('patient.profile.role')}: {t('patient.profile.rolePatient')}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <p>
                  {t('patient.profile.therapistMatch')}:{' '}
                  {therapist ? therapist.Name : t('patient.profile.noMatch')}
                </p>
              </div>
            </div>
          </div>
          <div className="self-center">
            <button className="feelora-btn-primary flex items-center gap-2">
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
              src={avatar}
              alt={therapist.Name || t('patient.profile.therapistAvatar')}
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-primary mb-2">
                {therapist.Name} {therapist.Surname}
              </h2>
              <div className="space-y-1 text-foreground">
                <p>
                  {t('patient.profile.age')}: {calculateAge(therapist.BirthDate)}
                </p>
                <p>
                  {t('patient.profile.city')}: {therapist.City || t('patient.profile.notSpecified')}
                </p>
                <p className="mt-3">
                  {t('patient.profile.role')}: {t('patient.profile.roleTherapist')}
                </p>
                <p>
                  {t('patient.profile.specialization')}:{' '}
                  {therapist?.Specialties?.join(', ') || t('patient.profile.noSpecialization')}
                </p>
                <p className="mt-1">
                  {t('patient.profile.availability')}:{' '}
                  {therapist.Availability?.join(', ') || t('patient.profile.notSpecified')}
                </p>
                {therapist.Address && (
                  <p className="mt-3">
                    {t('patient.profile.practice')}:{' '}
                    {therapist.Address || t('patient.profile.noPractice')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-3 self-start">
              <button className="feelora-btn-primary flex items-center gap-2 justify-center">
                {t('patient.profile.profileBtn')}
                <Search className="w-4 h-4" />
              </button>
              <button className="feelora-btn-primary flex items-center gap-2 justify-center">
                {t('patient.profile.message')}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="feelora-card p-6 text-center text-foreground">
          <p>{t('patient.profile.noTherapistAssigned')}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
