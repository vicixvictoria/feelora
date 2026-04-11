import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { useQuery } from '@apollo/client'; // 1. Import useQuery
import { GET_OWN_THERAPIST_PROFILE_QUERY } from '../api/therapist-service'; // 2. Import the query
import { useS3Download } from '@/hooks/use-s3-download';

// --- Smart S3 Avatar Component ---
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
      download('profile.jpg', 'public', userId).catch(() => {});
    } else {
      download('profile.jpg', 'public').catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

const TherapistProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 3. Replace useEffect and useState with the reactive useQuery hook!
  const { data, loading: isLoading, error } = useQuery(GET_OWN_THERAPIST_PROFILE_QUERY);

  // Extract the profile from the query result
  const profile = data?.getOwnTherapistProfile;

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
        {error ? t('app.therapist.profile.loadError') : t('app.therapist.profile.noProfile')}
      </div>
    );
  }

  const age = profile.BirthDate
    ? Math.floor((Date.now() - profile.BirthDate * 1000) / 31557600000)
    : 'k.A.';

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.profile.title')}
      </h1>

      <div className="feelora-card w-full">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
          <S3Avatar
            fallbackSrc={avatarPlaceholder}
            className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
            alt={`${profile.Name} ${profile.Surname}`}
          />
          <div className="flex-1 pl-1 sm:pl-0">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              {profile.Title ? `${profile.Title} ` : ''}
              {profile.Name} {profile.Surname}
            </h2>
            <div className="space-y-0.5 text-foreground">
              <p>
                <strong>{t('app.therapist.profile.age')}</strong> {age}
              </p>
              <p>
                <strong>{t('app.therapist.profile.city')}</strong> {profile.City}
              </p>
              {profile.Address && (
                <p>
                  <strong>{t('app.therapist.profile.address')}</strong> {profile.Address}
                </p>
              )}
              <p>
                <strong>{t('app.therapist.profile.role')}</strong>{' '}
                {profile.JobTitle || t('app.therapist.profile.therapist')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-foreground">
          <div>
            <p>
              <span className="font-bold">{t('app.therapist.profile.specializedIn')}</span>{' '}
              {profile.Specialties?.join(', ') || t('app.therapist.profile.noInfo')}
            </p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.languages')}</span>{' '}
              {profile.Languages?.join(', ') || t('app.therapist.profile.noInfo')}
            </p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.priceRange')}</span>{' '}
              {profile.PriceRange || t('app.therapist.profile.noPriceRange')}
            </p>
            <p>
              <span className="font-bold">{t('app.therapist.profile.hasInsurance')}</span>{' '}
              {profile.HasInsurance
                ? t('app.therapist.profile.insuranceYes')
                : t('app.therapist.profile.insuranceNo')}
            </p>
            <div className="flex items-end gap-4 mt-2">
              <p className="mb-0">
                <span className="font-bold">{t('app.therapist.profile.availability')}</span>{' '}
                {profile.Availability?.join(', ') || t('app.therapist.profile.noInfo')}
              </p>
              <div className="flex-1"></div>
              <button
                onClick={() => navigate('edit')}
                className="feelora-btn-primary flex items-center justify-center"
              >
                {t('app.therapist.profile.edit')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;
