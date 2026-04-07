import type { AppShortcut } from '@/types/jarvis';

export interface CommonApp {
  id: string;
  name: string;
  aliases: string[];
  icon: string;
  launchCmd: string;
}

export const commonApps: CommonApp[] = [
  { id: 'chrome', name: 'Google Chrome', aliases: ['chrome', 'google chrome', 'browser'], icon: '🌐', launchCmd: 'start chrome' },
  { id: 'edge', name: 'Microsoft Edge', aliases: ['edge', 'microsoft edge'], icon: '🌊', launchCmd: 'start msedge' },
  { id: 'spotify', name: 'Spotify', aliases: ['spotify', 'music'], icon: '🎵', launchCmd: 'start spotify:' },
  { id: 'discord', name: 'Discord', aliases: ['discord'], icon: '💬', launchCmd: 'start discord:' },
  { id: 'obs', name: 'OBS Studio', aliases: ['obs', 'obs studio', 'streaming'], icon: '🎥', launchCmd: 'start obs64' },
  { id: 'steam', name: 'Steam', aliases: ['steam', 'games'], icon: '🎮', launchCmd: 'start steam:' },
  { id: 'vscode', name: 'Visual Studio Code', aliases: ['vscode', 'vs code', 'code'], icon: '💻', launchCmd: 'start code' },
  { id: 'explorer', name: 'File Explorer', aliases: ['explorer', 'file explorer', 'files'], icon: '📁', launchCmd: 'start explorer' },
  { id: 'notepad', name: 'Notepad', aliases: ['notepad'], icon: '📝', launchCmd: 'start notepad' },
  { id: 'task-manager', name: 'Task Manager', aliases: ['task manager', 'taskmgr'], icon: '📊', launchCmd: 'start taskmgr' },
  { id: 'firefox', name: 'Mozilla Firefox', aliases: ['firefox', 'mozilla firefox'], icon: '🦊', launchCmd: 'start firefox' },
  { id: 'brave', name: 'Brave Browser', aliases: ['brave', 'brave browser'], icon: '🦁', launchCmd: 'start brave' },
  { id: 'slack', name: 'Slack', aliases: ['slack'], icon: '💼', launchCmd: 'start slack' },
  { id: 'telegram', name: 'Telegram', aliases: ['telegram'], icon: '✈️', launchCmd: 'start telegram:' },
  { id: 'whatsapp', name: 'WhatsApp', aliases: ['whatsapp', 'whats app'], icon: '💚', launchCmd: 'start whatsapp:' },
  { id: 'word', name: 'Microsoft Word', aliases: ['word', 'microsoft word'], icon: '📘', launchCmd: 'start winword' },
  { id: 'excel', name: 'Microsoft Excel', aliases: ['excel', 'microsoft excel', 'spreadsheet'], icon: '📗', launchCmd: 'start excel' },
  { id: 'photoshop', name: 'Adobe Photoshop', aliases: ['photoshop', 'adobe photoshop', 'photo editor'], icon: '🖼️', launchCmd: 'start photoshop' },
  { id: 'premiere-pro', name: 'Adobe Premiere Pro', aliases: ['premiere pro', 'premiere', 'video editor'], icon: '🎬', launchCmd: 'start premierepro' },
  { id: 'youtube', name: 'YouTube', aliases: ['youtube', 'yt'], icon: '▶️', launchCmd: 'start https://youtube.com' },
  { id: 'calculator', name: 'Calculator', aliases: ['calculator', 'calc'], icon: '🧮', launchCmd: 'start calc' },
  { id: 'terminal', name: 'Windows Terminal', aliases: ['terminal', 'windows terminal', 'command prompt', 'cmd', 'powershell'], icon: '⬛', launchCmd: 'start wt' },
  { id: 'netflix', name: 'Netflix', aliases: ['netflix'], icon: '🎬', launchCmd: 'start https://netflix.com' },
  { id: 'twitch', name: 'Twitch', aliases: ['twitch'], icon: '📺', launchCmd: 'start https://twitch.tv' },
  { id: 'twitter', name: 'X (Twitter)', aliases: ['twitter', 'x', 'tweets'], icon: '🐦', launchCmd: 'start https://x.com' },
  { id: 'github', name: 'GitHub', aliases: ['github', 'git hub'], icon: '🐱', launchCmd: 'start https://github.com' },
  { id: 'chatgpt', name: 'ChatGPT', aliases: ['chatgpt', 'chat gpt', 'gpt'], icon: '🤖', launchCmd: 'start https://chat.openai.com' },
];

export const defaultAppIds = [
  'chrome', 'edge', 'spotify', 'discord', 'obs', 'steam',
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
