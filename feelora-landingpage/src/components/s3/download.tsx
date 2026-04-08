// src/components/S3DownloadButton.tsx
import { useS3Download } from '@/hooks/use-s3-download';

interface Props {
  imageId: string;
  visibility: string;
  ownerSub?: string;
  label?: string;
  className?: string;
}

export const S3DownloadButton = ({
  imageId,
  visibility,
  ownerSub,
  label = 'Download',
  className,
}: Props) => {
  const { download, imageUrl } = useS3Download();

  return (
    <div>
      <button className={className} onClick={() => download(imageId, visibility, ownerSub)}>
        {label}
      </button>
      {imageUrl && <img src={imageUrl} alt="downloaded" />}
    </div>
  );
};
