import type { AppShortcut } from '@/types/jarvis';

export interface CommonApp {
  id: string;
  name: string;
  aliases: string[];
  icon: string;
  launchCmd: string;
  category: 'browser' | 'social' | 'media' | 'gaming' | 'productivity' | 'creative' | 'utility' | 'streaming';
}

export const commonApps: CommonApp[] = [
  // Browsers
  { id: 'chrome', name: 'Google Chrome', aliases: ['chrome', 'google chrome', 'browser'], icon: '🌐', launchCmd: 'start chrome', category: 'browser' },
  { id: 'edge', name: 'Microsoft Edge', aliases: ['edge', 'microsoft edge'], icon: '🌊', launchCmd: 'start msedge', category: 'browser' },
  { id: 'opera-gx', name: 'Opera GX', aliases: ['opera gx', 'opera', 'operagx'], icon: '🎮', launchCmd: 'start opera', category: 'browser' },
  { id: 'brave', name: 'Brave Browser', aliases: ['brave', 'brave browser'], icon: '🦁', launchCmd: 'start brave', category: 'browser' },
  { id: 'firefox', name: 'Mozilla Firefox', aliases: ['firefox', 'mozilla firefox', 'fire fox'], icon: '🦊', launchCmd: 'start firefox', category: 'browser' },
  { id: 'vivaldi', name: 'Vivaldi', aliases: ['vivaldi'], icon: '🔴', launchCmd: 'start vivaldi', category: 'browser' },

  // Social / Communication
  { id: 'discord', name: 'Discord', aliases: ['discord'], icon: '💬', launchCmd: 'start discord:', category: 'social' },
  { id: 'slack', name: 'Slack', aliases: ['slack'], icon: '💼', launchCmd: 'start slack', category: 'social' },
  { id: 'telegram', name: 'Telegram', aliases: ['telegram'], icon: '✈️', launchCmd: 'start telegram:', category: 'social' },
  { id: 'whatsapp', name: 'WhatsApp', aliases: ['whatsapp', 'whats app'], icon: '💚', launchCmd: 'start whatsapp:', category: 'social' },
  { id: 'teams', name: 'Microsoft Teams', aliases: ['teams', 'microsoft teams'], icon: '👥', launchCmd: 'start msteams:', category: 'social' },
  { id: 'zoom', name: 'Zoom', aliases: ['zoom', 'zoom meeting'], icon: '📹', launchCmd: 'start zoommtg:', category: 'social' },

  // Media / Music
  { id: 'spotify', name: 'Spotify', aliases: ['spotify', 'music'], icon: '🎵', launchCmd: 'start spotify:', category: 'media' },
  { id: 'spotify-web', name: 'Spotify Web', aliases: ['spotify web'], icon: '🎶', launchCmd: 'start https://open.spotify.com', category: 'media' },
  { id: 'vlc', name: 'VLC Media Player', aliases: ['vlc', 'media player'], icon: '🔶', launchCmd: 'start vlc', category: 'media' },
  { id: 'youtube', name: 'YouTube', aliases: ['youtube', 'yt'], icon: '▶️', launchCmd: 'start https://youtube.com', category: 'media' },
  { id: 'netflix', name: 'Netflix', aliases: ['netflix'], icon: '🎬', launchCmd: 'start https://netflix.com', category: 'media' },

  // Streaming
  { id: 'obs', name: 'OBS Studio', aliases: ['obs', 'obs studio', 'streaming'], icon: '🎥', launchCmd: 'start obs64', category: 'streaming' },
  { id: 'twitch', name: 'Twitch', aliases: ['twitch'], icon: '📺', launchCmd: 'start https://twitch.tv', category: 'streaming' },
  { id: 'streamlabs', name: 'Streamlabs', aliases: ['streamlabs', 'slobs'], icon: '🔴', launchCmd: 'start streamlabs', category: 'streaming' },

  // Gaming
  { id: 'steam', name: 'Steam', aliases: ['steam', 'games'], icon: '🎮', launchCmd: 'start steam:', category: 'gaming' },
  { id: 'epic-games', name: 'Epic Games', aliases: ['epic games', 'epic', 'epic launcher'], icon: '🏔️', launchCmd: 'start com.epicgames.launcher:', category: 'gaming' },
  { id: 'fortnite', name: 'Fortnite', aliases: ['fortnite', 'fort nite'], icon: '🏗️', launchCmd: 'start com.epicgames.launcher://apps/fn', category: 'gaming' },
  { id: 'minecraft', name: 'Minecraft', aliases: ['minecraft', 'mine craft'], icon: '⛏️', launchCmd: 'start minecraft:', category: 'gaming' },
  { id: 'gta5', name: 'GTA V', aliases: ['gta', 'gta 5', 'gta v', 'grand theft auto'], icon: '🚗', launchCmd: 'start steam://rungameid/271590', category: 'gaming' },
  { id: 'fivem', name: 'FiveM', aliases: ['fivem', 'five m', '5m'], icon: '🏙️', launchCmd: 'start fivem:', category: 'gaming' },
  { id: 'valorant', name: 'Valorant', aliases: ['valorant', 'val'], icon: '🔫', launchCmd: 'start valorant:', category: 'gaming' },
  { id: 'league', name: 'League of Legends', aliases: ['league', 'league of legends', 'lol'], icon: '⚔️', launchCmd: 'start leagueoflegends:', category: 'gaming' },
  { id: 'apex', name: 'Apex Legends', aliases: ['apex', 'apex legends'], icon: '🎯', launchCmd: 'start steam://rungameid/1172470', category: 'gaming' },
  { id: 'csgo', name: 'CS2', aliases: ['cs2', 'csgo', 'counter strike', 'cs go'], icon: '💣', launchCmd: 'start steam://rungameid/730', category: 'gaming' },
  { id: 'roblox', name: 'Roblox', aliases: ['roblox'], icon: '🧱', launchCmd: 'start roblox:', category: 'gaming' },
  { id: 'overwatch', name: 'Overwatch 2', aliases: ['overwatch', 'overwatch 2', 'ow', 'ow2'], icon: '🦸', launchCmd: 'start battlenet://Pro', category: 'gaming' },
  { id: 'rocket-league', name: 'Rocket League', aliases: ['rocket league', 'rl'], icon: '🚀', launchCmd: 'start com.epicgames.launcher://apps/Sugar', category: 'gaming' },
  { id: 'warzone', name: 'Warzone', aliases: ['warzone', 'cod warzone', 'call of duty warzone'], icon: '🪖', launchCmd: 'start battlenet://ODIN', category: 'gaming' },
  { id: 'battlenet', name: 'Battle.net', aliases: ['battle net', 'battlenet', 'blizzard'], icon: '🌀', launchCmd: 'start battlenet:', category: 'gaming' },
  { id: 'ea-app', name: 'EA App', aliases: ['ea app', 'ea', 'origin'], icon: '🔷', launchCmd: 'start origin:', category: 'gaming' },
  { id: 'ubisoft', name: 'Ubisoft Connect', aliases: ['ubisoft', 'ubisoft connect', 'uplay'], icon: '🔵', launchCmd: 'start uplay:', category: 'gaming' },
  { id: 'xbox', name: 'Xbox App', aliases: ['xbox', 'xbox app'], icon: '🟢', launchCmd: 'start xbox:', category: 'gaming' },
  { id: 'geforce-now', name: 'GeForce NOW', aliases: ['geforce now', 'gfn'], icon: '🟩', launchCmd: 'start geforcenow:', category: 'gaming' },

  // Productivity
  { id: 'vscode', name: 'Visual Studio Code', aliases: ['vscode', 'vs code', 'code'], icon: '💻', launchCmd: 'start code', category: 'productivity' },
  { id: 'explorer', name: 'File Explorer', aliases: ['explorer', 'file explorer', 'files'], icon: '📁', launchCmd: 'start explorer', category: 'productivity' },
  { id: 'notepad', name: 'Notepad', aliases: ['notepad'], icon: '📝', launchCmd: 'start notepad', category: 'productivity' },
  { id: 'word', name: 'Microsoft Word', aliases: ['word', 'microsoft word'], icon: '📘', launchCmd: 'start winword', category: 'productivity' },
  { id: 'excel', name: 'Microsoft Excel', aliases: ['excel', 'microsoft excel', 'spreadsheet'], icon: '📗', launchCmd: 'start excel', category: 'productivity' },
  { id: 'powerpoint', name: 'Microsoft PowerPoint', aliases: ['powerpoint', 'ppt', 'slides'], icon: '📙', launchCmd: 'start powerpnt', category: 'productivity' },
  { id: 'notion', name: 'Notion', aliases: ['notion'], icon: '📓', launchCmd: 'start notion:', category: 'productivity' },
  { id: 'github', name: 'GitHub', aliases: ['github', 'git hub'], icon: '🐱', launchCmd: 'start https://github.com', category: 'productivity' },
  { id: 'chatgpt', name: 'ChatGPT', aliases: ['chatgpt', 'chat gpt', 'gpt'], icon: '🤖', launchCmd: 'start https://chat.openai.com', category: 'productivity' },

  // Creative
  { id: 'photoshop', name: 'Adobe Photoshop', aliases: ['photoshop', 'adobe photoshop', 'photo editor'], icon: '🖼️', launchCmd: 'start photoshop', category: 'creative' },
  { id: 'premiere-pro', name: 'Adobe Premiere Pro', aliases: ['premiere pro', 'premiere', 'video editor'], icon: '🎬', launchCmd: 'start premierepro', category: 'creative' },
  { id: 'after-effects', name: 'Adobe After Effects', aliases: ['after effects', 'ae'], icon: '✨', launchCmd: 'start afterfx', category: 'creative' },
  { id: 'blender', name: 'Blender', aliases: ['blender', '3d'], icon: '🧊', launchCmd: 'start blender', category: 'creative' },
  { id: 'figma', name: 'Figma', aliases: ['figma'], icon: '🎨', launchCmd: 'start https://figma.com', category: 'creative' },
  { id: 'davinci', name: 'DaVinci Resolve', aliases: ['davinci', 'davinci resolve', 'resolve'], icon: '🎞️', launchCmd: 'start resolve', category: 'creative' },
  { id: 'capcut', name: 'CapCut', aliases: ['capcut', 'cap cut'], icon: '✂️', launchCmd: 'start capcut', category: 'creative' },

  // Utility
  { id: 'task-manager', name: 'Task Manager', aliases: ['task manager', 'taskmgr'], icon: '📊', launchCmd: 'start taskmgr', category: 'utility' },
  { id: 'calculator', name: 'Calculator', aliases: ['calculator', 'calc'], icon: '🧮', launchCmd: 'start calc', category: 'utility' },
  { id: 'terminal', name: 'Windows Terminal', aliases: ['terminal', 'windows terminal', 'command prompt', 'cmd', 'powershell'], icon: '⬛', launchCmd: 'start wt', category: 'utility' },
  { id: 'twitter', name: 'X (Twitter)', aliases: ['twitter', 'x', 'tweets'], icon: '🐦', launchCmd: 'start https://x.com', category: 'utility' },
];

export const categoryLabels: Record<string, string> = {
  browser: 'Browsers',
  social: 'Social & Communication',
  media: 'Media & Music',
  streaming: 'Streaming',
  gaming: 'Gaming',
  productivity: 'Productivity',
  creative: 'Creative',
  utility: 'Utility',
};

export const categoryOrder = ['browser', 'social', 'media', 'streaming', 'gaming', 'productivity', 'creative', 'utility'];

export const defaultAppIds = [
  'chrome', 'edge', 'opera-gx', 'brave', 'spotify', 'discord', 'obs', 'steam',
  'vscode', 'explorer', 'notepad', 'task-manager', 'youtube',
];

export function toAppShortcut(app: CommonApp): AppShortcut {
  return {
    id: app.id,
    name: app.name,
    aliases: app.aliases,
    icon: app.icon,
  };
}

export function getDefaultApps(): AppShortcut[] {
  return commonApps
    .filter((ca) => defaultAppIds.includes(ca.id))
    .map(toAppShortcut);
}
