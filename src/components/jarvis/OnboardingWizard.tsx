import { useState, useEffect, useCallback } from 'react';
import { JarvisLogo } from './JarvisLogo';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useJarvisStore } from '@/store/jarvisStore';
import { voiceOptions } from '@/lib/voices';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { commonApps, toAppShortcut } from '@/lib/commonApps';
import { getAppIcon } from '@/components/jarvis/AppIcons';
import { Mic, Volume2, Play, ChevronRight, Check, AppWindow } from 'lucide-react';
import { playClick, playTick } from '@/lib/sounds';

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
      <div className="relative w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
        <JarvisLogo size={48} className="text-primary" />
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

// ── Step 1: Microphone ──
const MicStep = ({ onNext }: { onNext: () => void }) => {
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
            No microphones found — grant permission or plug one in
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
      <button
        onClick={() => { playClick(); onNext(); }}
        className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
      >
        {inputs.length === 0 ? 'Skip' : 'Continue'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Step 2: Output Device ──
const OutputStep = ({ onNext }: { onNext: () => void }) => {
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
          onClick={() => updateSettings({ outputDeviceId: '' })}
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
            onClick={() => updateSettings({ outputDeviceId: d.deviceId })}
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
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Step 3: App Selection ──
const AppsStep = ({ onNext }: { onNext: () => void }) => {
  const { setApps } = useJarvisStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(['chrome', 'spotify', 'discord', 'obs']));

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

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="w-16 h-16 rounded-full border border-primary/25 flex items-center justify-center bg-primary/5 mb-6">
        <AppWindow className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg tracking-[0.12em] text-foreground mb-2">Choose Your Apps</h2>
      <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
        Select apps you'd like Jarvis to open by voice. Paths are auto-detected for Windows. You can add more later.
      </p>
      <div className="w-full max-w-sm space-y-1.5 mb-8 max-h-[300px] overflow-y-auto pr-1">
        {commonApps.map((app) => {
          const Icon = getAppIcon(app.id);
          return (
          <button
            key={app.id}
            onClick={() => toggle(app.id)}
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
            <p className="text-[13px] text-foreground/85">{app.name}</p>
          </button>
          );
        })}
      </div>
      <button
        onClick={handleContinue}
        className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Step 4: Voice Selection ──
const VoiceStep = ({ onNext }: { onNext: () => void }) => {
  const { settings, updateSettings } = useJarvisStore();
  const { previewVoice } = useVoiceAssistant();
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
            onClick={() => updateSettings({ voice: v.id, voiceId: v.elevenLabsId })}
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
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/30 text-primary font-display text-xs tracking-[0.15em] uppercase hover:bg-primary/10 transition-all duration-300"
      >
        Finish Setup <Check className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Main Wizard ──
export const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.04)_0%,transparent_60%)]" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          {step === 0 && <WelcomeStep onNext={next} />}
          {step === 1 && <MicStep onNext={next} />}
          {step === 2 && <OutputStep onNext={next} />}
          {step === 3 && <AppsStep onNext={next} />}
          {step === 4 && <VoiceStep onNext={next} />}
        </div>

        {/* Step dots */}
        <div className="flex justify-center pb-8">
          <StepDots current={step} total={totalSteps} />
        </div>
      </div>
    </div>
  );
};
