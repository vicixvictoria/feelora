import { useState, useRef } from 'react';
import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

export const useS3Download = () => {
  const { download: getDownloadUrl } = usePresignedUrl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const currentKeyRef = useRef<string | null>(null);

  const download = async (imageId: string, visibility: string, ownerSub?: string) => {
    const key = `${imageId}::${ownerSub ?? ''}`;
    currentKeyRef.current = key;
    setImageUrl(null); // Clear stale image immediately before fetching

    try {
      const imageIdWithoutExt = imageId.replace(/\.[^/.]+$/, '');
      const presignedUrl = await getDownloadUrl(imageIdWithoutExt, visibility, ownerSub);
      const localUrl = await s3Service.download(presignedUrl);
      // Ignore result if a newer download has already started
      if (currentKeyRef.current === key) {
        setImageUrl(localUrl);
      }
    } catch {
      // Leave as null so the caller's fallback/placeholder renders
    }
  };

  return { download, imageUrl };
};
