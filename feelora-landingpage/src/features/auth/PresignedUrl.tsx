// PORTFOLIO DEMO MODE: the auth backend that issued presigned S3 URLs is
// offline, so the real requests below are commented out (not deleted) and the
// demo `presignedUrlService` at the bottom hands out generated avatars instead.
import { getAvatarUrl, getCurrentUserId } from '@/mocks/demo-store';

// const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.feelora-dev.com';
//
// export const presignedUrlService = {
//   upload: async (
//     idToken: string,
//     fileName: string,
//     contentType: string,
//     visibility: string,
//   ): Promise<{ url: string; fields: Record<string, string> }> => {
//     const response = await fetch(`${AUTH_API_URL}/presigned/upload`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: idToken,
//       },
//       body: JSON.stringify({ fileName, contentType, visibility }),
//     });
//
//     if (!response.ok) throw new Error(`Upload presign failed: ${response.status}`);
//
//     const data = await response.json();
//     return data.uploadPost;
//   },
//
//   download: async (
//     idToken: string,
//     imageId: string,
//     visibility: string,
//     ownerSub?: string,
//   ): Promise<string> => {
//     const params = new URLSearchParams({ imageId, visibility });
//     if (ownerSub) params.append('ownerSub', ownerSub);
//
//     const response = await fetch(`${AUTH_API_URL}/presigned/download?${params}`, {
//       method: 'GET',
//       headers: {
//         Authorization: idToken,
//       },
//     });
//
//     if (!response.ok) throw new Error(`Download presign failed: ${response.status}`);
//
//     const data = await response.json();
//     return data.downloadUrl;
//   },
// };

// --- Demo Service Object (portfolio mode — no network) --- //
export const DEMO_UPLOAD_URL_PREFIX = 'demo-upload://';

export const presignedUrlService = {
  upload: async (
    _idToken: string,
    fileName: string,
    _contentType: string,
    _visibility: string,
  ): Promise<{ url: string; fields: Record<string, string> }> => ({
    url: `${DEMO_UPLOAD_URL_PREFIX}${fileName}`,
    fields: {},
  }),

  // Only profile pictures exist in the demo; anything else (e.g. license
  // documents) behaves like a missing S3 object.
  download: async (_idToken: string, imageId: string, _visibility: string, ownerSub?: string): Promise<string> => {
    const url = imageId === 'profile' ? getAvatarUrl(ownerSub ?? getCurrentUserId()) : null;
    if (!url) throw new Error('Download presign failed: 404');
    return url;
  },
};
