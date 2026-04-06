export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; card: string; accent: string };
  vars: Record<string, string>;
}

export interface AccentOption {
  id: string;
  name: string;
  hsl: string;
  preview: string; // hex for the swatch
}

export const accentOptions: AccentOption[] = [
  { id: 'cyan',    name: 'Cyan',    hsl: '199 89% 48%', preview: '#0ea5e9' },
  { id: 'blue',    name: 'Blue',    hsl: '217 91% 60%', preview: '#3b82f6' },
  { id: 'violet',  name: 'Violet',  hsl: '263 70% 58%', preview: '#8b5cf6' },
  { id: 'rose',    name: 'Rose',    hsl: '347 77% 50%', preview: '#e11d48' },
  { id: 'amber',   name: 'Amber',   hsl: '38 92% 50%',  preview: '#f59e0b' },
  { id: 'emerald', name: 'Emerald', hsl: '160 84% 39%', preview: '#10b981' },
  { id: 'orange',  name: 'Orange',  hsl: '25 95% 53%',  preview: '#f97316' },
  { id: 'pink',    name: 'Pink',    hsl: '330 81% 60%', preview: '#ec4899' },
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
];

const THEME_KEY = 'jarvis_theme';
const ACCENT_KEY = 'jarvis_accent';

export function loadThemePreference(): { presetId: string; accentId: string } {
  try {
    return {
      presetId: localStorage.getItem(THEME_KEY) || 'default',
      accentId: localStorage.getItem(ACCENT_KEY) || 'cyan',
    };
  } catch {
    return { presetId: 'default', accentId: 'cyan' };
  }
}

export function saveThemePreference(presetId: string, accentId: string) {
  try {
    localStorage.setItem(THEME_KEY, presetId);
    localStorage.setItem(ACCENT_KEY, accentId);
  } catch {}
}

export function applyTheme(presetId: string, accentId: string) {
  const preset = themePresets.find((p) => p.id === presetId) || themePresets[0];
  const accent = accentOptions.find((a) => a.id === accentId) || accentOptions[0];
  const root = document.documentElement;

  for (const [prop, value] of Object.entries(preset.vars)) {
    root.style.setProperty(prop, value);
  }

  // Apply accent to all accent-derived tokens
  root.style.setProperty('--primary', accent.hsl);
  root.style.setProperty('--accent', accent.hsl);
  root.style.setProperty('--ring', accent.hsl);
  root.style.setProperty('--sidebar-primary', accent.hsl);
  root.style.setProperty('--sidebar-ring', accent.hsl);

  saveThemePreference(presetId, accentId);
}