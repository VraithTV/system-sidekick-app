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
    <path
      d="M16 3.5L26 9.25V22.75L16 28.5L6 22.75V9.25L16 3.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      opacity="0.35"
    />
    <path
      d="M12 8.5H20.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M20.5 8.5V18.25C20.5 22.83 17.96 25 14.25 25C11.59 25 9.65 23.89 8.5 21.6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="22.2" cy="10.2" r="1.6" fill="currentColor" />
    <path
      d="M16 6.9L22.8 10.8V21.2L16 25.1L9.2 21.2V17"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      opacity="0.2"
    />
  </svg>
);
