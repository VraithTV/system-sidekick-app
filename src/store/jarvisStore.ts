import { create } from 'zustand';
import type { AssistantState, Command, AppShortcut, Routine, Clip, SystemStatus, JarvisSettings } from '@/types/jarvis';

interface JarvisStore {
  state: AssistantState;
  setState: (s: AssistantState) => void;
  commands: Command[];
  addCommand: (cmd: Command) => void;
  apps: AppShortcut[];
  routines: Routine[];
  clips: Clip[];
  addClip: (clip: Clip) => void;
  systemStatus: SystemStatus;
  setSystemStatus: (status: Partial<SystemStatus>) => void;
  settings: JarvisSettings;
  updateSettings: (s: Partial<JarvisSettings>) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const useJarvisStore = create<JarvisStore>((set) => ({
  state: 'idle',
  setState: (s) => set({ state: s }),
  commands: [
    { id: '1', text: 'Open Chrome', response: 'Opening Chrome for you now.', timestamp: new Date(Date.now() - 300000), type: 'voice' },
    { id: '2', text: 'Start recording', response: 'Recording has started.', timestamp: new Date(Date.now() - 200000), type: 'voice' },
    { id: '3', text: 'What\'s my CPU usage?', response: 'Your CPU is currently at 34%. Everything looks smooth.', timestamp: new Date(Date.now() - 100000), type: 'voice' },
  ],
  addCommand: (cmd) => set((s) => ({ commands: [cmd, ...s.commands].slice(0, 50) })),
  apps: [
    { id: '1', name: 'Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', aliases: ['browser', 'google'] },
    { id: '2', name: 'Discord', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe', aliases: ['disc'] },
    { id: '3', name: 'OBS Studio', path: 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe', aliases: ['obs', 'streaming'] },
    { id: '4', name: 'Spotify', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe', aliases: ['music'] },
    { id: '5', name: 'Steam', path: 'C:\\Program Files (x86)\\Steam\\steam.exe', aliases: ['games'] },
    { id: '6', name: 'Visual Studio Code', path: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', aliases: ['vscode', 'code'] },
  ],
  routines: [
    { id: '1', name: 'Gaming Mode', trigger: 'gaming mode', actions: ['Open Discord', 'Open Steam', 'Set volume to 70%'], enabled: true },
    { id: '2', name: 'Streaming Mode', trigger: 'streaming mode', actions: ['Open OBS', 'Open Twitch Dashboard', 'Start Recording'], enabled: true },
    { id: '3', name: 'Study Mode', trigger: 'study mode', actions: ['Open Chrome', 'Open Notes', 'Mute Discord'], enabled: false },
  ],
  clips: [
    { id: '1', filename: 'clip_2026-04-04_14-23-01.mp4', duration: 30, timestamp: new Date(Date.now() - 600000), size: '45 MB' },
    { id: '2', filename: 'clip_2026-04-04_14-18-45.mp4', duration: 60, timestamp: new Date(Date.now() - 900000), size: '88 MB' },
    { id: '3', filename: 'clip_2026-04-04_13-55-12.mp4', duration: 15, timestamp: new Date(Date.now() - 1800000), size: '22 MB' },
  ],
  addClip: (clip) => set((s) => ({ clips: [clip, ...s.clips] })),
  systemStatus: {
    cpu: 34,
    ram: 62,
    gpu: 28,
    micActive: true,
    obsConnected: true,
    isRecording: false,
    isStreaming: false,
    desktopOnline: true,
  },
  setSystemStatus: (status) => set((s) => ({ systemStatus: { ...s.systemStatus, ...status } })),
  settings: {
    wakeName: 'Jarvis',
    voice: 'Neural English (Male)',
    startOnBoot: true,
    alwaysListening: true,
    pushToTalk: false,
    clipDuration: 30,
    clipFolder: 'C:\\Users\\User\\Videos\\Clips',
    obsWebsocketUrl: 'ws://localhost:4455',
    obsWebsocketPassword: '',
  },
  updateSettings: (s) => set((prev) => ({ settings: { ...prev.settings, ...s } })),
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
}));
