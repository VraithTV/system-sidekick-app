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

// ── Gaming Icons ──

export const FortniteIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#00A3E0"/>
    <path d="M16 12h16v4h-12v6h10v4h-10v10h-4V12z" fill="white"/>
  </svg>
);

export const MinecraftIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" fill="#8B6914"/>
    <rect x="4" y="4" width="40" height="20" fill="#5D8C2F"/>
    <rect x="12" y="8" width="8" height="4" fill="#3B5E1E"/>
    <rect x="28" y="12" width="8" height="4" fill="#3B5E1E"/>
    <rect x="16" y="24" width="4" height="4" fill="#6B4F12"/>
    <rect x="28" y="28" width="4" height="4" fill="#6B4F12"/>
    <rect x="8" y="32" width="4" height="4" fill="#7A5C15"/>
  </svg>
);

export const GTAIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#0B0E13"/>
    <text x="24" y="22" textAnchor="middle" fill="#B8D432" fontSize="10" fontWeight="bold" fontFamily="Arial">GTA</text>
    <text x="24" y="36" textAnchor="middle" fill="#B8D432" fontSize="14" fontWeight="bold" fontFamily="Arial">V</text>
  </svg>
);

export const FiveMIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#F40552"/>
    <text x="24" y="32" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">5M</text>
  </svg>
);

export const ValorantIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#FF4655"/>
    <path d="M12 14l10 20h5L17 14h-5zm14 0v20h4V18l6 16h4L32 14h-6z" fill="white"/>
  </svg>
);

export const LeagueIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#091428"/>
    <path d="M14 10v28h8v-4h-4V14h4v-4H14zm12 0v4h4v20h-4v4h8V10h-8z" fill="#C89B3C"/>
  </svg>
);

export const ApexIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#CD3333"/>
    <path d="M24 10L12 38h6l6-14 6 14h6L24 10z" fill="white"/>
  </svg>
);

export const CSGOIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#DE9B35"/>
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">CS2</text>
  </svg>
);

export const RobloxIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#E2231A"/>
    <rect x="10" y="10" width="28" height="28" rx="2" fill="none" stroke="white" strokeWidth="3"/>
    <rect x="18" y="18" width="12" height="12" rx="1" fill="white"/>
    <rect x="22" y="22" width="4" height="4" fill="#E2231A"/>
  </svg>
);

export const OverwatchIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#FA9C1E"/>
    <circle cx="24" cy="24" r="12" fill="white"/>
    <circle cx="24" cy="24" r="8" fill="#FA9C1E"/>
    <circle cx="24" cy="24" r="4" fill="white"/>
    <path d="M8 24h8m16 0h8" stroke="white" strokeWidth="3"/>
    <path d="M24 8v8m0 16v8" stroke="white" strokeWidth="3"/>
  </svg>
);

export const RocketLeagueIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#0078F2"/>
    <circle cx="24" cy="24" r="12" fill="none" stroke="white" strokeWidth="2.5"/>
    <path d="M18 30l6-12 6 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="24" r="3" fill="white"/>
  </svg>
);

export const WarzoneIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#2D4F1E"/>
    <text x="24" y="30" textAnchor="middle" fill="#C5D93F" fontSize="12" fontWeight="bold" fontFamily="Arial">WZ</text>
  </svg>
);

export const BattleNetIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#00AEFF"/>
    <path d="M24 10c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14-6.3-14-14-14zm0 4c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" fill="white" opacity="0.4"/>
    <path d="M20 18h4l4 12h-4l-1-3h-4l-1 3h-2l4-12zm2 2.5l-1.5 4.5h3L22 20.5z" fill="white"/>
  </svg>
);

export const EAAppIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#000"/>
    <text x="24" y="32" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial">EA</text>
  </svg>
);

export const UbisoftIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#0070FF"/>
    <circle cx="24" cy="24" r="14" fill="none" stroke="white" strokeWidth="3"/>
    <circle cx="24" cy="14" r="3" fill="white"/>
  </svg>
);

export const XboxIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#107C10"/>
    <path d="M24 8a16 16 0 0 0-8 2.5c2 1 5 4 8 8 3-4 6-7 8-8A16 16 0 0 0 24 8z" fill="white" opacity="0.8"/>
    <path d="M12 16c-2 3-4 7-4 10a16 16 0 0 0 10 14c-2-3-5-9-6-14-.5-4 0-8 0-10z" fill="white" opacity="0.6"/>
    <path d="M36 16c2 3 4 7 4 10a16 16 0 0 1-10 14c2-3 5-9 6-14 .5-4 0-8 0-10z" fill="white" opacity="0.6"/>
  </svg>
);

export const GeForceNowIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#76B900"/>
    <path d="M14 24c0-5.5 4.5-10 10-10v4c-3.3 0-6 2.7-6 6s2.7 6 6 6v4c-5.5 0-10-4.5-10-10z" fill="white"/>
    <path d="M24 14v4c3.3 0 6 2.7 6 6h4c0-5.5-4.5-10-10-10z" fill="white" opacity="0.7"/>
    <circle cx="30" cy="24" r="4" fill="white"/>
  </svg>
);

export const StreamlabsIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="10" fill="#80F5D2"/>
    <circle cx="24" cy="24" r="10" fill="#09161D"/>
    <circle cx="24" cy="24" r="5" fill="#80F5D2"/>
  </svg>
);

export const DaVinciIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#233040"/>
    <circle cx="24" cy="24" r="12" fill="none" stroke="#EE7B30" strokeWidth="3"/>
    <circle cx="24" cy="24" r="6" fill="#EE7B30"/>
    <circle cx="24" cy="24" r="2" fill="#233040"/>
  </svg>
);

export const CapCutIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="10" fill="#000"/>
    <circle cx="20" cy="28" r="8" fill="none" stroke="white" strokeWidth="2.5"/>
    <circle cx="20" cy="28" r="3" fill="white"/>
    <path d="M28 20l10-8v24l-10-8z" fill="white"/>
  </svg>
);
