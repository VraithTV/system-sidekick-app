export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  light?: boolean;
  preview: { bg: string; card: string; accent: string };
  vars: Record<string, string>;
}

export interface AccentOption {
  id: string;
  name: string;
  hsl: string;
  preview: string; // hex for the swatch
}

export interface FontOption {
  id: string;
  name: string;
  heading: string;
  body: string;
}

export const fontOptions: FontOption[] = [
  { id: 'default',  name: 'Orbitron + Inter',   heading: "'Orbitron', sans-serif",      body: "'Inter', system-ui, sans-serif" },
  { id: 'rajdhani', name: 'Rajdhani + Inter',   heading: "'Rajdhani', sans-serif",      body: "'Inter', system-ui, sans-serif" },
  { id: 'mono',     name: 'JetBrains Mono',     heading: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace" },
  { id: 'system',   name: 'System Default',     heading: "system-ui, sans-serif",       body: "system-ui, sans-serif" },
];

export const accentOptions: AccentOption[] = [
  { id: 'cyan',    name: 'Cyan',    hsl: '199 89% 48%', preview: '#0ea5e9' },
  { id: 'blue',    name: 'Blue',    hsl: '217 91% 60%', preview: '#3b82f6' },
  { id: 'violet',  name: 'Violet',  hsl: '263 70% 58%', preview: '#8b5cf6' },
  { id: 'rose',    name: 'Rose',    hsl: '347 77% 50%', preview: '#e11d48' },
  { id: 'amber',   name: 'Amber',   hsl: '38 92% 50%',  preview: '#f59e0b' },
  { id: 'emerald', name: 'Emerald', hsl: '160 84% 39%', preview: '#10b981' },
  { id: 'orange',  name: 'Orange',  hsl: '25 95% 53%',  preview: '#f97316' },
  { id: 'pink',    name: 'Pink',    hsl: '330 81% 60%', preview: '#ec4899' },
  { id: 'red',     name: 'Red',     hsl: '0 72% 51%',   preview: '#ef4444' },
  { id: 'teal',    name: 'Teal',    hsl: '174 72% 40%', preview: '#14b8a6' },
  { id: 'lime',    name: 'Lime',    hsl: '84 81% 44%',  preview: '#84cc16' },
  { id: 'sky',     name: 'Sky',     hsl: '200 98% 60%', preview: '#38bdf8' },
];

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Midnight',
    description: 'The classic dark Jarvis look',
    preview: { bg: '#171b24', card: '#1e2230', accent: '#0ea5e9' },
    vars: {
      '--background': '220 16% 10%',
      '--card': '220 16% 13%',
      '--popover': '220 16% 13%',
      '--secondary': '220 14% 18%',
      '--muted': '220 12% 20%',
      '--muted-foreground': '215 12% 55%',
      '--border': '220 14% 20%',
      '--input': '220 14% 20%',
      '--sidebar-background': '220 16% 11%',
      '--sidebar-accent': '220 14% 17%',
      '--sidebar-border': '220 14% 18%',
    },
  },
  {
    id: 'abyss',
    name: 'Abyss',
    description: 'Deeper blacks, higher contrast',
    preview: { bg: '#0a0c10', card: '#10131a', accent: '#0ea5e9' },
    vars: {
      '--background': '222 25% 5%',
      '--card': '222 22% 8%',
      '--popover': '222 22% 8%',
      '--secondary': '222 18% 12%',
      '--muted': '222 16% 14%',
      '--muted-foreground': '218 14% 50%',
      '--border': '222 16% 14%',
      '--input': '222 16% 14%',
      '--sidebar-background': '222 25% 6%',
      '--sidebar-accent': '222 18% 11%',
      '--sidebar-border': '222 16% 12%',
    },
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    description: 'Warm grey tones, easy on the eyes',
    preview: { bg: '#1c1c1e', card: '#252527', accent: '#0ea5e9' },
    vars: {
      '--background': '240 4% 11%',
      '--card': '240 3% 14%',
      '--popover': '240 3% 14%',
      '--secondary': '240 3% 19%',
      '--muted': '240 3% 22%',
      '--muted-foreground': '240 4% 52%',
      '--border': '240 3% 20%',
      '--input': '240 3% 20%',
      '--sidebar-background': '240 4% 12%',
      '--sidebar-accent': '240 3% 17%',
      '--sidebar-border': '240 3% 18%',
    },
  },
  {
    id: 'steel',
    name: 'Steel',
    description: 'Cool blue-grey industrial palette',
    preview: { bg: '#151a22', card: '#1b2230', accent: '#0ea5e9' },
    vars: {
      '--background': '216 20% 11%',
      '--card': '216 22% 14%',
      '--popover': '216 22% 14%',
      '--secondary': '216 18% 19%',
      '--muted': '216 14% 22%',
      '--muted-foreground': '216 12% 52%',
      '--border': '216 16% 20%',
      '--input': '216 16% 20%',
      '--sidebar-background': '216 20% 12%',
      '--sidebar-accent': '216 18% 17%',
      '--sidebar-border': '216 16% 18%',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm dark tones with a reddish hue',
    preview: { bg: '#1a1210', card: '#231a17', accent: '#0ea5e9' },
    vars: {
      '--background': '15 18% 9%',
      '--card': '15 16% 12%',
      '--popover': '15 16% 12%',
      '--secondary': '15 12% 17%',
      '--muted': '15 10% 20%',
      '--muted-foreground': '15 10% 50%',
      '--border': '15 12% 18%',
      '--input': '15 12% 18%',
      '--sidebar-background': '15 18% 10%',
      '--sidebar-accent': '15 12% 15%',
      '--sidebar-border': '15 12% 16%',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep greens, nature-inspired',
    preview: { bg: '#0f1712', card: '#152018', accent: '#0ea5e9' },
    vars: {
      '--background': '140 18% 8%',
      '--card': '140 16% 10%',
      '--popover': '140 16% 10%',
      '--secondary': '140 12% 15%',
      '--muted': '140 10% 18%',
      '--muted-foreground': '140 10% 48%',
      '--border': '140 12% 16%',
      '--input': '140 12% 16%',
      '--sidebar-background': '140 18% 9%',
      '--sidebar-accent': '140 12% 13%',
      '--sidebar-border': '140 12% 14%',
    },
  },
  {
    id: 'light',
    name: 'Light',
    light: true,
    description: 'Clean bright mode for daytime use',
    preview: { bg: '#f8f9fb', card: '#ffffff', accent: '#0ea5e9' },
    vars: {
      '--background': '220 14% 96%',
      '--foreground': '220 16% 12%',
      '--card': '0 0% 100%',
      '--card-foreground': '220 16% 12%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '220 16% 12%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220 14% 92%',
      '--secondary-foreground': '220 16% 25%',
      '--muted': '220 12% 90%',
      '--muted-foreground': '220 10% 46%',
      '--accent-foreground': '0 0% 100%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '220 14% 88%',
      '--input': '220 14% 88%',
      '--sidebar-background': '220 14% 94%',
      '--sidebar-foreground': '220 16% 20%',
      '--sidebar-accent': '220 14% 90%',
      '--sidebar-accent-foreground': '220 16% 20%',
      '--sidebar-border': '220 14% 88%',
      '--sidebar-primary-foreground': '0 0% 100%',
    },
  },
  {
    id: 'snow',
    name: 'Snow',
    light: true,
    description: 'Ultra-minimal white on white',
    preview: { bg: '#ffffff', card: '#f4f5f7', accent: '#0ea5e9' },
    vars: {
      '--background': '0 0% 100%',
      '--foreground': '220 16% 15%',
      '--card': '220 10% 97%',
      '--card-foreground': '220 16% 15%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '220 16% 15%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220 10% 94%',
      '--secondary-foreground': '220 16% 30%',
      '--muted': '220 8% 92%',
      '--muted-foreground': '220 8% 50%',
      '--accent-foreground': '0 0% 100%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '220 10% 90%',
      '--input': '220 10% 90%',
      '--sidebar-background': '220 10% 98%',
      '--sidebar-foreground': '220 16% 20%',
      '--sidebar-accent': '220 10% 94%',
      '--sidebar-accent-foreground': '220 16% 20%',
      '--sidebar-border': '220 10% 90%',
      '--sidebar-primary-foreground': '0 0% 100%',
    },
  },
];

const THEME_KEY = 'jarvis_theme';
const ACCENT_KEY = 'jarvis_accent';
const FONT_KEY = 'jarvis_font';

export function loadThemePreference(): { presetId: string; accentId: string; fontId: string } {
  try {
    return {
      presetId: localStorage.getItem(THEME_KEY) || 'default',
      accentId: localStorage.getItem(ACCENT_KEY) || 'blue',
      fontId: localStorage.getItem(FONT_KEY) || 'default',
    };
  } catch {
    return { presetId: 'default', accentId: 'blue', fontId: 'default' };
  }
}

export function saveThemePreference(presetId: string, accentId: string, fontId: string) {
  try {
    localStorage.setItem(THEME_KEY, presetId);
    localStorage.setItem(ACCENT_KEY, accentId);
    localStorage.setItem(FONT_KEY, fontId);
  } catch {}
}

export function applyTheme(presetId: string, accentId: string, fontId: string = 'default') {
  const preset = themePresets.find((p) => p.id === presetId) || themePresets[0];
  const accent = accentOptions.find((a) => a.id === accentId) || accentOptions[0];
  const font = fontOptions.find((f) => f.id === fontId) || fontOptions[0];
  const root = document.documentElement;

  // Reset foreground vars to dark-mode defaults first (presets override if needed)
  root.style.setProperty('--foreground', '210 20% 90%');
  root.style.setProperty('--card-foreground', '210 20% 90%');
  root.style.setProperty('--popover-foreground', '210 20% 90%');
  root.style.setProperty('--primary-foreground', '220 16% 6%');
  root.style.setProperty('--secondary-foreground', '210 20% 85%');
  root.style.setProperty('--accent-foreground', '220 16% 6%');
  root.style.setProperty('--destructive-foreground', '210 40% 98%');
  root.style.setProperty('--sidebar-foreground', '210 20% 85%');
  root.style.setProperty('--sidebar-accent-foreground', '210 20% 85%');
  root.style.setProperty('--sidebar-primary-foreground', '220 16% 6%');

  for (const [prop, value] of Object.entries(preset.vars)) {
    root.style.setProperty(prop, value);
  }

  // Apply accent to all accent-derived tokens
  root.style.setProperty('--primary', accent.hsl);
  root.style.setProperty('--accent', accent.hsl);
  root.style.setProperty('--ring', accent.hsl);
  root.style.setProperty('--sidebar-primary', accent.hsl);
  root.style.setProperty('--sidebar-ring', accent.hsl);

  // Apply font
  root.style.setProperty('--font-heading', font.heading);
  root.style.setProperty('--font-body', font.body);
  document.body.style.fontFamily = font.body;

  saveThemePreference(presetId, accentId, fontId);
}