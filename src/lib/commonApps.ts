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
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    path: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    aliases: ['firefox', 'mozilla firefox'],
    icon: '🦊',
    launchCmd: 'start firefox',
  },
  {
    id: 'brave',
    name: 'Brave Browser',
    path: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    aliases: ['brave', 'brave browser'],
    icon: '🦁',
    launchCmd: 'start brave',
  },
  {
    id: 'slack',
    name: 'Slack',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Local\\slack\\slack.exe',
    aliases: ['slack'],
    icon: '💼',
    launchCmd: 'start slack',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Roaming\\Telegram Desktop\\Telegram.exe',
    aliases: ['telegram'],
    icon: '✈️',
    launchCmd: 'start telegram:',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Local\\WhatsApp\\WhatsApp.exe',
    aliases: ['whatsapp', 'whats app'],
    icon: '💚',
    launchCmd: 'start whatsapp:',
  },
  {
    id: 'word',
    name: 'Microsoft Word',
    path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
    aliases: ['word', 'microsoft word'],
    icon: '📘',
    launchCmd: 'start winword',
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
    aliases: ['excel', 'microsoft excel', 'spreadsheet'],
    icon: '📗',
    launchCmd: 'start excel',
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    path: 'C:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Photoshop.exe',
    aliases: ['photoshop', 'adobe photoshop', 'photo editor'],
    icon: '🖼️',
    launchCmd: 'start photoshop',
  },
  {
    id: 'premiere-pro',
    name: 'Adobe Premiere Pro',
    path: 'C:\\Program Files\\Adobe\\Adobe Premiere Pro 2024\\Adobe Premiere Pro.exe',
    aliases: ['premiere pro', 'premiere', 'video editor'],
    icon: '🎬',
    launchCmd: 'start adobe premierepro',
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
