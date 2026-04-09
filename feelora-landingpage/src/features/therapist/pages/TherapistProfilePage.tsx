import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { therapistService } from '../api/therapist-service';
import { TherapistProfile } from '../types/profiles';
import { useS3Download } from '@/hooks/use-s3-download'; 

// 3. S3 Avatar Component
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
      // Missing ownerSub means it automatically fetches the logged-in user!
      download('profile.jpg', 'public').catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};

const TherapistProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch therapist profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
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

  const age = profile.BirthDate
    ? Math.floor((Date.now() - profile.BirthDate * 1000) / 31557600000)
    : 'k.A.';

  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.profile.title')}
      </h1>

      <div className="feelora-card">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
          {/* Use the S3Avatar for the therapist */}
          <S3Avatar
            fallbackSrc={avatarPlaceholder}
            className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover mx-auto sm:mx-0"
            alt={`${profile.Name} ${profile.Surname}`}
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              {profile.Title ? `${profile.Title} ` : ''}{profile.Name} {profile.Surname}
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
                {t('app.therapist.profile.role')} {profile.JobTitle || t('app.therapist.profile.therapist')}
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
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
            <div>
              <p className="font-semibold">{t('app.therapist.profile.availability')}</p>
              <p>{profile.Availability?.join(', ') || t('app.therapist.profile.notSpecified')}</p>
            </div>
            {/* Edit button navigation */}
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
  );
};

export default TherapistProfilePage;