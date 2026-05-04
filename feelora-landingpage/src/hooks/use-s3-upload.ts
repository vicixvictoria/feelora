import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

export const useS3Upload = () => {
  const { upload: getUploadUrl } = usePresignedUrl();

  const upload = async (file: File, visibility: string): Promise<void> => {
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const presignedPost = await getUploadUrl(fileNameWithoutExt, file.type, visibility);
    await s3Service.upload(presignedPost, file);
  };

  return { upload };
};
