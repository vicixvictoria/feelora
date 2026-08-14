import { useAuth } from '@/contexts/AuthContext'; // adjust path
import { presignedUrlService } from '@/features/auth/PresignedUrl';

export const usePresignedUrl = () => {
  const { idToken } = useAuth();

  return {
    upload: (fileName: string, contentType: string, visibility: string) => {
      if (!idToken) throw new Error('No id token available');
      return presignedUrlService.upload(idToken, fileName, contentType, visibility);
    },

    download: (imageId: string, visibility: string, ownerSub?: string) => {
      if (!idToken) throw new Error('No id token available');
      return presignedUrlService.download(idToken, imageId, visibility, ownerSub);
    },
  };
};
