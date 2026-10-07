import { useState, useEffect } from 'react';
// import { getUrl } from 'aws-amplify/storage'; // PORTFOLIO DEMO MODE: S3 is offline
import { Loader2, ImageOff } from 'lucide-react';

//Interface tells TypeScript that this component accepts all standard image attributes (like className, alt, onClick) plus a mandatory (but potentially null) imagePath.
interface S3ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imagePath: string | null | undefined;
}

//src holds the actual signed URL from S3, isLoading tracks whether we're currently fetching the image, and error indicates if something went wrong during the fetch.
export function S3Image({ imagePath, className, alt, ...props }: S3ImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 1. Reset states when the path changes
    setSrc(null);
    setError(false);

    // 2. Guard: If no path (empty), stop loading and exit
    if (!imagePath) {
      setIsLoading(false);
      return;
    }

    // PORTFOLIO DEMO MODE: S3 is offline — the real fetch below is commented
    // out, so every image falls back to the "image off" placeholder.
    setError(true);
    setIsLoading(false);

    // // 3. Type Narrowing: Create a local constant.
    // // TypeScript now knows 'validatedPath' is strictly a string.
    // const validatedPath = imagePath;
    // let isMounted = true; //cleanup flag to prevent state updates on unmounted component
    //
    // // 4. Async function to fetch the signed URL from S3 using Amplify's getUrl method.
    // async function fetchImage() {
    //   try {
    //     setIsLoading(true);
    //
    //     // This now matches Overload 1 (GetUrlWithPathInput)
    //     const result = await getUrl({
    //       path: validatedPath,
    //       options: {
    //         validateObjectExistence: true, // makes the call faile if the file doesn't exist
    //       },
    //     });
    //
    //     if (isMounted) setSrc(result.url.toString()); //Converts the AWS URL object into a string for the <img src="...">
    //   } catch (err) {
    //     console.error(`Failed to load image:`, err);
    //     if (isMounted) setError(true);
    //   } finally {
    //     if (isMounted) setIsLoading(false);
    //   }
    // }
    //
    // fetchImage();
    //
    // return () => {
    //   isMounted = false;
    // };
  }, [imagePath]);

  // UI States - Conditional Rendering based on loading and error states
  if (isLoading) {
    // 1. Show a loading spinner while the image is being fetched from S3
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !src) {
    // 2. If there was an error fetching the image (e.g., file doesn't exist, network issue), show a placeholder with an "image off" icon.
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <ImageOff className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} {...props} />;
}
