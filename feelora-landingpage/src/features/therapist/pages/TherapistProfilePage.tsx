import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Loader2 } from 'lucide-react';
import therapistAvatar from '@/assets/avatar-Placeholder.png';
import { therapistService } from '../api/therapistService'; // Adjust path if needed
import { TherapistProfile } from '../types/profiles'; // Import TherapistProfile type

const TherapistProfilePage = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch therapist profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Call the method from therapistService
        const data = await therapistService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile', err);
        setError(t('app.therapist.profile.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error || t('app.therapist.profile.noProfile')}
      </div>
    );
  }

  // Calculate age from Unix timestamp (BirthDate float)
  // Fallback to 'k.A.' (keine Angabe / no data) if missing
  const age = profile.BirthDate
    ? Math.floor((Date.now() - profile.BirthDate * 1000) / 31557600000)
    : 'k.A.';

  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.profile.title')}
      </h1>

      <div className="feelora-card">
        <div className="flex gap-8 mb-6">
          <img
            src={therapistAvatar}
            alt={`${profile.Name} ${profile.Surname}`}
            className="w-40 h-40 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              Dr. {profile.Name} {profile.Surname}
            </h2>
            <div className="space-y-0.5 text-foreground">
              <p>
                {t('app.therapist.profile.age')} {age}
              </p>
              <p>
                {t('app.therapist.profile.city')} {profile.City}
              </p>
              {profile.Address && (
                <p>
                  {t('app.therapist.profile.address')} {profile.Address}
                </p>
              )}
              <p>
                {t('app.therapist.profile.role')} {t('app.therapist.profile.therapist')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-foreground">
          <div>
            <p>
              <span className="font-semibold">{t('app.therapist.profile.specializedIn')}</span>{' '}
              {profile.Specialties?.join(', ') || t('app.therapist.profile.noInfo')}
            </p>
            <p>
              <span className="font-semibold">{t('app.therapist.profile.languages')}</span>{' '}
              {profile.Languages?.join(', ') || t('app.therapist.profile.noInfo')}
            </p>
            {/* Note: Methodik & Information are not saved in your TherapistProfile GraphQL schema, so they are omitted here.
                If you need them, they must be fetched from the full Questionnaire JSON. */}
          </div>

          <div className="flex items-end justify-between mt-6">
            <div>
              <p className="font-semibold">{t('app.therapist.profile.availability')}</p>
              <p>{profile.Availability?.join(', ') || t('app.therapist.profile.notSpecified')}</p>
            </div>
            <button className="feelora-btn-primary">
              {t('app.therapist.profile.edit')}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;
