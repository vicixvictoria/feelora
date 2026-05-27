import { useState, useRef } from 'react';
import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

// Session-level cache for S3 blob URLs. null = confirmed no image (404/403),
// string = blob URL of the downloaded image.
const _s3BlobCache = new Map<string, string | null>();

export const useS3Download = () => {
  const { download: getDownloadUrl } = usePresignedUrl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const currentKeyRef = useRef<string | null>(null);

  const download = async (imageId: string, visibility: string, ownerSub?: string) => {
    const key = `${imageId}::${ownerSub ?? ''}`;
    currentKeyRef.current = key;

    // Cache hit: includes null (no image) so we never retry a known-missing image
    if (_s3BlobCache.has(key)) {
      setImageUrl(_s3BlobCache.get(key) ?? null);
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
      // Cache the failure so we don't retry on every re-render
      _s3BlobCache.set(key, null);
      // Leave imageUrl as null so the caller's fallback/placeholder renders
    }
  };

  return { download, imageUrl };
};
