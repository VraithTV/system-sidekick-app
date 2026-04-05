type IconProps = { className?: string; size?: number };

const s = (size?: number) => size || 20;

export const ChromeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#4285F4"/>
    <path d="M24 14h18.5a22 22 0 0 1-9.25 25.75L24 24z" fill="#EA4335"/>
    <path d="M24 14H6.5a22 22 0 0 0 2.75 25.75L24 24z" fill="#34A853"/>
    <path d="M33.25 39.75L24 24 9.25 39.75a22 22 0 0 0 24 0z" fill="#FBBC05"/>
    <circle cx="24" cy="24" r="8" fill="white"/>
    <circle cx="24" cy="24" r="6" fill="#4285F4"/>
  </svg>
);

export const EdgeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <defs>
      <linearGradient id="edge1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#1EC4E8"/>
      </linearGradient>
    </defs>
    <path d="M24 4C13 4 4 13 4 24c0 5 1.8 9.5 4.8 13 2-4 6.5-6.8 11.7-6.8 4.5 0 8.4 2 10.5 5.2A20 20 0 0 0 44 24C44 13 35 4 24 4z" fill="url(#edge1)"/>
    <path d="M20.5 30.2c-5.2 0-9.7 2.8-11.7 6.8A20 20 0 0 0 24 44c7 0 13-3.6 16.5-9-2.5 0-10-0.3-12.5-1.5-2.5-1.2-7.5-3.3-7.5-3.3z" fill="#1EC4E8"/>
  </svg>
);

export const FirefoxIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <defs>
      <linearGradient id="ff1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF980E"/>
        <stop offset="50%" stopColor="#FF3750"/>
        <stop offset="100%" stopColor="#9059FF"/>
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" fill="url(#ff1)"/>
    <path d="M35 15c-1-3-4-5-4-5s1 2 0.5 4c-1-2-3-3.5-7-6-5 4-3 10-1 13-2-1-4-3-4.5-5-1 2-1.5 5 0 8 2 4 6 7 11 7.5 6 0.5 10-3 11.5-7 1-3 0.5-6-1.5-8-1-1.5-2.5-2-5-1.5z" fill="white" opacity="0.9"/>
  </svg>
);

export const BraveIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <defs>
      <linearGradient id="brave1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF5500"/>
        <stop offset="100%" stopColor="#FF2000"/>
      </linearGradient>
    </defs>
    <path d="M38 12l-3-6h-4l2-2h-18l2 2h-4l-3 6 2 3-2 8 8 16 6 3 6-3 8-16-2-8z" fill="url(#brave1)"/>
    <path d="M24 10l-8 4 2 10 6 8 6-8 2-10z" fill="white" opacity="0.3"/>
    <path d="M24 16l-4 3 1 6 3 4 3-4 1-6z" fill="white" opacity="0.6"/>
  </svg>
);

export const SpotifyIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#1DB954"/>
    <path d="M34.4 21.8c-5.8-3.4-15.4-3.8-20.9-2.1a1.5 1.5 0 1 1-.9-2.9c6.3-1.9 16.8-1.5 23.4 2.4a1.5 1.5 0 0 1-1.6 2.6zm-.4 4.6a1.3 1.3 0 0 1-1.8.4c-4.8-3-12.2-3.8-17.9-2.1a1.3 1.3 0 1 1-.7-2.4c6.5-2 14.6-1 20 2.3a1.3 1.3 0 0 1 .4 1.8zm-2 4.4a1 1 0 0 1-1.4.3c-4.2-2.6-9.5-3.1-15.8-1.7a1 1 0 1 1-.5-2c6.8-1.6 12.7-0.9 17.4 2a1 1 0 0 1 .3 1.4z" fill="white"/>
  </svg>
);

export const DiscordIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#5865F2"/>
    <path d="M32.5 16.5a22 22 0 0 0-5.5-1.7l-.3.6a20 20 0 0 0-5.4 0l-.3-.6a22 22 0 0 0-5.5 1.7 23 23 0 0 0-4 15.2 22 22 0 0 0 6.7 3.4l.5-.7.5-.8a14 14 0 0 1-2.2-1.1l.5-.4a15.6 15.6 0 0 0 13.4 0l.5.4a14 14 0 0 1-2.2 1.1l.5.8.5.7a22 22 0 0 0 6.7-3.4 23 23 0 0 0-4-15.2zM19.5 28.5c-1.3 0-2.5-1.2-2.5-2.8s1.1-2.8 2.5-2.8 2.5 1.2 2.5 2.8-1.1 2.8-2.5 2.8zm9 0c-1.3 0-2.5-1.2-2.5-2.8s1.1-2.8 2.5-2.8 2.5 1.2 2.5 2.8-1.1 2.8-2.5 2.8z" fill="white"/>
  </svg>
);

export const TelegramIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#2AABEE"/>
    <path d="M10.5 23.5l22-9c1-.4 2 .2 1.7 1.3l-3.5 18c-.3 1.2-1 1.5-2 .9l-5.5-4-2.7 2.6c-.3.3-.6.5-1 .5l.4-5.7 10.3-9.3c.4-.4-.1-.6-.7-.2l-12.7 8-5.5-1.7c-1.2-.4-1.2-1.2.2-1.8z" fill="white"/>
  </svg>
);

export const WhatsAppIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#25D366"/>
    <path d="M34 28c-.5-1-2.5-1.5-2.5-1.5s-1.5-.5-2 .5c-.5 1-1.5 2-2 2.5-.5.5-1 .5-2 0s-3-1.5-5-4c-1.5-2-2.5-4-3-5-.5-1 0-1.5.5-2l1-1c.5-.5.5-1 .5-1.5s-1.5-4-2-5c-.5-1-1-1-1.5-1h-1.5c-.5 0-1.5.5-2 1-1 1-2.5 2.5-2.5 5.5s2 6 2.5 6.5c.5.5 5 8 12.5 10.5 7.5 2.5 7.5 1.5 9 1.5s4-2 4.5-3.5c.5-1.5.5-3 0-3.5z" fill="white"/>
  </svg>
);

export const SlackIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#4A154B"/>
    <path d="M18 28a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 2 2h-2v-2z" fill="#E01E5A"/>
    <path d="M21 18a2 2 0 1 1 2 2v-2h-2zm0-1a2 2 0 1 1-2-2v2h2z" fill="#36C5F0"/>
    <path d="M31 21a2 2 0 1 1 2 2h-2v-2zm-1 0a2 2 0 1 1-2-2h2v2z" fill="#2EB67D"/>
    <path d="M28 31a2 2 0 1 1-2-2v2h2zm0-1a2 2 0 1 1 2 2v-2h-2z" fill="#ECB22E"/>
  </svg>
);

export const ZoomIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#2D8CFF"/>
    <rect x="10" y="16" width="20" height="16" rx="3" fill="white"/>
    <path d="M32 20l6-3v14l-6-3z" fill="white"/>
  </svg>
);

export const OBSIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#302E31"/>
    <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2.5" fill="none"/>
    <circle cx="24" cy="24" r="6" fill="white"/>
    <circle cx="24" cy="14" r="2.5" fill="white"/>
    <circle cx="24" cy="34" r="2.5" fill="white"/>
    <circle cx="14" cy="24" r="2.5" fill="white"/>
    <circle cx="34" cy="24" r="2.5" fill="white"/>
  </svg>
);

export const SteamIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <defs>
      <linearGradient id="steam1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#171A21"/>
        <stop offset="100%" stopColor="#1B2838"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="10" fill="url(#steam1)"/>
    <circle cx="28" cy="18" r="6" stroke="#66C0F4" strokeWidth="2" fill="none"/>
    <circle cx="28" cy="18" r="3" fill="#66C0F4"/>
    <circle cx="18" cy="32" r="4" stroke="#66C0F4" strokeWidth="2" fill="none"/>
    <circle cx="18" cy="32" r="1.5" fill="#66C0F4"/>
    <line x1="18" y1="32" x2="28" y2="18" stroke="#66C0F4" strokeWidth="1.5"/>
  </svg>
);

export const EpicIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#2F2F2F"/>
    <path d="M14 14h6v2h-4v5h3v2h-3v5h4v2h-6zM22 14h4c2.5 0 3.5 2 3.5 4s-1 4-3.5 4h-2v8h-2zm2 2v4h2c1 0 1.5-1 1.5-2s-.5-2-1.5-2zM31 14h2v16h-2z" fill="white"/>
  </svg>
);

export const VSCodeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <path d="M35 6l8 4v28l-8 4-18-14L8 35l-3-3V16l3-3 9 7z" fill="#007ACC"/>
    <path d="M35 6v36l-18-14L8 35l-3-3V16l3-3 9 7L35 6z" fill="#1F9CF0" opacity="0.8"/>
    <path d="M35 6l-18 14 18 14V6z" fill="#0065A9" opacity="0.5"/>
  </svg>
);

export const VLCIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <ellipse cx="24" cy="38" rx="18" ry="4" fill="#FF6600" opacity="0.6"/>
    <path d="M24 4l-10 28h20z" fill="#FF8800"/>
    <path d="M24 4l-8 22h16z" fill="#FF6600"/>
    <path d="M24 4l-5 14h10z" fill="#FFaa00"/>
    <path d="M14 32h20v4c0 2-4 4-10 4s-10-2-10-4z" fill="#FF6600"/>
  </svg>
);

export const NotionIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="6" y="6" width="36" height="36" rx="6" fill="white" stroke="#333" strokeWidth="2"/>
    <path d="M14 14h10l8 2v18l-8-2H14z" fill="none" stroke="#333" strokeWidth="1.5"/>
    <line x1="18" y1="20" x2="28" y2="20" stroke="#333" strokeWidth="1"/>
    <line x1="18" y1="24" x2="28" y2="24" stroke="#333" strokeWidth="1"/>
    <line x1="18" y1="28" x2="24" y2="28" stroke="#333" strokeWidth="1"/>
  </svg>
);

export const YouTubeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#FF0000"/>
    <path d="M19 15v18l14-9z" fill="white"/>
  </svg>
);

export const NetflixIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#E50914"/>
    <path d="M16 10h5l7 18V10h4v28h-4.5L20 20v18h-4z" fill="white"/>
  </svg>
);

export const TwitchIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <path d="M8 4l-4 8v28h10v4h4l4-4h6l10-10V4z" fill="#9146FF"/>
    <path d="M12 8h28v20l-6 6h-8l-4 4v-4h-10z" fill="white"/>
    <rect x="22" y="14" width="4" height="10" fill="#9146FF"/>
    <rect x="30" y="14" width="4" height="10" fill="#9146FF"/>
  </svg>
);

export const ExplorerIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <path d="M6 10h16l4 4h16v26H6z" fill="#FFC107"/>
    <path d="M6 18h36v22H6z" fill="#FFD54F"/>
    <path d="M6 14h36v4H6z" fill="#FFB300"/>
  </svg>
);

export const NotepadIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="8" y="4" width="32" height="40" rx="2" fill="#1976D2"/>
    <rect x="12" y="8" width="24" height="32" rx="1" fill="white"/>
    <line x1="14" y1="16" x2="34" y2="16" stroke="#90CAF9" strokeWidth="1.5"/>
    <line x1="14" y1="21" x2="34" y2="21" stroke="#90CAF9" strokeWidth="1.5"/>
    <line x1="14" y1="26" x2="28" y2="26" stroke="#90CAF9" strokeWidth="1.5"/>
    <line x1="14" y1="31" x2="32" y2="31" stroke="#90CAF9" strokeWidth="1.5"/>
  </svg>
);

export const TaskManagerIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#0078D4"/>
    <rect x="10" y="28" width="5" height="10" rx="1" fill="white"/>
    <rect x="18" y="22" width="5" height="16" rx="1" fill="white"/>
    <rect x="26" y="14" width="5" height="24" rx="1" fill="white"/>
    <rect x="34" y="18" width="5" height="20" rx="1" fill="#4FC3F7"/>
  </svg>
);

export const TerminalIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="6" width="40" height="36" rx="4" fill="#1E1E1E"/>
    <path d="M12 18l6 5-6 5" stroke="#4EC9B0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="22" y1="30" x2="34" y2="30" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CalculatorIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="8" y="4" width="32" height="40" rx="4" fill="#202020"/>
    <rect x="12" y="8" width="24" height="10" rx="2" fill="#4CAF50"/>
    <rect x="12" y="22" width="6" height="5" rx="1" fill="#666"/>
    <rect x="21" y="22" width="6" height="5" rx="1" fill="#666"/>
    <rect x="30" y="22" width="6" height="5" rx="1" fill="#FF9800"/>
    <rect x="12" y="30" width="6" height="5" rx="1" fill="#666"/>
    <rect x="21" y="30" width="6" height="5" rx="1" fill="#666"/>
    <rect x="30" y="30" width="6" height="5" rx="1" fill="#FF9800"/>
    <rect x="12" y="38" width="15" height="4" rx="1" fill="#666"/>
    <rect x="30" y="38" width="6" height="4" rx="1" fill="#2196F3"/>
  </svg>
);

export const GenericAppIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#455A64"/>
    <rect x="12" y="12" width="10" height="10" rx="2" fill="white" opacity="0.7"/>
    <rect x="26" y="12" width="10" height="10" rx="2" fill="white" opacity="0.5"/>
    <rect x="12" y="26" width="10" height="10" rx="2" fill="white" opacity="0.5"/>
    <rect x="26" y="26" width="10" height="10" rx="2" fill="white" opacity="0.3"/>
  </svg>
);

export const appIconMap: Record<string, React.FC<IconProps>> = {
  chrome: ChromeIcon,
  edge: EdgeIcon,
  firefox: FirefoxIcon,
  brave: BraveIcon,
  spotify: SpotifyIcon,
  discord: DiscordIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
  slack: SlackIcon,
  zoom: ZoomIcon,
  obs: OBSIcon,
  steam: SteamIcon,
  epic: EpicIcon,
  vscode: VSCodeIcon,
  vlc: VLCIcon,
  notion: NotionIcon,
  youtube: YouTubeIcon,
  netflix: NetflixIcon,
  twitch: TwitchIcon,
  explorer: ExplorerIcon,
  notepad: NotepadIcon,
  taskmgr: TaskManagerIcon,
  'task-manager': TaskManagerIcon,
  terminal: TerminalIcon,
  calculator: CalculatorIcon,
};

export const getAppIcon = (id: string) => appIconMap[id] || GenericAppIcon;
