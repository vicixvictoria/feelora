import { useAuth } from '@/contexts/AuthContext'; // adjust path
import { presignedUrlService } from '@/features/auth/PresignedUrl';

export const usePresignedUrl = () => {
  const { accessToken } = useAuth();
  if (!accessToken) throw new Error('No access token available');

  return {
    upload: (fileName: string, contentType: string, visibility: string) =>
      presignedUrlService.upload(accessToken, fileName, contentType, visibility),

    download: (imageId: string, visibility: string, ownerSub?: string) =>
      presignedUrlService.download(accessToken, imageId, visibility, ownerSub),
  };
};
