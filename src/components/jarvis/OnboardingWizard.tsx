import { useState, useEffect, useCallback } from 'react';
import { WindowControls } from './WindowControls';
import { JarvisLogo } from './JarvisLogo';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useJarvisStore } from '@/store/jarvisStore';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { commonApps, toAppShortcut, categoryLabels, categoryOrder } from '@/lib/commonApps';
import { getAppIcon } from '@/components/jarvis/AppIcons';
import { languages, getFlagUrl } from '@/lib/languages';
import { themePresets, accentOptions, applyTheme } from '@/lib/themes';
import { t } from '@/lib/i18n';
import { Mic, Volume2, Play, ChevronRight, ChevronLeft, Check, AppWindow, Cpu, ExternalLink, RefreshCw, Globe, Palette } from 'lucide-react';
import { playClick, playTick } from '@/lib/sounds';
import { isOllamaAvailable, resetOllamaStatus, getOllamaModel, listOllamaModels } from '@/lib/ollamaClient';

const ONBOARDING_KEY = 'jarvis_onboarding_complete';

export function useOnboarding() {
  const [complete, setComplete] = useState(() => {
    try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; }
  });
  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setComplete(true);
  }, []);
  return { complete, finish };
}

// Step indicator dots
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i === current
            ? 'w-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
            : i < current
            ? 'w-1.5 bg-primary/50'
            : 'w-1.5 bg-muted-foreground/20'
        }`}
      />
    ))}
  </div>
);

// ── Step 0: Welcome ──
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--primary)/0.2)_0%,transparent_70%)] scale-[2.5]" />
      <div className="relative w-28 h-28 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 shadow-[0_0_40px_hsl(var(--primary)/0.15)] overflow-hidden">
        <JarvisLogo size={72} className="text-primary rounded-full" />
      </div>
    </div>
    <h1 className="font-display text-2xl tracking-[0.15em] text-foreground mb-2">
      Welcome to <span className="text-primary glow-text">Jarvis AI</span>
    </h1>
    <p className="text-sm text-muted-foreground mb-1">Your intelligent desktop assistant</p>
    <span className="text-[10px] font-mono text-primary/50 tracking-widest mb-10">BETA</span>
    <button
      onClick={() => { playClick(); onNext(); }}
      className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300"
    >
      Get Started <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

// ── Step 1: Language Selection ──
const LanguageStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { settings, updateSettings } = useJarvisStore();
  const currentLang = settings.language || 'en';
  const tr = (key: string, vars?: Record<string, string>) => t(currentLang, key, vars);

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <Globe className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">
        {tr('onboard.language')}
      </h2>
      <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
        {tr('onboard.languageDesc')}
      </p>
      <div className="w-full max-w-sm space-y-1.5 mb-8 max-h-[320px] overflow-y-auto pr-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              playTick();
              updateSettings({ language: lang.code });
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              currentLang === lang.code
                ? 'bg-primary/10 border border-primary/25'
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              currentLang === lang.code ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/25'
            }`} />
            <img
              src={getFlagUrl(lang.countryCode, 40)}
              alt={lang.label}
              className="w-6 h-4 rounded-sm object-cover shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground/85">{lang.nativeLabel}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{tr(`lang.${lang.code}`)}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> {tr('onboard.back')}
        </button>
        <button
          onClick={() => { playClick(); onNext(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          {tr('onboard.continue')} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Step 2: Theme Selection ──
const ThemeStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [selectedAccent, setSelectedAccent] = useState('cyan');

  const handlePreset = (id: string) => {
    playTick();
    setSelectedPreset(id);
    applyTheme(id, selectedAccent);
  };

  const handleAccent = (id: string) => {
    playTick();
    setSelectedAccent(id);
    applyTheme(selectedPreset, id);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <Palette className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">Choose Your Theme</h2>
      <p className="text-xs text-muted-foreground mb-5 text-center max-w-xs">
        Pick a look and accent color. You can change these anytime in the Themes tab.
      </p>

      {/* Theme presets */}
      <div className="w-full max-w-sm mb-4">
        <p className="text-[10px] font-mono text-primary/50 tracking-[0.15em] uppercase mb-2">Theme</p>
        <div className="grid grid-cols-4 gap-2">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset.id)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all ${
                selectedPreset === preset.id
                  ? 'bg-primary/10 border border-primary/25'
                  : 'hover:bg-muted border border-transparent'
              }`}
            >
              <div className="w-full h-8 rounded-md flex overflow-hidden border border-border/50">
                <div className="flex-1" style={{ backgroundColor: preset.preview.bg }} />
                <div className="flex-1" style={{ backgroundColor: preset.preview.card }} />
                <div className="w-1.5" style={{ backgroundColor: preset.preview.accent }} />
              </div>
              <p className="text-[10px] text-foreground/70 truncate w-full text-center">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Accent colors */}
      <div className="w-full max-w-sm mb-8">
        <p className="text-[10px] font-mono text-primary/50 tracking-[0.15em] uppercase mb-2">Accent Color</p>
        <div className="flex flex-wrap gap-2">
          {accentOptions.map((accent) => (
            <button
              key={accent.id}
              onClick={() => handleAccent(accent.id)}
              className={`w-8 h-8 rounded-full transition-all ${
                selectedAccent === accent.id
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: accent.preview }}
              title={accent.name}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { playClick(); onNext(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Step 3: Ollama Detection ──
const OllamaStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [status, setStatus] = useState<'checking' | 'found' | 'not-found'>('checking');
  const [model, setModel] = useState('');
  const [modelCount, setModelCount] = useState(0);

  const check = useCallback(async () => {
    setStatus('checking');
    resetOllamaStatus();
    const available = await isOllamaAvailable();
    if (available) {
      setStatus('found');
      setModel(getOllamaModel());
      const models = await listOllamaModels();
      setModelCount(models.length);
    } else {
      setStatus('not-found');
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <Cpu className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">AI Engine</h2>
      <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
        Jarvis works out of the box with cloud AI. You can optionally add a local AI engine for offline use.
      </p>

      {/* Status card */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 mb-6">
        {status === 'checking' && (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-foreground/70">Checking for local AI engine...</p>
          </div>
        )}
        {status === 'found' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <p className="text-[13px] text-foreground/85 font-medium">Ollama is running</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-[11px] text-muted-foreground font-mono">Active model: <span className="text-primary">{model}</span></p>
              <p className="text-[11px] text-muted-foreground font-mono">{modelCount} model{modelCount !== 1 ? 's' : ''} installed</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Jarvis will use your local AI. Free, private, no internet needed.
            </p>
          </div>
        )}
        {status === 'not-found' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <p className="text-[13px] text-foreground/85">Using cloud AI (default)</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Jarvis is ready to go. Cloud AI handles all your requests over the internet.
            </p>

            <div className="border-t border-border/50 pt-3 space-y-3">
              <p className="text-[10px] text-primary/70 font-display tracking-wider uppercase">Optional: enable offline AI</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Want responses without internet? Follow these steps:
              </p>
              <ol className="text-[11px] text-muted-foreground leading-relaxed space-y-2 list-decimal list-inside">
                <li>Download and install <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ollama</a></li>
                <li>Run the installer and <strong className="text-foreground/70">wait for it to finish completely</strong></li>
                <li>Open a terminal and run: <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-[9px]">ollama pull llama3</code></li>
                <li>Click "Check again" below once Ollama is running</li>
              </ol>
              <button
                onClick={() => { playClick(); check(); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-muted-foreground text-[11px] hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Check again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { playClick(); onNext(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Step 4: Microphone ──
const MicStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { inputs, refresh } = useAudioDevices();
  const { settings, updateSettings } = useJarvisStore();

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <Mic className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">Select Microphone</h2>
      <p className="text-xs text-muted-foreground mb-8 text-center max-w-xs">
        Choose the microphone Jarvis will listen on. You can change this later in Settings.
      </p>
      <div className="w-full max-w-sm space-y-2 mb-8">
        {inputs.length === 0 && (
          <p className="text-[11px] text-muted-foreground/50 font-mono text-center">
            No microphones found. Grant permission or plug one in.
          </p>
        )}
        {inputs.map((d) => (
          <button
            key={d.deviceId}
            onClick={() => { playTick(); updateSettings({ inputDeviceId: d.deviceId }); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              settings.inputDeviceId === d.deviceId
                ? 'bg-primary/10 border border-primary/25'
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              settings.inputDeviceId === d.deviceId ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/25'
            }`} />
            <span className="text-[12px] text-foreground/80 truncate">{d.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { playClick(); onNext(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          {inputs.length === 0 ? 'Skip' : 'Continue'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Step 5: Output Device ──
const OutputStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { outputs, refresh } = useAudioDevices();
  const { settings, updateSettings } = useJarvisStore();

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <Volume2 className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">Select Speaker</h2>
      <p className="text-xs text-muted-foreground mb-8 text-center max-w-xs">
        Choose where Jarvis speaks. You can change this later in Settings.
      </p>
      <div className="w-full max-w-sm space-y-2 mb-8">
        {outputs.length === 0 && (
          <p className="text-[11px] text-muted-foreground/50 font-mono text-center">
            No output devices found
          </p>
        )}
        <button
          onClick={() => { playTick(); updateSettings({ outputDeviceId: '' }); }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
            !settings.outputDeviceId
              ? 'bg-primary/10 border border-primary/25'
              : 'hover:bg-muted border border-transparent'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            !settings.outputDeviceId ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/25'
          }`} />
          <span className="text-[12px] text-foreground/80">System Default</span>
        </button>
        {outputs.map((d) => (
          <button
            key={d.deviceId}
            onClick={() => { playTick(); updateSettings({ outputDeviceId: d.deviceId }); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              settings.outputDeviceId === d.deviceId
                ? 'bg-primary/10 border border-primary/25'
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              settings.outputDeviceId === d.deviceId ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/25'
            }`} />
            <span className="text-[12px] text-foreground/80 truncate">{d.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { playClick(); onNext(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Step 6: App Selection ──
const AppsStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { setApps } = useJarvisStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(['chrome', 'spotify', 'discord', 'obs']));
  const [search, setSearch] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    const apps = commonApps
      .filter((a) => selected.has(a.id))
      .map(toAppShortcut);
    setApps(apps);
    onNext();
  };

  const filtered = search
    ? commonApps.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.aliases.some((al) => al.includes(search.toLowerCase())))
    : commonApps;

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <AppWindow className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">Choose Your Apps</h2>
      <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
        Select apps you'd like Jarvis to open by voice. You can add more later.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search apps..."
        className="w-full max-w-sm mb-3 px-4 py-2.5 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
      />

      <div className="w-full max-w-sm space-y-1.5 mb-8 max-h-[280px] overflow-y-auto pr-1">
        {filtered.map((app) => {
          const Icon = getAppIcon(app.id);
          return (
          <button
            key={app.id}
            onClick={() => { playTick(); toggle(app.id); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              selected.has(app.id)
                ? 'bg-primary/10 border border-primary/25'
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
              selected.has(app.id)
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/30'
            }`}>
              {selected.has(app.id) && <Check className="w-3 h-3" />}
            </div>
            <Icon size={20} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground/85">{app.name}</p>
              <p className="text-[9px] text-muted-foreground/50 font-mono">{categoryLabels[app.category]}</p>
            </div>
          </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { playClick(); handleContinue(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Step 7: Voice Selection ──
const VoiceStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { settings, updateSettings } = useJarvisStore();
  const { previewVoice } = useVoiceAssistant({ previewOnly: true });
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handlePreview = async (id: string, elId: string) => {
    setPreviewing(id);
    await previewVoice(elId);
    setPreviewing(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">Choose a Voice</h2>
      <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
        Pick how Jarvis sounds. Chris is selected by default.
      </p>
      <div className="w-full max-w-sm space-y-1.5 mb-8 max-h-[320px] overflow-y-auto pr-1">
        {voiceOptions.map((v) => (
          <button
            key={v.id}
            onClick={() => { playTick(); updateSettings({ voice: v.id, voiceId: v.elevenLabsId }); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              settings.voice === v.id
                ? 'bg-primary/10 border border-primary/25'
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              settings.voice === v.id ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-muted-foreground/25'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground/85">{v.label}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{v.description}</p>
            </div>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
              onClick={(e) => { e.stopPropagation(); handlePreview(v.id, v.elevenLabsId); }}
              disabled={previewing !== null}
            >
              {previewing === v.id ? (
                <div className="w-3.5 h-3.5 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground font-display text-xs tracking-[0.15em] uppercase hover:bg-muted/40 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { playClick(); onNext(); }}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
        >
          Finish Setup <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Main Wizard ──
export const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const totalSteps = 8;

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col relative overflow-hidden">
      {/* Title bar at top */}
      <WindowControls />

      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.04)_0%,transparent_60%)]" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 flex-1 flex flex-col mx-auto items-center justify-center">
        <div className="flex-1 flex flex-col">
          {step === 0 && <WelcomeStep onNext={next} />}
          {step === 1 && <LanguageStep onNext={next} onBack={back} />}
          {step === 2 && <ThemeStep onNext={next} onBack={back} />}
          {step === 3 && <OllamaStep onNext={next} onBack={back} />}
          {step === 4 && <MicStep onNext={next} onBack={back} />}
          {step === 5 && <OutputStep onNext={next} onBack={back} />}
          {step === 6 && <AppsStep onNext={next} onBack={back} />}
          {step === 7 && <VoiceStep onNext={next} onBack={back} />}
        </div>

        {/* Step dots */}
        <div className="flex justify-center pb-8">
          <StepDots current={step} total={totalSteps} />
        </div>
      </div>
    </div>
  );
};
