import { useState, useRef } from 'react';
import { usePresignedUrl } from './use-presignedurl';
import { s3Service } from '@/features/s3/s3Service';

// Session-level cache for S3 blob URLs. null = confirmed no image (404/403),
// string = blob URL of the downloaded image.
const _s3BlobCache = new Map<string, string | null>();

// In-flight request dedup: if the same image is requested from multiple
// components before the first fetch resolves (e.g. the same person's avatar
// rendered in a sidebar and a list at once), they all await this one shared
// promise instead of each firing their own presigned-URL + download request.
// Cleared once the fetch settles, whether it succeeds or fails — only the
// result cache above is kept long-term.
const _inFlightDownloads = new Map<string, Promise<string | null>>();

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

    // Join an already-running fetch for this same key rather than starting a
    // second one; kick off a new one otherwise.
    let pending = _inFlightDownloads.get(key);
    if (!pending) {
      pending = (async () => {
        try {
          const imageIdWithoutExt = imageId.replace(/\.[^/.]+$/, '');
          const presignedUrl = await getDownloadUrl(imageIdWithoutExt, visibility, ownerSub);
          const localUrl = await s3Service.download(presignedUrl);
          _s3BlobCache.set(key, localUrl);
          return localUrl;
        } catch {
          // Cache the failure so we don't retry on every re-render
          _s3BlobCache.set(key, null);
          return null;
        } finally {
          _inFlightDownloads.delete(key);
        }
      })();
      _inFlightDownloads.set(key, pending);
    }

    const result = await pending;
    // Ignore the result if a newer download has already started on this hook
    // instance (e.g. the userId prop changed while this one was in flight).
    if (currentKeyRef.current === key) {
      setImageUrl(result);
    }
  };

  return { download, imageUrl };
};
