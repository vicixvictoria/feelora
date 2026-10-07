// Generated initials avatars for the demo people — stand-ins for the profile
// pictures that used to come from S3 (see use-s3-download / S3Avatar), so the
// portfolio screenshots show distinct faces-in-a-circle instead of the grey
// placeholder everywhere.

// Soft tones that sit well next to the Feelora teal/lavender palette.
const PALETTE: Array<{ background: string; foreground: string }> = [
  { background: '#CDEFE8', foreground: '#1F7A6B' }, // teal
  { background: '#E4DCF7', foreground: '#5B4A8B' }, // lavender
  { background: '#FBE3D6', foreground: '#A0532D' }, // peach
  { background: '#D9E8FA', foreground: '#2F5C8F' }, // sky
  { background: '#F7DCE6', foreground: '#9A3B62' }, // rose
  { background: '#E6F0D5', foreground: '#55723A' }, // sage
];

const hash = (value: string): number =>
  [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

export const createInitialsAvatar = (fullName: string, seed: string = fullName): string => {
  const initials = fullName
    .split(' ')
    .filter((part) => part && !part.endsWith('.')) // skip titles like "Dr."
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join('');
  const { background, foreground } = PALETTE[hash(seed) % PALETTE.length]!;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${background}"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="104" font-weight="600" fill="${foreground}">${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
