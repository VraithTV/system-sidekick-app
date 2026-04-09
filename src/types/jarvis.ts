export type AssistantState = 'idle' | 'standby' | 'listening' | 'thinking' | 'speaking' | 'executing';

export type JarvisMode = 'assistant' | 'task' | 'private' | 'action' | 'animation';

export interface Command {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
  type: 'voice' | 'text';
}

export interface AppShortcut {
  id: string;
  name: string;
  aliases: string[];
  icon?: string;
}

export interface Routine {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
}

export interface Clip {
  id: string;
  filename: string;
  duration: number;
  timestamp: Date;
  size: string;
  thumbnail?: string;
}

export interface SystemStatus {
  cpu: number;
  ram: number;
  gpu: number;
  micActive: boolean;
  obsConnected: boolean;
  isRecording: boolean;
  isStreaming: boolean;
  desktopOnline: boolean;
}

export interface VoiceOption {
  id: string;
  label: string;
  elevenLabsId: string;
  kokoroId?: string;
  description: string;
  category?: 'jarvis' | 'kokoro' | 'standard';
}

export interface JarvisSettings {
  wakeName: string;
  wakeAliases: string[];
  wakeSensitivity: number;
  voice: string;
  voiceId: string;
  language: string;
  startOnBoot: boolean;
  alwaysListening: boolean;
  pushToTalk: boolean;
  clipDuration: number;
  clipFolder: string;
  obsWebsocketUrl: string;
  obsWebsocketPassword: string;
  inputDeviceId: string;
  outputDeviceId: string;
}

export interface ModeInfo {
  id: JarvisMode;
  label: string;
  description: string;
  icon: string;
}
