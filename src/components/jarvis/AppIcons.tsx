type IconProps = { className?: string; size?: number };

const s = (size?: number) => size || 20;

export const ChromeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#4285F4"/>
    <path d="M24 14h18.5a22 22 0 0 1-9.25 25.75L24 24z" fill="#EA4335"/>
    <path d="M24 14H6.5a22 22 0 0 0 2.75 25.75L24 24z" fill="#34A853"/>
    <path d="M9.25 39.75A22 22 0 0 0 42.5 14H24l-14.75 25.75z" fill="#FBBC05" opacity="0"/>
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

export const VSCodeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <path d="M35 6l8 4v28l-8 4-18-14L8 35l-3-3V16l3-3 9 7z" fill="#007ACC"/>
    <path d="M35 6v36l-18-14L8 35l-3-3V16l3-3 9 7L35 6z" fill="#1F9CF0" opacity="0.8"/>
    <path d="M35 6l-18 14 18 14V6z" fill="#0065A9" opacity="0.5"/>
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

export const FirefoxIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#FF9500"/>
    <path d="M24 6C14 6 6 14 6 24s8 18 18 18 18-8 18-18c0-3-1-6-2.5-8.5-.5 2-2 3.5-2 3.5s-1-5-4-8c-2-2-3-5-2.5-7.5C28 4.5 24 6 24 6z" fill="#FF6D00"/>
    <circle cx="24" cy="24" r="10" fill="#FFEB3B"/>
    <circle cx="24" cy="24" r="7" fill="#FF9500"/>
  </svg>
);

export const BraveIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <path d="M24 4L8 12v12c0 10 8 18 16 20 8-2 16-10 16-20V12L24 4z" fill="#FB542B"/>
    <path d="M24 10l-10 5v8c0 7 5 13 10 15 5-2 10-8 10-15v-8L24 10z" fill="white"/>
    <path d="M24 14l-6 3v6c0 5 3 9 6 10 3-1 6-5 6-10v-6l-6-3z" fill="#FB542B"/>
  </svg>
);

export const SlackIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="10" fill="#4A154B"/>
    <rect x="10" y="20" width="8" height="4" rx="2" fill="#E01E5A"/>
    <rect x="20" y="10" width="4" height="8" rx="2" fill="#36C5F0"/>
    <rect x="30" y="24" width="8" height="4" rx="2" fill="#2EB67D"/>
    <rect x="24" y="30" width="4" height="8" rx="2" fill="#ECB22E"/>
    <rect x="14" y="10" width="4" height="4" rx="2" fill="#36C5F0"/>
    <rect x="30" y="14" width="4" height="4" rx="2" fill="#2EB67D"/>
    <rect x="10" y="30" width="4" height="4" rx="2" fill="#E01E5A"/>
    <rect x="34" y="30" width="4" height="4" rx="2" fill="#ECB22E"/>
  </svg>
);

export const TelegramIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#2AABEE"/>
    <path d="M12 24l4 2 2 6 3-3 5 4 8-18-22 9z" fill="white"/>
    <path d="M18 26l1 6 3-3-4-3z" fill="#C8DAEA"/>
    <path d="M19 32l5 4 8-18-12 11z" fill="#A9C9DD" opacity="0.6"/>
  </svg>
);

export const WhatsAppIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#25D366"/>
    <path d="M24 10c-7.7 0-14 6.3-14 14 0 2.5.7 4.8 1.8 6.8L10 38l7.5-1.9c2 1 4.2 1.5 6.5 1.5 7.7 0 14-6.3 14-14s-6.3-14-14-14zm0 25c-2 0-3.9-.5-5.6-1.4l-3.9 1 1-3.7C14.5 29 14 27.1 14 25c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10z" fill="white"/>
    <path d="M29 27.5c-.4-.2-2.3-1.1-2.6-1.3-.3-.1-.6-.2-.8.2s-1 1.3-1.2 1.5c-.2.2-.4.3-.8.1s-1.6-.6-3-1.8c-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7.3-.5.1-.4c0-.2-.1-.4-.2-.6-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4s-1.3 1.2-1.3 3 1.3 3.5 1.5 3.7 2.6 4 6.3 5.6c3.7 1.6 3.7 1.1 4.4 1s2.3-.9 2.6-1.8c.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z" fill="white"/>
  </svg>
);

export const WordIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#2B579A"/>
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">W</text>
  </svg>
);

export const ExcelIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#217346"/>
    <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">X</text>
  </svg>
);

export const PhotoshopIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#001E36"/>
    <text x="13" y="30" fill="#31A8FF" fontSize="16" fontWeight="bold" fontFamily="Arial">Ps</text>
  </svg>
);

export const PremiereProIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#00005B"/>
    <text x="13" y="30" fill="#9999FF" fontSize="16" fontWeight="bold" fontFamily="Arial">Pr</text>
  </svg>
);

export const YouTubeIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="2" y="8" width="44" height="32" rx="8" fill="#FF0000"/>
    <polygon points="20,16 20,32 34,24" fill="white"/>
  </svg>
);

export const CalculatorIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="8" y="4" width="32" height="40" rx="4" fill="#607D8B"/>
    <rect x="12" y="8" width="24" height="10" rx="2" fill="#B0BEC5"/>
    <rect x="12" y="22" width="6" height="5" rx="1" fill="white"/>
    <rect x="21" y="22" width="6" height="5" rx="1" fill="white"/>
    <rect x="30" y="22" width="6" height="5" rx="1" fill="#FF9800"/>
    <rect x="12" y="30" width="6" height="5" rx="1" fill="white"/>
    <rect x="21" y="30" width="6" height="5" rx="1" fill="white"/>
    <rect x="30" y="30" width="6" height="5" rx="1" fill="#FF9800"/>
    <rect x="12" y="38" width="15" height="4" rx="1" fill="white"/>
    <rect x="30" y="38" width="6" height="4" rx="1" fill="#4CAF50"/>
  </svg>
);

export const TerminalIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#1E1E1E"/>
    <polyline points="12,16 20,24 12,32" fill="none" stroke="#4EC9B0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="24" y1="32" x2="36" y2="32" stroke="#4EC9B0" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export const NetflixIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="#000"/>
    <path d="M16 10h5l7 20V10h5v28h-5l-7-20v20h-5z" fill="#E50914"/>
  </svg>
);

export const TwitchIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <path d="M10 4L6 14v26h10v4h6l4-4h8l10-10V4H10z" fill="#9146FF"/>
    <path d="M14 8h26v22l-6 6h-8l-4 4h-4v-4h-4V8z" fill="white"/>
    <rect x="22" y="14" width="4" height="12" rx="1" fill="#9146FF"/>
    <rect x="30" y="14" width="4" height="12" rx="1" fill="#9146FF"/>
  </svg>
);

export const TwitterIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#000"/>
    <path d="M14 12l8.5 12L14 36h2l7-9.5L29.5 36H36l-9-12.5L35 12h-2l-6.5 8.5L21 12H14zm3.5 2h3l14 20h-3l-14-20z" fill="white"/>
  </svg>
);

export const GitHubIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="22" fill="#24292E"/>
    <path d="M24 6C14 6 6 14 6 24c0 8 5.2 14.8 12.4 17.2.9.2 1.2-.4 1.2-.9v-3c-5 1.1-6.1-2.4-6.1-2.4-.8-2.1-2-2.6-2-2.6-1.7-1.1.1-1.1.1-1.1 1.8.1 2.8 1.9 2.8 1.9 1.6 2.8 4.3 2 5.3 1.5.2-1.2.6-2 1.1-2.4-4-.5-8.2-2-8.2-9 0-2 .7-3.6 1.9-4.9-.2-.5-.8-2.3.2-4.8 0 0 1.5-.5 5 1.9 1.4-.4 3-.6 4.5-.6s3 .2 4.5.6c3.5-2.4 5-1.9 5-1.9 1 2.5.4 4.3.2 4.8 1.2 1.3 1.9 2.9 1.9 4.9 0 7-4.2 8.5-8.2 9 .6.6 1.2 1.7 1.2 3.4v5c0 .5.3 1.1 1.2.9C36.8 38.8 42 32 42 24 42 14 34 6 24 6z" fill="white"/>
  </svg>
);

export const ChatGPTIcon = ({ className, size }: IconProps) => (
  <svg width={s(size)} height={s(size)} viewBox="0 0 48 48" className={className}>
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#10A37F"/>
    <path d="M24 12c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 4a8 8 0 0 1 7.7 5.8H16.3A8 8 0 0 1 24 16zm-8 8a8 8 0 0 1 .3-2.2l6.7 3.9-6.7 3.9A8 8 0 0 1 16 24zm8 8a8 8 0 0 1-7.7-5.8h15.4A8 8 0 0 1 24 32z" fill="white" opacity="0.9"/>
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
  spotify: SpotifyIcon,
  discord: DiscordIcon,
  obs: OBSIcon,
  steam: SteamIcon,
  vscode: VSCodeIcon,
  explorer: ExplorerIcon,
  notepad: NotepadIcon,
  taskmgr: TaskManagerIcon,
  'task-manager': TaskManagerIcon,
  firefox: FirefoxIcon,
  brave: BraveIcon,
  slack: SlackIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
  word: WordIcon,
  excel: ExcelIcon,
  photoshop: PhotoshopIcon,
  'premiere-pro': PremiereProIcon,
  youtube: YouTubeIcon,
  calculator: CalculatorIcon,
  terminal: TerminalIcon,
  netflix: NetflixIcon,
  twitch: TwitchIcon,
  twitter: TwitterIcon,
  github: GitHubIcon,
  chatgpt: ChatGPTIcon,
};

export const getAppIcon = (id: string) => appIconMap[id] || GenericAppIcon;
