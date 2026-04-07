import jarvisLogo from '@/assets/jarvis-app-icon.png';

type JarvisLogoProps = {
  size?: number;
  className?: string;
};

export const JarvisLogo = ({ size = 32, className }: JarvisLogoProps) => (
  <img
    src={jarvisLogo}
    width={size}
    height={size}
    alt="Jarvis"
    className={className}
    draggable={false}
  />
);
