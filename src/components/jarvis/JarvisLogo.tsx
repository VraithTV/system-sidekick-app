type JarvisLogoProps = {
  size?: number;
  className?: string;
};

export const JarvisLogo = ({ size = 32, className }: JarvisLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer hexagonal ring */}
    <path
      d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      opacity="0.4"
    />
    {/* Inner hexagon */}
    <path
      d="M16 7L24 11.5V20.5L16 25L8 20.5V11.5L16 7Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
      opacity="0.7"
    />
    {/* Core circle */}
    <circle cx="16" cy="16" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" opacity="0.9" />
    {/* Center dot */}
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    {/* Connection lines */}
    <line x1="16" y1="12" x2="16" y2="7" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="16" y1="20" x2="16" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="12.5" y1="14" x2="8" y2="11.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="19.5" y1="14" x2="24" y2="11.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="12.5" y1="18" x2="8" y2="20.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="19.5" y1="18" x2="24" y2="20.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
  </svg>
);
