import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

export const useS3Upload = () => {
  const { upload: getUploadUrl } = usePresignedUrl();

  const upload = async (file: File, visibility: string): Promise<void> => {
    const presignedUrl = await getUploadUrl(file.name, file.type, visibility);
    await s3Service.upload(presignedUrl, file);
  };

  return { upload };
};