// src/components/S3UploadButton.tsx
import { useS3Upload } from '@/hooks/use-s3-upload';

interface Props {
  visibility: string;
  label?: string;
  className?: string;
  onSuccess?: () => void;
}

export const S3UploadButton = ({ visibility, label = 'Upload', className, onSuccess }: Props) => {
  const { upload } = useS3Upload();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file, visibility);
    onSuccess?.();
  };

  return (
    <label className={className}>
      {label}
      <input type="file" hidden onChange={handleChange} />
    </label>
  );
};