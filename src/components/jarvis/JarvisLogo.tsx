import jarvisLogo from '@/assets/jarvis-app-icon.png';

type JarvisLogoProps = {
  size?: number;
  className?: string;
  /** When true, the logo stays its original colour instead of following the accent */
  static?: boolean;
};

export const JarvisLogo = ({ size = 32, className, static: isStatic }: JarvisLogoProps) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: isStatic ? undefined : 'hsl(var(--primary))',
      WebkitMaskImage: isStatic ? undefined : `url(${jarvisLogo})`,
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskImage: isStatic ? undefined : `url(${jarvisLogo})`,
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    }}
  >
    {isStatic && (
      <img
        src={jarvisLogo}
        width={size}
        height={size}
        alt="Jarvis"
        draggable={false}
      />
    )}
  </div>
);
