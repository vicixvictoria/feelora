import { useState } from 'react';
import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

export const useS3Download = () => {
  const { download: getDownloadUrl } = usePresignedUrl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const download = async (imageId: string, visibility: string, ownerSub?: string) => {
    const presignedUrl = await getDownloadUrl(imageId, visibility, ownerSub);
    const localUrl = await s3Service.download(presignedUrl);
    setImageUrl(localUrl);
  };

  return { download, imageUrl };
};
