export const s3Service = {
  upload: async (presignedUrl: string, file: File): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
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
