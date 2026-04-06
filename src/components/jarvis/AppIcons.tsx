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
};

export const getAppIcon = (id: string) => appIconMap[id] || GenericAppIcon;
