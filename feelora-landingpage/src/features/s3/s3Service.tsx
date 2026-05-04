export const s3Service = {
  upload: async (presignedPost: { url: string; fields: Record<string, string> }, file: File): Promise<void> => {
    const formData = new FormData();
    Object.entries(presignedPost.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    const response = await fetch(presignedPost.url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(`S3 upload failed: ${response.status}`);
  },

  download: async (presignedUrl: string): Promise<string> => {
    const response = await fetch(presignedUrl);
    if (!response.ok) throw new Error(`S3 download failed: ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};
