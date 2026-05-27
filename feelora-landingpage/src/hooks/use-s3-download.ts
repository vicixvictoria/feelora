import { useState, useRef } from 'react';
import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

// Session-level cache for S3 blob URLs. Images are not sensitive and are
// expensive to retrieve (presigned URL request + S3 download), so we cache
// them for the lifetime of the page session.
const _s3BlobCache = new Map<string, string>();

export const useS3Download = () => {
  const { download: getDownloadUrl } = usePresignedUrl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const currentKeyRef = useRef<string | null>(null);

  const download = async (imageId: string, visibility: string, ownerSub?: string) => {
    const key = `${imageId}::${ownerSub ?? ''}`;
    currentKeyRef.current = key;

    const cached = _s3BlobCache.get(key);
    if (cached) {
      setImageUrl(cached);
      return;
    }

    setImageUrl(null); // Clear stale image immediately before fetching

    try {
      const imageIdWithoutExt = imageId.replace(/\.[^/.]+$/, '');
      const presignedUrl = await getDownloadUrl(imageIdWithoutExt, visibility, ownerSub);
      const localUrl = await s3Service.download(presignedUrl);
      // Ignore result if a newer download has already started
      if (currentKeyRef.current === key) {
        _s3BlobCache.set(key, localUrl);
        setImageUrl(localUrl);
      }
    } catch {
      // Leave as null so the caller's fallback/placeholder renders
    }
  };

  return { download, imageUrl };
};
