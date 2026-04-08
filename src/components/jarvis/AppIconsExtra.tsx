type IconProps = { className?: string; size?: number };

const s = (size?: number) => size || 20;

export const OperaGXIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#FA1E4E"/>
    <ellipse cx="24" cy="24" rx="10" ry="16" fill="none" stroke="white" strokeWidth="3"/>
    <ellipse cx="24" cy="24" rx="6" ry="12" fill="#FA1E4E"/>
    <ellipse cx="24" cy="24" rx="6" ry="12" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
);

export const VivaldiIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#EF3939"/>
    <path d="M24 8c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16S32.8 8 24 8zm0 4c6.6 0 12 5.4 12 12s-5.4 12-12 12S12 30.6 12 24 17.4 12 24 12z" fill="white" opacity="0.3"/>
    <path d="M18 18l6 14 6-14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EpicGamesIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#2F2D2E"/>
    <path d="M14 14h8v3h-5v4h4v3h-4v4h5v3h-8V14zm10 0h5c2.2 0 4 1.8 4 4v2c0 1.7-1 3-2.5 3.5L33 31h-3l-2.5-7H27v7h-3V14zm3 3v4h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2z" fill="white"/>
  </svg>
);

export const TeamsIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#5059C9"/>
    <circle cx="30" cy="16" r="5" fill="white" opacity="0.9"/>
    <circle cx="38" cy="18" r="3.5" fill="white" opacity="0.6"/>
    <rect x="10" y="14" width="22" height="20" rx="3" fill="white"/>
    <path d="M16 20h10v2H16zm0 4h7v2h-7z" fill="#5059C9"/>
    <rect x="28" y="18" width="10" height="12" rx="2" fill="white" opacity="0.5"/>
  </svg>
);

export const ZoomIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="10" fill="#2D8CFF"/>
    <rect x="10" y="14" width="20" height="16" rx="3" fill="white"/>
    <polygon points="32,18 40,14 40,34 32,30" fill="white"/>
  </svg>
);

export const PowerPointIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#D24726"/>
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">P</text>
  </svg>
);

export const AfterEffectsIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#00005B"/>
    <text x="13" y="30" fill="#9999FF" fontSize="16" fontWeight="bold" fontFamily="Arial">Ae</text>
  </svg>
);

export const BlenderIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#E87D0D"/>
    <ellipse cx="26" cy="26" rx="12" ry="10" fill="#265787"/>
    <ellipse cx="26" cy="26" rx="8" ry="6" fill="#E87D0D"/>
    <ellipse cx="26" cy="26" rx="4" ry="3" fill="white"/>
    <circle cx="26" cy="26" r="1.5" fill="#265787"/>
    <path d="M8 22l10 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const NotionIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="6" y="4" width="36" height="40" rx="4" fill="white" stroke="#333" strokeWidth="2"/>
    <path d="M14 12h10l8 2v22l-8-2H14V12z" fill="#333" opacity="0.1"/>
    <text x="18" y="30" fill="#333" fontSize="18" fontWeight="bold" fontFamily="serif">N</text>
  </svg>
);

export const FigmaIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="12" y="4" width="12" height="12" rx="6" fill="#F24E1E"/>
    <rect x="24" y="4" width="12" height="12" rx="6" fill="#FF7262"/>
    <rect x="12" y="16" width="12" height="12" rx="6" fill="#A259FF"/>
    <circle cx="30" cy="22" r="6" fill="#1ABCFE"/>
    <rect x="12" y="28" width="12" height="12" rx="6" fill="#0ACF83"/>
    <circle cx="24" cy="22" r="6" fill="#A259FF"/>
  </svg>
);

export const VLCIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <ellipse cx="24" cy="40" rx="18" ry="4" fill="#FF6600" opacity="0.4"/>
    <polygon points="24,4 16,36 32,36" fill="#FF6600"/>
    <polygon points="24,10 18,32 30,32" fill="white" opacity="0.4"/>
    <ellipse cx="24" cy="38" rx="16" ry="4" fill="#FF6600"/>
  </svg>
);

export const SpotifyWebIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#1DB954"/>
    <path d="M34.4 21.8c-5.8-3.4-15.4-3.8-20.9-2.1a1.5 1.5 0 1 1-.9-2.9c6.3-1.9 16.8-1.5 23.4 2.4a1.5 1.5 0 0 1-1.6 2.6zm-.4 4.6a1.3 1.3 0 0 1-1.8.4c-4.8-3-12.2-3.8-17.9-2.1a1.3 1.3 0 1 1-.7-2.4c6.5-2 14.6-1 20 2.3a1.3 1.3 0 0 1 .4 1.8zm-2 4.4a1 1 0 0 1-1.4.3c-4.2-2.6-9.5-3.1-15.8-1.7a1 1 0 1 1-.5-2c6.8-1.6 12.7-0.9 17.4 2a1 1 0 0 1 .3 1.4z" fill="white"/>
    <circle cx="38" cy="10" r="7" fill="#0e1117" stroke="#1DB954" strokeWidth="1.5"/>
    <polygon points="36,7 36,13 41,10" fill="#1DB954"/>
  </svg>
);
