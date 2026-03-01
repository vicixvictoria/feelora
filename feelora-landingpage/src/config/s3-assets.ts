/**
 * Public S3 asset URLs
 *
 * Images stored under the `public/` prefix in the S3 bucket are
 * publicly readable via bucket policy — no presigned URL required.
 *
 * The base URL is configured per-environment via VITE_S3_PUBLIC_URL.
 */
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME as string;
const S3_PUBLIC_URL = `https://${S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/public`;

export const S3_LOGO = `${S3_PUBLIC_URL}/logo.png`;
export const S3_LOGO_FEELORA = `${S3_PUBLIC_URL}/logo_feelora.png`;
