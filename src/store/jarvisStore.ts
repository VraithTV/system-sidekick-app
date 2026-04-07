import { create } from 'zustand';
import type { AssistantState, Command, AppShortcut, Routine, Clip, SystemStatus, JarvisSettings, JarvisMode } from '@/types/jarvis';
import { getDefaultApps } from '@/lib/commonApps';

const APPS_KEY = 'jarvis_apps';
const APPS_VERSION_KEY = 'jarvis_apps_version';
const CURRENT_APPS_VERSION = 2; // bump to force re-seed defaults

function loadApps(): AppShortcut[] {
  try {
    const version = parseInt(localStorage.getItem(APPS_VERSION_KEY) || '0', 10);
    if (version < CURRENT_APPS_VERSION) {
      // First time or version bump: seed with defaults
      const defaults = getDefaultApps();
      localStorage.setItem(APPS_KEY, JSON.stringify(defaults));
      localStorage.setItem(APPS_VERSION_KEY, String(CURRENT_APPS_VERSION));
      return defaults;
    }
    const raw = localStorage.getItem(APPS_KEY);
    return raw ? JSON.parse(raw) : getDefaultApps();
  } catch { return getDefaultApps(); }
}

function saveApps(apps: AppShortcut[]) {
  try { localStorage.setItem(APPS_KEY, JSON.stringify(apps)); } catch {}
}

interface JarvisStore {
  state: AssistantState;
  setState: (s: AssistantState) => void;
  commands: Command[];
  addCommand: (cmd: Command) => void;
  apps: AppShortcut[];
  addApp: (app: AppShortcut) => void;
  removeApp: (id: string) => void;
  setApps: (apps: AppShortcut[]) => void;
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
  mode: JarvisMode;
  setMode: (mode: JarvisMode) => void;
}

export const useJarvisStore = create<JarvisStore>((set) => ({
  state: 'idle',
  setState: (s) => set({ state: s }),
  commands: [],
  addCommand: (cmd) => set((s) => ({ commands: [cmd, ...s.commands].slice(0, 50) })),
  apps: loadApps(),
  addApp: (app) => set((s) => {
    const apps = [...s.apps, app];
    saveApps(apps);
    return { apps };
  }),
  removeApp: (id) => set((s) => {
    const apps = s.apps.filter((a) => a.id !== id);
    saveApps(apps);
    return { apps };
  }),
  setApps: (apps) => { saveApps(apps); set({ apps }); },
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
    clipFolder: 'C:\\Jarvis\\Clips',
    obsWebsocketUrl: 'ws://localhost:4455',
    obsWebsocketPassword: '',
    inputDeviceId: '',
    outputDeviceId: '',
  },
  updateSettings: (s) => set((prev) => ({ settings: { ...prev.settings, ...s } })),
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
  mode: 'assistant' as JarvisMode,
  setMode: (mode) => set({ mode }),
}));
