const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.feelora-dev.com';

export const presignedUrlService = {
  upload: async (
    idToken: string,
    fileName: string,
    contentType: string,
    visibility: string,
  ): Promise<{ url: string; fields: Record<string, string> }> => {
    const response = await fetch(`${AUTH_API_URL}/presigned/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: idToken,
      },
      body: JSON.stringify({ fileName, contentType, visibility }),
    });

    if (!response.ok) throw new Error(`Upload presign failed: ${response.status}`);

    const data = await response.json();
    return data.uploadPost;
  },

  download: async (
    idToken: string,
    imageId: string,
    visibility: string,
    ownerSub?: string,
  ): Promise<string> => {
    const params = new URLSearchParams({ imageId, visibility });
    if (ownerSub) params.append('ownerSub', ownerSub);

    const response = await fetch(`${AUTH_API_URL}/presigned/download?${params}`, {
      method: 'GET',
      headers: {
        Authorization: idToken,
      },
    });

    if (!response.ok) throw new Error(`Download presign failed: ${response.status}`);

    const data = await response.json();
    return data.downloadUrl;
  },
};
