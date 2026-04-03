const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.feelora-dev.com';

export const presignedUrlService = {
  upload: async (
    accessToken: string,
    fileName: string,
    contentType: string,
    visibility: string
  ): Promise<string> => {
    const response = await fetch(`${AUTH_API_URL}/presigned/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,  
      },
      body: JSON.stringify({ fileName, contentType, visibility }),
    });

    if (!response.ok) throw new Error(`Upload presign failed: ${response.status}`);

    const data = await response.json();
    return data.body.uploadUrl;
  },

  download: async (
    accessToken: string,
    imageId: string,
    visibility: string,
    ownerSub?: string       
  ): Promise<string> => {
    const params = new URLSearchParams({ imageId, visibility });
    if (ownerSub) params.append('ownerSub', ownerSub); 

    const response = await fetch(`${AUTH_API_URL}/presigned/download?${params}`, {
      method: 'GET',                                  
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error(`Download presign failed: ${response.status}`);

    const data = await response.json();
    return data.body.downloadUrl;
  },
};