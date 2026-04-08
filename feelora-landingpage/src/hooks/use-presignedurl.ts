import { useAuth } from '@/contexts/AuthContext'; // adjust path
import { presignedUrlService } from '@/features/auth/PresignedUrl';

export const usePresignedUrl = () => {
  const { idToken } = useAuth();
  if (!idToken) throw new Error('No id token available');

  return {
    upload: (fileName: string, contentType: string, visibility: string) =>
      presignedUrlService.upload(idToken, fileName, contentType, visibility),

    download: (imageId: string, visibility: string, ownerSub?: string) =>
      presignedUrlService.download(idToken, imageId, visibility, ownerSub),
  };
};
