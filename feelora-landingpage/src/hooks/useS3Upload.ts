import { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';

//everytime hook is used, folder name is provided (e.g., "avatars") and it returns an upload function that handles the upload logic, including path generation and error handling.
interface UploadOptions {
  folder: string; // e.g., "avatars"
  isPublic?: boolean; 
}

// Initalize the hooks internal state for tracking upload status and errors
export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main function to handle file uploads to S3
  const uploadFile = async (file: File, { folder, isPublic = true }: UploadOptions) => { // 1. Start upload process and reset error state, async because uploading can take time
    setIsUploading(true);
    setError(null);

    // 2. Generate a unique file path to prevent overwriting and ensure organization.
    try {
      const timestamp = Date.now(); // unique timestamp to prevent filename collisions
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-'); // sanitize filename to avoid issues with special characters
      
      // Define path explicitly. 
      // Example: "public/avatars/123-image.png" or "private/userId/avatars/123-image.png"
      const prefix = isPublic ? 'public/' : 'content/'; // Using 'content/' for private files is a common convention, but this can be adjusted based on the S3 bucket structure.
      const path = `${prefix}${folder}/${timestamp}-${cleanFileName}`; // Construct the full path for the file in S3 as final string


      // 3. Upload the file using Amplify's uploadData function, which handles the actual communication with S3. --> AWS Interaction
      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type, // Tells the browser if it's an image, pdf, etc., which can be important for how the file is handled when accessed.
        }
      }).result;

      return path; // Return the path of the uploaded file for later use (e.g., saving to a database)
      
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload file. Please try again.");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
}