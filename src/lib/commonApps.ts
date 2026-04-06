import type { AppShortcut } from '@/types/jarvis';

export interface CommonApp {
  id: string;
  name: string;
  path: string;
  aliases: string[];
  icon: string; // emoji for now
  launchCmd: string; // Windows shell command
}

export const commonApps: CommonApp[] = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    aliases: ['chrome', 'google chrome', 'browser'],
    icon: '🌐',
    launchCmd: 'start chrome',
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    aliases: ['edge', 'microsoft edge'],
    icon: '🌊',
    launchCmd: 'start msedge',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Roaming\\Spotify\\Spotify.exe',
    aliases: ['spotify', 'music'],
    icon: '🎵',
    launchCmd: 'start spotify:',
  },
  {
    id: 'discord',
    name: 'Discord',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Local\\Discord\\app-*\\Discord.exe',
    aliases: ['discord'],
    icon: '💬',
    launchCmd: 'start discord:',
  },
  {
    id: 'obs',
    name: 'OBS Studio',
    path: 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe',
    aliases: ['obs', 'obs studio', 'streaming'],
    icon: '🎥',
    launchCmd: 'start "" "C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe"',
  },
  {
    id: 'steam',
    name: 'Steam',
    path: 'C:\\Program Files (x86)\\Steam\\steam.exe',
    aliases: ['steam', 'games'],
    icon: '🎮',
    launchCmd: 'start steam:',
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
    aliases: ['vscode', 'vs code', 'code'],
    icon: '💻',
    launchCmd: 'start code',
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    path: 'C:\\Windows\\explorer.exe',
    aliases: ['explorer', 'file explorer', 'files'],
    icon: '📁',
    launchCmd: 'start explorer',
  },
  {
    id: 'notepad',
    name: 'Notepad',
    path: 'C:\\Windows\\System32\\notepad.exe',
    aliases: ['notepad'],
    icon: '📝',
    launchCmd: 'start notepad',
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    path: 'C:\\Windows\\System32\\Taskmgr.exe',
    aliases: ['task manager', 'taskmgr'],
    icon: '📊',
    launchCmd: 'start taskmgr',
  },
];

export function toAppShortcut(app: CommonApp): AppShortcut {
  return {
    id: app.id,
    name: app.name,
    path: app.path,
    aliases: app.aliases,
    icon: app.icon,
  };
}
