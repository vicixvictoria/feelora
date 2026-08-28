// Shared avatar component wrapping useS3Download — previously duplicated
// nearly verbatim across TherapistPatientsPage, TherapistMoodTrackerPage,
// TherapistHomeworkPage, TherapistProfilePage, TherapistChat, and the
// patient ChatPage. Resolves a user's uploaded profile picture from S3
// (falling back to a placeholder while it loads or if they have none) — the
// hook's own module-level cache means repeat renders of the same userId
// across the app reuse the already-downloaded image instead of re-fetching.
import { useEffect } from 'react';
import { useS3Download } from '@/hooks/use-s3-download';

interface S3AvatarProps {
  // Whose photo to fetch. When absent, no fetch happens and fallbackSrc
  // renders — matches every current call site's behavior (an unknown/
  // not-yet-loaded person just shows the placeholder, nothing is fetched).
  userId?: string;
  fallbackSrc: string;
  className: string;
  alt?: string;
  // Rarely needed — every current caller fetches the 'profile' image at
  // 'public' visibility, but both are left overridable rather than hardcoded.
  imageId?: string;
  visibility?: string;
}

export const S3Avatar = ({
  userId,
  fallbackSrc,
  className,
  alt = '',
  imageId = 'profile',
  visibility = 'public',
}: S3AvatarProps) => {
  const { download, imageUrl } = useS3Download();

  useEffect(() => {
    if (!userId) return;
    download(imageId, visibility, userId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, imageId, visibility]);

  return <img src={imageUrl || fallbackSrc} alt={alt} className={className} />;
};
