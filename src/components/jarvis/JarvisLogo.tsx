import jarvisIcon from '@/assets/jarvis-icon-square.png';

type JarvisLogoProps = {
  size?: number;
  className?: string;
  /** When true, the logo stays its original colour instead of following the accent */
  static?: boolean;
};

export const JarvisLogo = ({ size = 32, className, static: isStatic }: JarvisLogoProps) => (
  <div
    className={className}
    style={{ width: size, height: size, position: 'relative' }}
  >
    <img
      src={jarvisIcon}
      width={size}
      height={size}
      alt="Jarvis"
      draggable={false}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
    {/* Accent colour overlay using mix-blend-mode (skipped when static) */}
    {!isStatic && (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'hsl(var(--primary))',
          mixBlendMode: 'color',
          pointerEvents: 'none',
        }}
      />
    )}
  </div>
);
