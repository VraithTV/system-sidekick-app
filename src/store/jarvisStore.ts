import { create } from 'zustand';
import type { AssistantState, Command, AppShortcut, Routine, Clip, SystemStatus, JarvisSettings } from '@/types/jarvis';

interface JarvisStore {
  state: AssistantState;
  setState: (s: AssistantState) => void;
  commands: Command[];
  addCommand: (cmd: Command) => void;
  apps: AppShortcut[];
  addApp: (app: AppShortcut) => void;
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
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
  commands: [],
  addCommand: (cmd) => set((s) => ({ commands: [cmd, ...s.commands].slice(0, 50) })),
  apps: [],
  addApp: (app) => set((s) => ({ apps: [...s.apps, app] })),
  routines: [],
  addRoutine: (routine) => set((s) => ({ routines: [...s.routines, routine] })),
  clips: [],
  addClip: (clip) => set((s) => ({ clips: [clip, ...s.clips] })),
  systemStatus: {
    cpu: 0,
    ram: 0,
    gpu: 0,
    micActive: false,
    obsConnected: false,
    isRecording: false,
    isStreaming: false,
    desktopOnline: true,
  },
  setSystemStatus: (status) => set((s) => ({ systemStatus: { ...s.systemStatus, ...status } })),
  settings: {
    wakeName: 'Jarvis',
    wakeAliases: [],
    wakeSensitivity: 0.55,
    voice: 'daniel',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
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
